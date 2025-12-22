
import { create } from 'zustand';

import { notificationsAPI } from '@/config/api';

export interface AdminNotification {
  id: string;
  type: 'new_parent' | 'new_subscription' | 'new_payment' | 'new_student' | 'new_teacher' | 'teacher_approval';
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

interface AdminNotificationState {
  notifications: AdminNotification[];
  loadNotifications: () => Promise<void>;
  addNotification: (notification: Omit<AdminNotification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
  getUnreadByType: (type: AdminNotification['type']) => number;
  clearNotifications: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAdminNotifications = create<AdminNotificationState>()(
  (set, get: () => AdminNotificationState) => ({
    notifications: [],

    loadNotifications: async () => {
      try {
        
        const data = await notificationsAPI.getAll();

        if (!Array.isArray(data)) return;

        
        
        
        const mapped = data.map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          description: n.description,
          read: n.is_read,
          createdAt: n.created_at,
          relatedId: n.related_id
        }));
        set({ notifications: mapped });
      } catch (error) {
        const status = (error as any)?.response?.status;
        
        if (status === 401 || status === 403) return;
        console.error('Failed to load notifications:', error);
      }
    },

    addNotification: (notification) => {
      
      
    },

    markAsRead: async (id) => {
      try {
        await notificationsAPI.markAsRead(id);
        
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      } catch (e) {
        console.error(e);
      }
    },

    markAllAsRead: async () => {
      try {
        await notificationsAPI.markAllAsRead();
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      } catch (e) {
        console.error(e);
      }
    },

    getUnreadCount: () => {
      return get().notifications.filter((n) => !n.read).length;
    },

    getUnreadByType: (type) => {
      return get().notifications.filter((n) => !n.read && n.type === type).length;
    },

    clearNotifications: () => {
      set({ notifications: [] });
    },
  })
);
