
import { useEffect } from "react";
import { Users } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useApplications } from "@/hooks/useApplications";
import { ApplicationItem } from "./ApplicationItem";
import { useResumeStorage } from "@/hooks/useResumeStorage";

export function RecentApplicationsSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { isChecking } = useResumeStorage();

  useEffect(() => {
    // Set up realtime subscription for applications changes
    const channel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications'
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
          queryClient.invalidateQueries({ queryKey: ['employer-dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['employer-shortlisted-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { 
    applications, 
    isLoading, 
    updateStatus,
    deleteApplication
  } = useApplications(user?.id);

  console.log("Applications in RecentApplicationsSection:", applications);

  const handleShortlist = (applicationId: string) => {
    updateStatus(applicationId, 'shortlisted');
  };

  const handleReject = (applicationId: string) => {
    deleteApplication(applicationId);
  };

  return (
    <DashboardCard 
      title="Recent Applicants" 
      icon={<Users size={20} />}
      linkText="View All Candidates"
      linkUrl="/employer/applicants"
    >
      {isLoading || isChecking ? (
        <div className="py-6 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : applications.length === 0 ? (
        <div className="py-6 text-center text-gray-500">
          No applications received yet.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(application => (
            <ApplicationItem
              key={application.id}
              application={application}
              onShortlist={handleShortlist}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
