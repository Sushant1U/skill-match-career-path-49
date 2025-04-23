
import { useEffect, useState } from 'react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchNotificationsForUser } from '@/services/applications';
import { useQuery } from '@tanstack/react-query';
import { Notification } from '@/types';

export function NotificationsSection() {
  const { user } = useAuth();

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
      const { error } = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      }).then(res => res.json());

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const { error } = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      }).then(res => res.json());

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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
