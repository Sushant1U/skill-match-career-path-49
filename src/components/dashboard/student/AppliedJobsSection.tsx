
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { JobCard } from '@/components/cards/JobCard';
import { Briefcase } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Job } from '@/types';

export function AppliedJobsSection() {
  const { data: jobs, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
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
        applications: job.applications_count
      })) as Job[];
    }
  });

  const appliedJobs = jobs ? jobs.slice(0, 2) : [];

  return (
    <DashboardCard 
      title="Applied Jobs" 
      icon={<Briefcase size={20} />}
      count={appliedJobs.length}
      linkText="View All"
      linkUrl="/my-applications"
    >
      {jobsLoading ? (
        <div className="py-6 text-center">Loading jobs...</div>
      ) : jobsError ? (
        <div className="py-6 text-center text-red-500">Error loading jobs</div>
      ) : appliedJobs.length === 0 ? (
        <div className="py-6 text-center text-gray-500">No job applications yet</div>
      ) : (
        <div className="space-y-4">
          {appliedJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
