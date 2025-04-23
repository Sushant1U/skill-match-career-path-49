
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { JobCard } from "@/components/cards/JobCard";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Job } from "@/types";

export function JobPostingsSection() {
  const navigate = useNavigate();

  const { data: jobs = [], isLoading: isLoadingJobs, error: jobsError } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          applications_count:applications(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        skills: job.skills,
        qualifications: job.qualifications,
        employerId: job.employer_id,
        status: job.status as 'active' | 'closed',
        createdAt: job.created_at,
        applications: job.applications_count?.[0]?.count || 0
      })) as Job[];
    },
    refetchInterval: 30000 // Refetch every 30 seconds to keep data fresh
  });

  return (
    <DashboardCard 
      title="Job Postings" 
      icon={<Briefcase size={20} />}
      count={jobs.length}
      linkText="View All"
      linkUrl="/employer/jobs"
    >
      {isLoadingJobs ? (
        <div className="py-6 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : jobsError ? (
        <div className="py-6 text-center text-red-500">Error loading jobs</div>
      ) : jobs.length === 0 ? (
        <div className="py-6 text-center text-gray-500">
          You haven't posted any jobs yet. Click "Post New Job" to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.slice(0, 3).map(job => (
            <JobCard key={job.id} job={job} isEmployerView={true} />
          ))}
          {jobs.length > 3 && (
            <div className="text-center pt-2">
              <Button variant="link" onClick={() => navigate('/employer/jobs')}>
                View all {jobs.length} jobs
              </Button>
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
