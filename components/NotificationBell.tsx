"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/contexts/SocketContext';
import { useRouter } from '@/i18n/navigation';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  createdAt: Date;
  read: boolean;
}

export default function NotificationBell() {
  const router = useRouter();
  const { data: session } = useSession();
  const { isConnected } = useSocket();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${session?.user?.id}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.data?.filter((n: Notification) => !n.read).length || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session?.user?.id, fetchNotifications]);

  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const notification = event.detail as Notification;
      
      setNotifications(prev => [{
        ...notification,
        read: false,
      }, ...prev]);
      setUnreadCount(prev => prev + 1);

      if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
        new window.Notification(notification.title, {
          body: notification.message,
          icon: '/icon.png',
        });
      }
    };

    window.addEventListener('socket-notification' as any, handleNotification as any);

    return () => {
      window.removeEventListener('socket-notification' as any, handleNotification as any);
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setIsOpen(false);

    if (notification.type === 'EVENT_JOIN' && notification.data.eventId) {
      router.push(`/event/${notification.data.eventId}`);
    } else if (notification.type === 'EVENT_JOIN_REQUEST' && notification.data.eventId) {
      router.push(`/event/${notification.data.eventId}`);
    } else if (notification.type === 'EVENT_ACCEPTED' && notification.data.eventId) {
      router.push(`/event/${notification.data.eventId}`);
    } else if (notification.type === 'EVENT_REJECTED' && notification.data.eventId) {
      router.push(`/event/${notification.data.eventId}`);
    }
  };

  const clearAll = async () => {
    try {
      await fetch(`/api/notifications/clear?userId=${session?.user?.id}`, {
        method: 'POST',
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[500px] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Notifications</h3>
                <p className="text-xs text-gray-500">
                  {unreadCount} unread
                </p>
              </div>
              
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                      !notification.read ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notification.type === 'EVENT_JOIN' ? 'bg-green-100 text-green-600' :
                        notification.type === 'EVENT_JOIN_REQUEST' ? 'bg-blue-100 text-blue-600' :
                        notification.type === 'EVENT_ACCEPTED' ? 'bg-emerald-100 text-emerald-600' :
                        notification.type === 'EVENT_REJECTED' ? 'bg-red-100 text-red-600' :
                        notification.type === 'EVENT_LEAVE' ? 'bg-red-100 text-red-600' :
                        notification.type === 'MATCH_FOUND' ? 'bg-purple-100 text-purple-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {notification.type === 'EVENT_JOIN' ? '👋' :
                         notification.type === 'EVENT_JOIN_REQUEST' ? '🙋' :
                         notification.type === 'EVENT_ACCEPTED' ? '✅' :
                         notification.type === 'EVENT_REJECTED' ? '❌' :
                         notification.type === 'EVENT_LEAVE' ? '💨' :
                         notification.type === 'MATCH_FOUND' ? '💝' :
                         '📢'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {!notification.read && (
                        <div className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
