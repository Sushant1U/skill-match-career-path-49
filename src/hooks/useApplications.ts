
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Application, Student } from "@/types";
import { toast } from "@/components/ui/sonner";

export const useApplications = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['employer-applications', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log("Fetching applications for employer:", userId);
      
      // Get all jobs posted by this employer
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, company')
        .eq('employer_id', userId);
      
      if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
        throw jobsError;
      }
      
      if (!jobs || jobs.length === 0) {
        console.log("No jobs found for employer");
        return [];
      }
      
      const jobIds = jobs.map(job => job.id);
      console.log("Found job IDs:", jobIds);
      
      const jobDetailsMap = jobs.reduce((acc, job) => {
        acc[job.id] = { title: job.title, company: job.company };
        return acc;
      }, {} as Record<string, { title: string, company: string }>);
      
      // Fetch applications with student profiles in a single query - using JOIN syntax
      const { data: applicationsWithStudents, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          *,
          student:profiles(id, name, email, skills, location, resume_url, qualifications)
        `)
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });
      
      if (applicationsError) {
        console.error("Error fetching applications:", applicationsError);
        throw applicationsError;
      }
      
      if (!applicationsWithStudents) {
        console.log("No applications found");
        return [];
      }
      
      console.log("Raw applications data:", applicationsWithStudents);
      
      // Format the applications data for the UI
      return applicationsWithStudents.map(app => {
        const student = app.student;
        
        // Log each individual application for debugging
        console.log(`Processing application ${app.id}:`, {
          applicationResumeUrl: app.resume_url,
          studentResumeUrl: student?.resume_url,
          studentName: student?.name,
          studentData: student
        });
        
        return {
          id: app.id,
          jobId: app.job_id,
          studentId: app.student_id,
          status: app.status,
          createdAt: app.created_at,
          // Explicitly prioritize resume URLs
          resumeUrl: app.resume_url || (student?.resume_url || null),
          jobTitle: jobDetailsMap[app.job_id]?.title,
          jobCompany: jobDetailsMap[app.job_id]?.company,
          student: student ? {
            id: student.id,
            name: student.name || 'Anonymous',
            email: student.email || '',
            skills: student.skills || [],
            location: student.location || 'Unknown location',
            resumeUrl: student.resume_url || '',
            qualifications: student.qualifications || []
          } : undefined
        };
      });
    },
    refetchInterval: 30000,
    enabled: !!userId
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', applicationId);
      
      if (error) throw error;
      return { applicationId, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['employer-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['employer-shortlisted-count'] });
      toast.success(`Application ${data.status === 'shortlisted' ? 'shortlisted' : 'updated'}`);
    },
    onError: (error) => {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    }
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);
      
      if (error) throw error;
      return applicationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['employer-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['employer-shortlisted-count'] });
      toast.success('Application rejected and removed');
    },
    onError: (error) => {
      console.error('Error deleting application:', error);
      toast.error('Failed to reject application');
    }
  });

  return {
    applications,
    isLoading,
    updateStatus: (applicationId: string, status: string) => 
      updateStatusMutation.mutate({ applicationId, status }),
    deleteApplication: (applicationId: string) => 
      deleteApplicationMutation.mutate(applicationId)
  };
};
