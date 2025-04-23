
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { JobCard } from '@/components/cards/JobCard';
import { Briefcase } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Job } from '@/types';
import { Spinner } from '@/components/ui/spinner';

export function AppliedJobsSection() {
  const { user } = useAuth();

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['student-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          job_id,
          status,
          created_at,
          jobs:job_id (*)
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!user?.id
  });

  const appliedJobs = applications?.map(app => ({
    id: app.jobs.id,
    title: app.jobs.title,
    company: app.jobs.company,
    location: app.jobs.location,
    description: app.jobs.description,
    skills: app.jobs.skills,
    qualifications: app.jobs.qualifications,
    employerId: app.jobs.employer_id,
    status: app.jobs.status as 'active' | 'closed',
    createdAt: app.jobs.created_at,
    applications: app.jobs.applications_count,
    applicationStatus: app.status
  })) || [];

  return (
    <DashboardCard 
      title="Applied Jobs" 
      icon={<Briefcase size={20} />}
      count={appliedJobs.length}
      linkText="View All"
      linkUrl="/my-applications"
    >
      {applicationsLoading ? (
        <div className="py-6 text-center">
          <Spinner size="md" />
        </div>
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
