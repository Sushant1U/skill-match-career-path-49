
import { useQuery } from '@tanstack/react-query';
import { Users } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { useNavigate } from 'react-router-dom';

export function ShortlistedStats() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: shortlistedCount = 0, isLoading } = useQuery({
    queryKey: ['employer-shortlisted-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      console.log("Fetching shortlisted count for employer:", user?.id);
      
      // First get all jobs for this employer
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('employer_id', user.id);
      
      if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
        throw jobsError;
      }
      
      if (!jobs || jobs.length === 0) {
        console.log("No jobs found for employer");
        return 0;
      }
      
      // Extract job IDs
      const jobIds = jobs.map(job => job.id);
      console.log("Found job IDs:", jobIds);
      
      // Now count shortlisted applications for these jobs
      const { count, error } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'shortlisted')
        .in('job_id', jobIds);
      
      if (error) {
        console.error("Error counting shortlisted applications:", error);
        throw error;
      }
      
      console.log("Shortlisted applications count:", count);
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000
  });

  const handleClick = () => {
    navigate('/employer/shortlisted');
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-7 w-12 bg-gray-300 rounded"></div>
          </div>
          <div className="p-3 bg-gray-50 rounded-full animate-pulse">
            <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Shortlisted</p>
          <p className="text-2xl font-bold">{shortlistedCount}</p>
        </div>
        <div className="p-3 bg-green-50 rounded-full">
          <Users className="h-6 w-6 text-green-500" />
        </div>
      </div>
    </div>
  );
}
