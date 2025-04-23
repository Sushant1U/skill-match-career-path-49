
import { useQuery } from '@tanstack/react-query';
import { Briefcase, Users, BarChart3 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

export function DashboardStats() {
  const { user } = useAuth();

  // Fetch data directly from the database for accurate counts
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['employer-dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Get total jobs count
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, status')
        .eq('employer_id', user.id);
      
      if (jobsError) throw jobsError;
      
      // Get total applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .rpc('get_employer_applications_count', { employer_id: user.id });
      
      // If the RPC doesn't exist, fallback to a regular query
      let applicationsCount = 0;
      if (applicationsError) {
        console.error('Error fetching applications count:', applicationsError);
        // Fallback: query applications through jobs
        const jobIds = jobsData?.map(job => job.id) || [];
        if (jobIds.length > 0) {
          const { data, error } = await supabase
            .from('applications')
            .select('id')
            .in('job_id', jobIds);
          
          if (!error) {
            applicationsCount = data?.length || 0;
          }
        }
      } else {
        // Ensure applicationsData is treated as a number
        applicationsCount = typeof applicationsData === 'number' ? applicationsData : 0;
      }
      
      // Get response rate (non-pending applications / total applications)
      const { data: respondedData, error: respondedError } = await supabase
        .rpc('get_employer_responded_applications_count', { employer_id: user.id });
      
      let respondedCount = 0;
      if (respondedError) {
        console.error('Error fetching responded applications count:', respondedError);
        // Fallback: query responded applications through jobs
        const jobIds = jobsData?.map(job => job.id) || [];
        if (jobIds.length > 0) {
          const { data, error } = await supabase
            .from('applications')
            .select('id')
            .in('job_id', jobIds)
            .neq('status', 'pending');
          
          if (!error) {
            respondedCount = data?.length || 0;
          }
        }
      } else {
        // Ensure respondedData is treated as a number
        respondedCount = typeof respondedData === 'number' ? respondedData : 0;
      }
      
      return {
        totalJobs: jobsData?.length || 0,
        activeJobs: jobsData?.filter(job => job.status === 'active').length || 0,
        totalApplications: applicationsCount,
        responseRate: applicationsCount > 0 
          ? Math.round((respondedCount / applicationsCount) * 100)
          : 0
      };
    },
    enabled: !!user?.id,
    refetchInterval: 60000 // Refetch every minute to keep stats updated
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
        ))}
      </div>
    );
  }

  if (!dashboardStats) {
    return null;
  }

  const { totalJobs, activeJobs, totalApplications, responseRate } = dashboardStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Jobs</p>
            <p className="text-2xl font-bold">{totalJobs}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <Briefcase className="h-6 w-6 text-platformBlue" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Jobs</p>
            <p className="text-2xl font-bold">{activeJobs}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-full">
            <Briefcase className="h-6 w-6 text-green-500" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Applications</p>
            <p className="text-2xl font-bold">{totalApplications}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-full">
            <Users className="h-6 w-6 text-platformPurple" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Response Rate</p>
            <p className="text-2xl font-bold">{responseRate}%</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-full">
            <BarChart3 className="h-6 w-6 text-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
