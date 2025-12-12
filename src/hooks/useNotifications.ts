import { useState, useEffect, useCallback } from "react";

export interface Notification {
  id: string;
  type: "message" | "quiz" | "class" | "achievement" | "reminder";
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const STORAGE_KEY = "lovable_notifications";

// Mock initial notifications
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "quiz",
    title: "Quiz Completed!",
    description: "You scored 9/10 on Fractions & Decimals",
    time: "2 minutes ago",
    read: false,
    actionUrl: "/student/quizzes",
  },
  {
    id: "2",
    type: "class",
    title: "Live Class Starting Soon",
    description: "Mathematics class starts in 30 minutes",
    time: "30 minutes ago",
    read: false,
    actionUrl: "/student/schedule",
  },
  {
    id: "3",
    type: "message",
    title: "New Message from Teacher",
    description: "Teacher sent you feedback on your assignment",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "4",
    type: "achievement",
    title: "Badge Earned! 🏆",
    description: "You earned the 'Math Whiz' badge",
    time: "2 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "reminder",
    title: "Assignment Due Tomorrow",
    description: "Science project submission deadline",
    time: "5 hours ago",
    read: true,
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      setNotifications(mockNotifications);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockNotifications));
    }
  }, []);

  const saveNotifications = useCallback((newNotifications: Notification[]) => {
    setNotifications(newNotifications);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotifications));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "time" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      time: "Just now",
      read: false,
    };
    saveNotifications([newNotification, ...notifications]);
    return newNotification;
  }, [notifications, saveNotifications]);

  const markAsRead = useCallback((id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const deleteNotification = useCallback((id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const clearAll = useCallback(() => {
    saveNotifications([]);
  }, [saveNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}
