// src/hooks/useAlerts.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { NotificationAlert } from '@/types';
import * as api from '@/api/mockService';
import { toast } from 'sonner'; // Using sonner for toasts
import { BellRing, CheckCircle, Info, AlertTriangle as AlertTriangleIcon, XCircle } from 'lucide-react'; // Renamed to avoid conflict

export interface UseAlertsReturn {
  notifications: NotificationAlert[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

// Helper to get toast icon and style based on severity
const getToastOptions = (alert: NotificationAlert) => {
  let icon = <Info className="w-5 h-5" />;
  let style: React.CSSProperties = {};

  switch (alert.severity) {
    case 'Error':
    case 'Critical':
      icon = <XCircle className="w-5 h-5 text-red-500" />;
      style = { borderColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' };
      break;
    case 'High':
      icon = <AlertTriangleIcon className="w-5 h-5 text-orange-500" />; // Use renamed import
      style = { borderColor: 'hsl(var(--warning))', color: 'hsl(var(--warning-foreground))' }; // Assuming a warning style
      break;
    case 'Success':
      icon = <CheckCircle className="w-5 h-5 text-green-500" />;
      style = { borderColor: 'hsl(var(--success))', color: 'hsl(var(--success-foreground))' }; // Assuming a success style
      break;
    case 'Info':
    case 'Medium':
    case 'Low':
    default:
      icon = <BellRing className="w-5 h-5 text-blue-500" />;
      style = { borderColor: 'hsl(var(--info))', color: 'hsl(var(--info-foreground))' }; // Assuming an info style
      break;
  }
  return { icon, style };
};


export const useAlerts = (pollInterval: number = 15000): UseAlertsReturn => { // Poll every 15 seconds for new mock alerts
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async (showToastsForNew: boolean = false) => {
    if(!showToastsForNew) setIsLoading(true); // Only show global loading on initial manual fetch
    setError(null);
    try {
      const existingIds = new Set(notifications.map(n => n.id));
      const data = await api.getNotifications();
      setNotifications(data);

      if (showToastsForNew) {
        const newAlerts = data.filter(n => !existingIds.has(n.id) && !n.read);
        newAlerts.forEach(alert => {
          const { icon, style } = getToastOptions(alert);
          toast(alert.title, {
            description: alert.description,
            icon: icon,
            // style: style, // Sonner might not support style prop directly like this, uses classes or preset types
            // Instead, we can use severity for sonner types if available or just rely on icon
            // For now, let's keep it simple
            action: alert.link ? { label: "View", onClick: () => console.log("Navigate to:", alert.link) } : undefined,
          });
        });
      }
    } catch (err: any) {
      setError(err);
    } finally {
      if(!showToastsForNew) setIsLoading(false);
    }
  }, [notifications]); // Include notifications in dependency array for existingIds check

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err: any) {
      console.error("Failed to mark notification as read:", err);
      // Optionally show a toast error
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err: any) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(false);
  }, [fetchNotifications]); // fetchNotifications is stable due to useCallback

  // Simulate receiving new alerts (e.g., via WebSockets)
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current); // Clear existing interval

    intervalRef.current = setInterval(async () => {
      console.log("useAlerts: Polling for new mock notifications...");
      // Simulate a chance of a new notification appearing
      if (Math.random() < 0.3) { // 30% chance to generate a new alert
        api.generateNewMockNotification(); // This adds to the mock DB
        await fetchNotifications(true); // Fetch all and show toasts for new ones
      } else {
        // Or just fetch to see if any were marked read elsewhere, etc.
        // For a simple mock, we only care about generating new ones.
        // In a real scenario, WebSocket would push, or polling would get latest state.
      }
    }, pollInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pollInterval, fetchNotifications]); // Re-run if pollInterval or fetchNotifications changes

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications: () => fetchNotifications(false), // Expose a version that doesn't show toasts
    markAsRead,
    markAllAsRead,
  };
};
