
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { JobCard } from '@/components/cards/JobCard';
import { Briefcase } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Job } from '@/types';

export function RecommendedJobsSection() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<string[]>([]);
  
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  useEffect(() => {
    if (profile?.skills) {
      setSkills(profile.skills);
    }
  }, [profile]);

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

  const recommendedJobs = jobs ? jobs
    .filter(job => job.skills.some(skill => skills.includes(skill)))
    .slice(0, 3) : [];

  return (
    <DashboardCard 
      title="Recommended For You" 
      icon={<Briefcase size={20} />}
      linkText="View All"
      linkUrl="/jobs/recommended"
    >
      {jobsLoading ? (
        <div className="py-6 text-center">Loading recommendations...</div>
      ) : jobsError ? (
        <div className="py-6 text-center text-red-500">Error loading recommendations</div>
      ) : recommendedJobs.length === 0 ? (
        <div className="py-6 text-center text-gray-500">
          Add skills to get job recommendations
        </div>
      ) : (
        <div className="space-y-4">
          {recommendedJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
