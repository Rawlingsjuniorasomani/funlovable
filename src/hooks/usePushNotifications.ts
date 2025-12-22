import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

export interface NotificationPrefs {
  enabled: boolean;
  quizReminders: boolean;
  liveClassAlerts: boolean;
  achievementUnlocks: boolean;
  assignmentDue: boolean;
  messages: boolean;
  parentUpdates: boolean;
  teacherAlerts: boolean;
  adminAlerts: boolean;
}

const defaultPrefs: NotificationPrefs = {
  enabled: true,
  quizReminders: true,
  liveClassAlerts: true,
  achievementUnlocks: true,
  assignmentDue: true,
  messages: true,
  parentUpdates: true,
  teacherAlerts: true,
  adminAlerts: true,
};

export function usePushNotifications() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  
  

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const savePrefs = useCallback((newPrefs: NotificationPrefs) => {
    
    setPrefs(newPrefs);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      toast.error("Your browser doesn't support notifications");
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      toast.success("Push notifications enabled!");
      return true;
    } else {
      toast.error("Notification permission denied");
      return false;
    }
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === "granted" && prefs.enabled) {
      try {
        const notification = new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        return notification;
      } catch (error) {
        console.error("Failed to send notification:", error);
      }
    }
    return null;
  }, [permission, prefs.enabled]);

  const notifyQuizReminder = useCallback((quizName: string, dueTime: string) => {
    if (prefs.quizReminders) {
      sendNotification("Quiz Reminder! 📝", {
        body: `Don't forget: "${quizName}" is due ${dueTime}`,
        tag: "quiz-reminder",
      });
    }
  }, [prefs.quizReminders, sendNotification]);

  const notifyLiveClass = useCallback((className: string, startsIn: string) => {
    if (prefs.liveClassAlerts) {
      sendNotification("Live Class Starting! 🎓", {
        body: `"${className}" starts ${startsIn}`,
        tag: "live-class",
      });
    }
  }, [prefs.liveClassAlerts, sendNotification]);

  const notifyAchievement = useCallback((achievementName: string) => {
    if (prefs.achievementUnlocks) {
      sendNotification("Achievement Unlocked! 🏆", {
        body: `Congratulations! You earned "${achievementName}"`,
        tag: "achievement",
      });
    }
  }, [prefs.achievementUnlocks, sendNotification]);

  const notifyMessage = useCallback((senderName: string, preview: string) => {
    if (prefs.messages) {
      sendNotification(`New Message from ${senderName}`, {
        body: preview.substring(0, 100),
        tag: "message",
      });
    }
  }, [prefs.messages, sendNotification]);

  const notifyAssignment = useCallback((assignmentName: string, dueDate: string) => {
    if (prefs.assignmentDue) {
      sendNotification("Assignment Due Soon! 📚", {
        body: `"${assignmentName}" is due ${dueDate}`,
        tag: "assignment",
      });
    }
  }, [prefs.assignmentDue, sendNotification]);

  const notifyParent = useCallback((childName: string, message: string) => {
    if (prefs.parentUpdates) {
      sendNotification(`Update about ${childName}`, {
        body: message,
        tag: "parent-update",
      });
    }
  }, [prefs.parentUpdates, sendNotification]);

  const notifyTeacher = useCallback((message: string) => {
    if (prefs.teacherAlerts) {
      sendNotification("Teacher Alert", {
        body: message,
        tag: "teacher-alert",
      });
    }
  }, [prefs.teacherAlerts, sendNotification]);

  const notifyAdmin = useCallback((message: string) => {
    if (prefs.adminAlerts) {
      sendNotification("Admin Alert", {
        body: message,
        tag: "admin-alert",
      });
    }
  }, [prefs.adminAlerts, sendNotification]);

  return {
    prefs,
    savePrefs,
    permission,
    requestPermission,
    sendNotification,
    notifyQuizReminder,
    notifyLiveClass,
    notifyAchievement,
    notifyMessage,
    notifyAssignment,
    notifyParent,
    notifyTeacher,
    notifyAdmin,
  };
}
