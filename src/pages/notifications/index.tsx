
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { Bell } from 'lucide-react';
import { fetchNotificationsForUser } from '@/services/applications';
import { Notification } from '@/types';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id, filter],
    queryFn: async () => {
      if (!user?.id) return [];
      const allNotifications = await fetchNotificationsForUser(user.id);
      return filter === 'all' 
        ? allNotifications 
        : allNotifications.filter(n => !n.read);
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
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id, filter] });
      toast.success('Notification removed');
      
      // Also invalidate the dashboard notifications
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id, filter] });
      toast.success('All notifications removed');
      
      // Also invalidate the dashboard notifications
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    } catch (error) {
      console.error('Error removing all notifications:', error);
      toast.error('Failed to remove notifications');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar userRole={user?.role as any} />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Bell className="h-6 w-6 mr-2 text-platformBlue" />
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex gap-4 mb-6">
              <button 
                className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-platformBlue text-white' : 'bg-gray-100'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${filter === 'unread' ? 'bg-platformBlue text-white' : 'bg-gray-100'}`}
                onClick={() => setFilter('unread')}
              >
                Unread
              </button>
            </div>

            {isLoading ? (
              <div className="py-10 flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : (
              <NotificationList 
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllNotificationsAsRead}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
