
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { Bell } from 'lucide-react';
import { useState } from 'react';
import type { Notification } from '@/types';

export function NotificationsSection() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      userId: '1',
      title: 'Application Status Update',
      message: 'Your application for Frontend Developer at Tech Co. has been reviewed.',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      userId: '1',
      title: 'New Job Match',
      message: 'We found a new job matching your skills: Full Stack Developer at DevCorp.',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  const markNotificationAsRead = (id: string) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  return (
    <DashboardCard 
      title="Notifications" 
      icon={<Bell size={20} />}
      linkText="View All"
      linkUrl="/notifications"
    >
      <NotificationList 
        notifications={notifications}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
        limit={3}
      />
    </DashboardCard>
  );
}
