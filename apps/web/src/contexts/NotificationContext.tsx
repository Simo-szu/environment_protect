'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userApi } from '@/lib/api';
import type { NotificationItem } from '@/lib/api/user';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  unreadCount: number;
  notifications: NotificationItem[];
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载通知
  const loadNotifications = useCallback(async () => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);
      const result = await userApi.getMyNotifications({ page: 1, size: 20 });
      setNotifications(result.items);
      const unread = result.items.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // 初始化加载
  useEffect(() => {
    if (isLoggedIn) {
      loadNotifications();
    } else {
      setUnreadCount(0);
      setNotifications([]);
    }
  }, [isLoggedIn, loadNotifications]);

  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      await userApi.markNotificationsRead({ notificationIds });
      // 更新本地状态
      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id) ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await userApi.markNotificationsRead({ markAllAsRead: true });
      // 更新本地状态
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        loading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
