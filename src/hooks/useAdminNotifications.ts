// Admin notifications hook for tracking new registrations, payments, and activities
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addNotification: (notification: Omit<AdminNotification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
  getUnreadByType: (type: AdminNotification['type']) => number;
  clearNotifications: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAdminNotifications = create<AdminNotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notification) => {
        const newNotification: AdminNotification = {
          ...notification,
          id: generateId(),
          read: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
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
    }),
    {
      name: 'admin-notifications',
    }
  )
);
