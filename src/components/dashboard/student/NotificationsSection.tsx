
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchNotificationsForUser } from '@/services/applications';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Notification } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export function NotificationsSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return fetchNotificationsForUser(user.id, 3) as Promise<Notification[]>;
    },
    enabled: !!user?.id
  });

  const markNotificationAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      toast.success('Notification removed');
    } catch (error) {
      console.error('Error removing notification:', error);
      toast.error('Failed to remove notification');
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      if (!user?.id) return;

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      toast.success('All notifications removed');
    } catch (error) {
      console.error('Error removing all notifications:', error);
      toast.error('Failed to remove notifications');
    }
  };

  return (
    <DashboardCard 
      title="Notifications" 
      icon={<Bell size={20} />}
      linkText="View All"
      linkUrl="/notifications"
    >
      {isLoading ? (
        <div className="py-6 text-center">Loading notifications...</div>
      ) : error ? (
        <div className="py-6 text-center text-red-500">Error loading notifications</div>
      ) : (
        <NotificationList 
          notifications={notifications}
          onMarkAsRead={markNotificationAsRead}
          onMarkAllAsRead={markAllNotificationsAsRead}
          limit={3}
        />
      )}
    </DashboardCard>
  );
}
