// src/components/NotificationBell.tsx
import React from 'react';
import { Bell, CheckCheck, MailOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAlerts } from '@/hooks/useAlerts';
import { NotificationAlert } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils'; // For conditional class names

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useAlerts();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: NotificationAlert) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getSeverityBadge = (severity: NotificationAlert['severity']) => {
    switch (severity) {
      case 'Error':
      case 'Critical': return <Badge variant="destructive" className="capitalize text-xs">{severity}</Badge>;
      case 'High': return <Badge variant="warning" className="capitalize text-xs">{severity}</Badge>;
      case 'Success': return <Badge variant="success" className="capitalize text-xs">{severity}</Badge>;
      case 'Info':
      case 'Medium':
      case 'Low':
      default: return <Badge variant="info" className="capitalize text-xs">{severity}</Badge>;
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {notifications.length > 0 && unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markAllAsRead();}} className="text-xs h-auto py-0.5 px-1.5">
              <CheckCheck className="w-3 h-3 mr-1"/> Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px] md:h-[400px]">
          {isLoading && notifications.length === 0 ? (
            <DropdownMenuItem disabled className="flex items-center justify-center p-4">Loading...</DropdownMenuItem>
          ) : notifications.length === 0 ? (
            <DropdownMenuItem disabled className="flex flex-col items-center justify-center p-4 text-center">
               <MailOpen className="w-10 h-10 text-slate-400 mb-2"/>
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-slate-500">You're all caught up!</p>
            </DropdownMenuItem>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "flex flex-col items-start p-3 cursor-pointer hover:bg-slate-50",
                  !notification.read && "bg-blue-50 hover:bg-blue-100"
                )}
              >
                <div className="flex justify-between w-full items-center mb-1">
                    <span className={cn("font-semibold text-sm", !notification.read && "text-blue-700")}>{notification.title}</span>
                    {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>}
                </div>
                <p className="text-xs text-slate-600 mb-1 line-clamp-2">{notification.description}</p>
                <div className="flex justify-between w-full items-center text-xs text-slate-400">
                  <span>{new Date(notification.timestamp).toLocaleTimeString([], {day: '2-digit', month:'short', hour: '2-digit', minute: '2-digit'})}</span>
                  {getSeverityBadge(notification.severity)}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        {notifications.length > 5 && ( // Example: show a footer if many notifications
            <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-sm text-blue-600 hover:underline cursor-pointer"
                    onClick={() => navigate('/notifications')}>
                    {/* Assuming a /notifications page might exist later */}
                    View all notifications
                </DropdownMenuItem>
            </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
