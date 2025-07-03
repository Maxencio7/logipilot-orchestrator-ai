// src/hooks/useAlerts.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { NotificationAlert, ApiResponse } from '@/types';
import apiService from '@/api/apiService'; // Changed from mockService
import * as mockApi from '@/api/mockService'; // Keep for generateNewMockNotification if needed for simulation
import { toast } from 'sonner'; // Using sonner for toasts
import { BellRing, CheckCircle, Info, AlertTriangle as AlertTriangleIcon, XCircle } from 'lucide-react'; // Renamed to avoid conflict

export interface PaginationInfo { // If alerts endpoint is paginated
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages?: number;
}

export interface UseAlertsReturn {
  notifications: NotificationAlert[];
  pagination?: PaginationInfo | null; // Optional pagination
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


export const useAlerts = (pollInterval: number = 15000): UseAlertsReturn => {
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null); // If API paginates alerts
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async (showToastsForNew: boolean = false, page: number = 1, pageSize: number = 20) => {
    if (!showToastsForNew) setIsLoading(true);
    setError(null);
    try {
      const existingIds = new Set(notifications.map(n => n.id));
      const response = await apiService.get<ApiResponse<NotificationAlert[]>>('/alerts', {
        params: { page, pageSize, sortBy: 'timestamp', order: 'desc' } // Example params
      });

      const fetchedNotifications = response.data.data || [];
      setNotifications(fetchedNotifications);
      setPagination(response.data.pagination || null);

      if (showToastsForNew) {
        const newAlerts = fetchedNotifications.filter(n => !existingIds.has(n.id) && !n.read);
        newAlerts.forEach(alert => {
          const { icon } = getToastOptions(alert);
          toast(alert.title, {
            description: alert.description,
            icon: icon,
            action: alert.link ? { label: "View", onClick: () => { /* TODO: navigate(alert.link) */ console.log("Navigate to:", alert.link); } } : undefined,
          });
        });
      }
    } catch (err: any) {
      setError(err); // Axios error object
    } finally {
      if (!showToastsForNew) setIsLoading(false);
    }
  }, [notifications]); // notifications in dep array for existingIds check

  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    try {
      // API call to mark as read, e.g., PUT /alerts/:id/read
      await apiService.put(`/alerts/${notificationId}/read`);
    } catch (err: any) {
      console.error("Failed to mark notification as read on server:", err);
      // Revert optimistic update if API call fails
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
      );
      toast.error("Failed to mark notification as read.");
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const previouslyUnread = notifications.filter(n => !n.read);
    setNotifications(prev => prev.map(n => ({ ...n, read: true }))); // Optimistic
    try {
      // API call to mark all as read, e.g., POST /alerts/mark-all-read
      await apiService.post('/alerts/mark-all-read');
    } catch (err: any) {
      console.error("Failed to mark all notifications as read on server:", err);
      // Revert optimistic update
      setNotifications(prev => prev.map(n => previouslyUnread.find(un => un.id === n.id) ? {...n, read: false} : n ));
      toast.error("Failed to mark all notifications as read.");
    }
  }, [notifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(false);
  }, []); // Removed fetchNotifications from here to avoid re-triggering on notifications state change from polling

   // Polling for new alerts (can be replaced with WebSockets)
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const poll = async () => {
        console.log("useAlerts: Polling for new notifications from API...");
        try {
            // Fetch only new notifications or a small number of recent ones
            // This depends on how the backend /alerts endpoint is designed
            // For now, we'll refetch the first page and let the toast logic handle new ones.
            const response = await apiService.get<ApiResponse<NotificationAlert[]>>('/alerts', {
                params: { page: 1, pageSize: 20, sortBy: 'timestamp', order: 'desc' }
            });
            const fetchedNotifications = response.data.data || [];
            const existingIds = new Set(notifications.map(n => n.id));

            const newAlertsFound = fetchedNotifications.some(n => !existingIds.has(n.id));

            if (newAlertsFound) {
                 // Merge new and existing, then sort and update state to show new ones in dropdown
                setNotifications(prev => {
                    const all = [...prev];
                    fetchedNotifications.forEach(fn => {
                        if (!all.find(ex => ex.id === fn.id)) {
                            all.push(fn);
                        } else { // update existing if changed
                            const idx = all.findIndex(ex => ex.id === fn.id);
                            all[idx] = fn;
                        }
                    });
                    return all.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                });

                // Show toasts for genuinely new and unread alerts
                const trulyNewUnreadAlerts = fetchedNotifications.filter(n => !existingIds.has(n.id) && !n.read);
                trulyNewUnreadAlerts.forEach(alert => {
                    const { icon } = getToastOptions(alert);
                    toast(alert.title, {
                        description: alert.description,
                        icon: icon,
                        action: alert.link ? { label: "View", onClick: () => { /* TODO: navigate */ console.log("Navigate to:", alert.link); } } : undefined,
                    });
                });
            }
            // Also update pagination if it changed and we are displaying it
            if (response.data.pagination) {
                setPagination(response.data.pagination);
            }

        } catch (err) {
            console.error("Error during polling for alerts:", err);
        }
    };

    intervalRef.current = setInterval(poll, pollInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pollInterval, notifications]); // `notifications` is needed to check existingIds correctly

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    pagination, // if you decide to use it
    unreadCount,
    isLoading,
    error,
    fetchNotifications: () => fetchNotifications(false, 1, 20), // Default params for manual refresh
    markAsRead,
    markAllAsRead,
  };
};
