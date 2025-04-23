
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
      
      // CRITICAL FIX: Perform two separate queries for better reliability
      // 1. First fetch all applications for these jobs
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });
      
      if (applicationsError) {
        console.error("Error fetching applications:", applicationsError);
        throw applicationsError;
      }
      
      if (!applicationsData || applicationsData.length === 0) {
        console.log("No applications found");
        return [];
      }

      console.log("Raw applications data before student fetch:", applicationsData);
      
      // 2. Then fetch all student profiles separately using the student_ids
      const studentIds = applicationsData.map(app => app.student_id).filter(Boolean);
      
      console.log("Student IDs to fetch:", studentIds);
      
      const { data: studentProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', studentIds);
      
      if (profilesError) {
        console.error("Error fetching student profiles:", profilesError);
        // Continue with what we have
      }
      
      console.log("Fetched student profiles:", studentProfiles);
      
      // Create a map for quick lookup
      const profilesMap = (studentProfiles || []).reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
      }, {} as Record<string, any>);
      
      // Format the applications data for the UI
      return applicationsData.map(app => {
        const studentProfile = profilesMap[app.student_id];
        
        console.log(`Processing application ${app.id}:`, {
          applicationResumeUrl: app.resume_url,
          studentId: app.student_id,
          studentProfile: studentProfile ? "Found" : "Not found",
          studentResumeUrl: studentProfile?.resume_url || null
        });
        
        return {
          id: app.id,
          jobId: app.job_id,
          studentId: app.student_id,
          status: app.status,
          createdAt: app.created_at,
          // Explicitly prioritize resume URLs
          resumeUrl: app.resume_url || (studentProfile?.resume_url || null),
          jobTitle: jobDetailsMap[app.job_id]?.title,
          jobCompany: jobDetailsMap[app.job_id]?.company,
          student: studentProfile ? {
            id: studentProfile.id,
            name: studentProfile.name || 'Anonymous',
            email: studentProfile.email || '',
            skills: studentProfile.skills || [],
            location: studentProfile.location || 'Unknown location',
            resumeUrl: studentProfile.resume_url || '',
            qualifications: studentProfile.qualifications || []
          } : null
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
