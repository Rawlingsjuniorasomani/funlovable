import { useEffect, useState } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const NOTIFICATION_PREFS_KEY = "lovable_notification_prefs";

interface NotificationPrefs {
  enabled: boolean;
  quizReminders: boolean;
  liveClassAlerts: boolean;
  achievementUnlocks: boolean;
  assignmentDue: boolean;
  messages: boolean;
}

const defaultPrefs: NotificationPrefs = {
  enabled: true,
  quizReminders: true,
  liveClassAlerts: true,
  achievementUnlocks: true,
  assignmentDue: true,
  messages: true,
};

export function usePushNotifications() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    
    

    
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const savePrefs = (newPrefs: NotificationPrefs) => {
    
    
    setPrefs(newPrefs);
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Your browser doesn't support notifications");
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      toast.success("Notifications enabled!");
      return true;
    } else {
      toast.error("Notification permission denied");
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === "granted" && prefs.enabled) {
      new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
    }
  };

  const notifyQuizReminder = (quizName: string, dueTime: string) => {
    if (prefs.quizReminders) {
      sendNotification("Quiz Reminder! 📝", {
        body: `Don't forget: "${quizName}" is due ${dueTime}`,
        tag: "quiz-reminder",
      });
    }
  };

  const notifyLiveClass = (className: string, startsIn: string) => {
    if (prefs.liveClassAlerts) {
      sendNotification("Live Class Starting! 🎓", {
        body: `"${className}" starts ${startsIn}`,
        tag: "live-class",
      });
    }
  };

  const notifyAchievement = (achievementName: string) => {
    if (prefs.achievementUnlocks) {
      sendNotification("Achievement Unlocked! 🏆", {
        body: `Congratulations! You earned "${achievementName}"`,
        tag: "achievement",
      });
    }
  };

  return {
    prefs,
    savePrefs,
    permission,
    requestPermission,
    sendNotification,
    notifyQuizReminder,
    notifyLiveClass,
    notifyAchievement,
  };
}

export function PushNotificationSettings() {
  const { prefs, savePrefs, permission, requestPermission } = usePushNotifications();

  const handleToggle = (key: keyof NotificationPrefs) => {
    savePrefs({ ...prefs, [key]: !prefs[key] });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          {prefs.enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Manage how you receive notifications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {permission !== "granted" && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                Enable browser notifications to get alerts even when the app is in the background.
              </p>
              <Button onClick={requestPermission} size="sm">
                Enable Browser Notifications
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enabled" className="text-base font-medium">
                All Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Master toggle for all notifications
              </p>
            </div>
            <Switch
              id="enabled"
              checked={prefs.enabled}
              onCheckedChange={() => handleToggle("enabled")}
            />
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quizReminders">Quiz Reminders</Label>
              <Switch
                id="quizReminders"
                checked={prefs.quizReminders}
                onCheckedChange={() => handleToggle("quizReminders")}
                disabled={!prefs.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="liveClassAlerts">Live Class Alerts</Label>
              <Switch
                id="liveClassAlerts"
                checked={prefs.liveClassAlerts}
                onCheckedChange={() => handleToggle("liveClassAlerts")}
                disabled={!prefs.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="achievementUnlocks">Achievement Unlocks</Label>
              <Switch
                id="achievementUnlocks"
                checked={prefs.achievementUnlocks}
                onCheckedChange={() => handleToggle("achievementUnlocks")}
                disabled={!prefs.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="assignmentDue">Assignment Due Dates</Label>
              <Switch
                id="assignmentDue"
                checked={prefs.assignmentDue}
                onCheckedChange={() => handleToggle("assignmentDue")}
                disabled={!prefs.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="messages">Messages</Label>
              <Switch
                id="messages"
                checked={prefs.messages}
                onCheckedChange={() => handleToggle("messages")}
                disabled={!prefs.enabled}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
