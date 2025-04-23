
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Notification } from '@/types';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  limit?: number;
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  limit,
}: NotificationListProps) {
  // If limit is provided, slice the notifications array
  const displayedNotifications = limit ? notifications.slice(0, limit) : notifications;
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-platformBlue">{unreadCount}</Badge>
          )}
        </div>
        {onMarkAllAsRead && unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs text-platformBlue hover:text-platformBlue-dark"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {displayedNotifications.length === 0 ? (
        <p className="text-gray-500 text-center py-4 text-sm">No notifications yet.</p>
      ) : (
        <div className="space-y-2">
          {displayedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-md ${
                notification.read ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-platformBlue'
              }`}
            >
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-800">{notification.title}</h4>
                <span className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              {!notification.read && onMarkAsRead && (
                <div className="mt-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="text-xs text-platformBlue hover:text-platformBlue-dark"
                  >
                    Mark as read
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {limit && notifications.length > limit && (
        <div className="text-center mt-2">
          <Button variant="link" className="text-platformBlue hover:text-platformBlue-dark">
            View all notifications
          </Button>
        </div>
      )}
    </div>
  );
}
