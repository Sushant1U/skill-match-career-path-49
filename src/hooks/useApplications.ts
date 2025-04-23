
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
      
      // First get all jobs posted by this employer
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
      
      // First get all application IDs for this employer's jobs
      const { data: applicationsList, error: applicationsError } = await supabase
        .from('applications')
        .select('id, job_id, student_id, status, created_at, resume_url')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (applicationsError) {
        console.error("Error fetching applications:", applicationsError);
        throw applicationsError;
      }
      
      if (!applicationsList || applicationsList.length === 0) {
        console.log("No applications found");
        return [];
      }
      
      console.log("Raw applications data:", applicationsList);
      
      // Now fetch student profiles for these applications
      const studentIds = applicationsList.map(app => app.student_id).filter(Boolean);
      
      if (studentIds.length === 0) {
        console.log("No student IDs found in applications");
        return applicationsList.map(app => ({
          id: app.id,
          jobId: app.job_id,
          studentId: app.student_id,
          status: app.status,
          createdAt: app.created_at,
          resumeUrl: app.resume_url || '',
          jobTitle: jobDetailsMap[app.job_id]?.title,
          jobCompany: jobDetailsMap[app.job_id]?.company,
          student: {
            id: '',
            name: 'Anonymous',
            email: '',
            skills: [],
            location: 'Unknown location',
            resumeUrl: '',
            qualifications: []
          }
        }));
      }

      console.log("Fetching student profiles for IDs:", studentIds);
      
      const { data: studentProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', studentIds);
      
      if (profilesError) {
        console.error("Error fetching student profiles:", profilesError);
        throw profilesError;
      }
      
      console.log("Student profiles fetched:", studentProfiles);
      
      // Create a map of student profiles by ID for easy lookup
      const studentProfilesMap = studentProfiles?.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>) || {};
      
      // Format the data for consumption by the UI
      return applicationsList.map(app => {
        const studentProfile = app.student_id ? studentProfilesMap[app.student_id] : null;
        
        return {
          id: app.id,
          jobId: app.job_id,
          studentId: app.student_id,
          status: app.status,
          createdAt: app.created_at,
          resumeUrl: app.resume_url || (studentProfile?.resume_url || ''),
          jobTitle: jobDetailsMap[app.job_id]?.title,
          jobCompany: jobDetailsMap[app.job_id]?.company,
          student: studentProfile ? {
            id: studentProfile.id,
            name: studentProfile.name || 'Anonymous',
            email: studentProfile.email || '',
            skills: studentProfile.skills || [],
            location: studentProfile.location || 'Location not specified',
            resumeUrl: studentProfile.resume_url || '',
            qualifications: studentProfile.qualifications || []
          } : {
            id: app.student_id || '',
            name: 'Anonymous',
            email: '',
            skills: [],
            location: 'Unknown location',
            resumeUrl: '',
            qualifications: []
          }
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
