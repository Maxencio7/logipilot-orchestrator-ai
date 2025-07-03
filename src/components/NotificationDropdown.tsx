// src/components/NotificationDropdown.tsx
import React, { useEffect, useRef } from 'react'; // Added useEffect, useRef
import { Link } from 'react-router-dom';
import { NotificationItem } from '@/types';
import { Button } from '@/components/ui/button';
import { BellRing, CheckCheck, Loader2, AlertTriangle, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils'; // For conditional class names

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void; // To close the dropdown, e.g., after navigation
  // userRole: 'Admin' | 'Worker'; // Needed for onMarkAllAsRead context if hook doesn't hold it
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  isLoading,
  error,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}) => {
  const markAllReadButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (unreadCount > 0 && markAllReadButtonRef.current) {
      // Delay focus slightly to ensure the element is fully rendered and visible
      // especially if the dropdown itself animates in (though it currently does not)
      setTimeout(() => markAllReadButtonRef.current?.focus(), 50);
    }
  }, [unreadCount, isLoading]); // Re-run if isLoading changes, to focus after loading finishes

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onClose(); // Close dropdown after click, whether it's a link or just marking as read
  };

  const getIconForType = (type: NotificationItem['type']) => {
    // Basic icons, can be expanded
    switch (type) {
      case 'NEW_WORKER_INPUT': return <BellRing className="w-4 h-4 text-blue-500" />;
      case 'INPUT_APPROVED': return <CheckCheck className="w-4 h-4 text-green-500" />;
      case 'INPUT_UNDER_REVIEW': return <BellRing className="w-4 h-4 text-yellow-500" />;
      case 'TASK_ASSIGNED': return <BellRing className="w-4 h-4 text-purple-500" />;
      default: return <BellRing className="w-4 h-4 text-slate-500" />;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading notifications...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-red-600">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <span className="font-semibold">Error loading notifications</span>
          <p className="text-xs text-center">{error.message}</p>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-slate-500">
          <Inbox className="w-12 h-12 mb-3 text-slate-400" />
          <span className="font-semibold">No notifications</span>
          <p className="text-xs">You're all caught up!</p>
        </div>
      );
    }

    return (
      <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={cn(
              'p-3 hover:bg-slate-50 transition-colors duration-150',
              !notification.isRead && 'bg-blue-50 hover:bg-blue-100'
            )}
          >
            <div onClick={() => handleNotificationClick(notification)} className="cursor-pointer">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5 mr-3">
                  {getIconForType(notification.type)}
                </div>
                <div className="flex-grow">
                  <p className={cn(
                      "text-sm text-slate-700",
                      !notification.isRead ? 'font-semibold' : 'font-normal'
                    )}
                  >
                    {notification.message}
                  </p>
                  {notification.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{notification.description}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="flex-shrink-0 ml-2 mt-0.5">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block" title="Unread"></span>
                  </div>
                )}
              </div>
              {notification.link && (
                <Link
                  to={notification.link}
                  className="mt-2 inline-block text-xs text-blue-600 hover:underline"
                  onClick={(e) => { e.stopPropagation(); handleNotificationClick(notification); /* Stop propagation to prevent double handling if parent div also handles click for marking as read */ }}
                >
                  View Details
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white border border-slate-200 rounded-md shadow-lg z-50">
      <div className="flex justify-between items-center p-3 border-b border-slate-200">
        <h3 className="text-base font-semibold text-slate-800">Notifications</h3>
        {unreadCount > 0 && !isLoading && ( // Also check isLoading here
          <Button
            ref={markAllReadButtonRef}
            variant="link"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs p-0 h-auto"
          >
            Mark all as read
          </Button>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export default NotificationDropdown;
