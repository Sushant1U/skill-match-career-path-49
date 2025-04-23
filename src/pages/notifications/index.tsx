
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { Bell } from 'lucide-react';
import { fetchNotificationsForUser } from '@/services/applications';
import { Notification } from '@/types';
import { Spinner } from '@/components/ui/spinner';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

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
    // Implementation will be added in future updates
    console.log('Marking notification as read:', id);
  };

  const markAllNotificationsAsRead = async () => {
    // Implementation will be added in future updates
    console.log('Marking all notifications as read');
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
