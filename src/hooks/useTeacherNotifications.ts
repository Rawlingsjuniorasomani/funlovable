import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TeacherNotification {
  id: string;
  type: 'submission' | 'message' | 'student' | 'system' | 'live_class';
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface TeacherNotificationState {
  notifications: TeacherNotification[];
  addNotification: (notification: Omit<TeacherNotification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useTeacherNotifications = create<TeacherNotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: 't1',
          type: 'submission',
          title: 'New Assignment Submission',
          description: 'Kwame Asante submitted "Essay on Climate Change"',
          read: false,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          actionUrl: '/teacher/assignments',
        },
        {
          id: 't2',
          type: 'message',
          title: 'New Message from Parent',
          description: 'Mrs. Owusu sent you a message about her child\'s progress',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          actionUrl: '/teacher/messages',
        },
        {
          id: 't3',
          type: 'student',
          title: 'New Student Enrolled',
          description: 'Ama Mensah enrolled in your Mathematics class',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          actionUrl: '/teacher/students',
        },
        {
          id: 't4',
          type: 'live_class',
          title: 'Live Class Starting Soon',
          description: 'Your "Advanced Algebra" class starts in 30 minutes',
          read: false,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          actionUrl: '/teacher/live',
        },
      ],

      addNotification: (notification) => {
        const newNotification: TeacherNotification = {
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

      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAll: () => {
        set({ notifications: [] });
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },
    }),
    {
      name: 'teacher-notifications',
    }
  )
);
