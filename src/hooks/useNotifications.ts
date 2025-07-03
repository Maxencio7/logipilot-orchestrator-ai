// src/hooks/useNotifications.ts
import { useState, useCallback, useEffect } from 'react';
import { NotificationItem } from '@/types';
import * as api from '@/api/mockService';

export interface UseNotificationsReturn {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  fetchUserNotifications: (userRole: 'Admin' | 'Worker') => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userRole: 'Admin' | 'Worker') => Promise<void>;
}

// Assume a default user role for initial load or if not specified.
// In a real app, this would come from an auth context.
const DEFAULT_USER_ROLE = 'Worker'; // Or 'Admin', depending on common use case or if it's a personal dashboard

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const calculateUnreadCount = (items: NotificationItem[]): number => {
    return items.filter(n => !n.isRead).length;
  };

  const fetchUserNotifications = useCallback(async (userRole: 'Admin' | 'Worker') => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getNotifications(userRole);
      setNotifications(data);
      setUnreadCount(calculateUnreadCount(data));
    } catch (err: any) {
      setError(err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    // No separate loading state for this, could be added if needed
    try {
      const updatedNotification = await api.markNotificationAsRead(notificationId);
      if (updatedNotification) {
        setNotifications(prevNotifications => {
          const newNotifications = prevNotifications.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          );
          setUnreadCount(calculateUnreadCount(newNotifications));
          return newNotifications;
        });
      }
    } catch (err: any) {
      // Handle error (e.g., display a toast)
      console.error("Failed to mark notification as read:", err);
      // Optionally set error state: setError(err);
    }
  }, []);

  const markAllAsRead = useCallback(async (userRole: 'Admin' | 'Worker') => {
    setIsLoading(true); // Use main loading state for this bulk action
    setError(null);
    try {
      const updatedNotifications = await api.markAllNotificationsAsRead(userRole);
      setNotifications(updatedNotifications);
      setUnreadCount(calculateUnreadCount(updatedNotifications));
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Example: Initial fetch for a default role.
  // In a real app, you might call fetchUserNotifications explicitly when user role is known.
  useEffect(() => {
    // fetchUserNotifications(DEFAULT_USER_ROLE); // Commenting out for now, let the component using the hook decide when to fetch.
  }, [fetchUserNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchUserNotifications,
    markAsRead,
    markAllAsRead,
  };
};
