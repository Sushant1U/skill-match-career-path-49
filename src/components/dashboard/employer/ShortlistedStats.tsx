
import { useQuery } from '@tanstack/react-query';
import { Users } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

export function ShortlistedStats() {
  const { user } = useAuth();
  
  const { data: shortlistedCount = 0, isLoading } = useQuery({
    queryKey: ['employer-shortlisted-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      // First get all jobs for this employer
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('employer_id', user.id);
      
      if (jobsError) throw jobsError;
      if (!jobs || jobs.length === 0) return 0;
      
      // Extract job IDs
      const jobIds = jobs.map(job => job.id);
      
      // Now count shortlisted applications for these jobs
      const { count, error } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'shortlisted')
        .in('job_id', jobIds);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000
  });

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
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
