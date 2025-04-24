
import { useNavigate } from 'react-router-dom';
import { Plus, Bell } from 'lucide-react'; 
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { useAuth } from '@/contexts/AuthContext';
import { fetchNotificationsForUser } from '@/services/applications';
import { JobPostingsSection } from '@/components/dashboard/employer/JobPostingsSection';
import { RecentApplicationsSection } from '@/components/dashboard/employer/RecentApplicationsSection';
import { DashboardStats } from '@/components/dashboard/employer/DashboardStats';
import { QuickActions } from '@/components/dashboard/employer/QuickActions';
import { CompanyProfileCard } from '@/components/dashboard/employer/CompanyProfileCard';
import { Notification } from '@/types';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['employer-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return fetchNotificationsForUser(user.id, 5) as Promise<Notification[]>;
    },
    enabled: !!user,
    refetchInterval: 60000 // Refetch every minute
  });

  const markNotificationAsRead = async (id: string) => {
    try {
      if (!user?.id) return;
      
      console.log('Removing notification with ID:', id);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Notification successfully deleted');
      
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['employer-notifications', user.id] });
      
      // Also invalidate the notifications page data
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id, 'unread'] });
      
      toast.success('Notification removed');
    } catch (error) {
      console.error('Error removing notification:', error);
      toast.error('Failed to remove notification');
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      if (!user?.id) return;
      
      console.log('Removing all notifications for user:', user.id);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('All notifications successfully deleted');
      
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['employer-notifications', user.id] });
      
      // Also invalidate the notifications page data
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id, 'unread'] });
      
      toast.success('All notifications removed');
    } catch (error) {
      console.error('Error removing all notifications:', error);
      toast.error('Failed to remove notifications');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar userRole="employer" />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Employer Dashboard</h1>
          <Button onClick={() => navigate('/new-job')}>
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <JobPostingsSection />
            <RecentApplicationsSection />
          </div>

          <div className="space-y-6">
            <CompanyProfileCard 
              user={user}
              company={user?.user_metadata?.company || ''}
              location={user?.user_metadata?.location || ''}
            />
            
            <DashboardCard 
              title="Notifications" 
              icon={<Bell size={20} />}
              linkText="View All"
              linkUrl="/notifications"
            >
              <NotificationList 
                notifications={notifications}
                limit={3}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllNotificationsAsRead}
              />
            </DashboardCard>

            <QuickActions />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
