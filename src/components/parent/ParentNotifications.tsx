import { useState } from "react";
import { Bell, CheckCircle, Clock, AlertTriangle, Info, Trash2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const mockNotifications = [
  {
    id: '1',
    type: 'alert',
    title: 'Assignment Due Tomorrow',
    message: 'Kwame has a Mathematics assignment due tomorrow at 5:00 PM.',
    time: '2 hours ago',
    read: false,
    child: 'Kwame',
  },
  {
    id: '2',
    type: 'success',
    title: 'Quiz Completed',
    message: 'Ama scored 95% on the English Grammar Quiz. Great job!',
    time: '5 hours ago',
    read: false,
    child: 'Ama',
  },
  {
    id: '3',
    type: 'info',
    title: 'Live Class Reminder',
    message: 'Science class with Dr. Owusu starts in 30 minutes.',
    time: '1 day ago',
    read: true,
    child: 'Kwame',
  },
  {
    id: '4',
    type: 'warning',
    title: 'Missed Class',
    message: 'Ama missed the Social Studies live class yesterday.',
    time: '2 days ago',
    read: true,
    child: 'Ama',
  },
  {
    id: '5',
    type: 'success',
    title: 'Badge Earned',
    message: 'Kwame earned the "Math Whiz" badge for scoring 90%+ on 5 quizzes!',
    time: '3 days ago',
    read: true,
    child: 'Kwame',
  },
  {
    id: '6',
    type: 'info',
    title: 'New Module Available',
    message: 'A new module "Advanced Fractions" is now available in Mathematics.',
    time: '4 days ago',
    read: true,
    child: 'All',
  },
];

const notificationSettings = [
  { id: 'quiz_reminders', label: 'Quiz Reminders', description: 'Get notified about upcoming quizzes', enabled: true },
  { id: 'assignment_due', label: 'Assignment Deadlines', description: 'Alerts when assignments are due', enabled: true },
  { id: 'live_class', label: 'Live Class Alerts', description: 'Reminders before live classes start', enabled: true },
  { id: 'achievements', label: 'Achievements', description: 'When your child earns badges or rewards', enabled: true },
  { id: 'progress_updates', label: 'Weekly Progress', description: 'Weekly summary of learning progress', enabled: false },
  { id: 'teacher_messages', label: 'Teacher Messages', description: 'Messages from teachers', enabled: true },
];

const typeConfig = {
  alert: { icon: Clock, color: 'text-primary bg-primary/10' },
  success: { icon: CheckCircle, color: 'text-secondary bg-secondary/10' },
  warning: { icon: AlertTriangle, color: 'text-destructive bg-destructive/10' },
  info: { icon: Info, color: 'text-tertiary bg-tertiary/10' },
};

export function ParentNotifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [settings, setSettings] = useState(notificationSettings);
  const [activeTab, setActiveTab] = useState<'all' | 'settings'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-primary">{unreadCount} new</Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Stay updated on your children's learning</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
          >
            <Bell className="w-4 h-4 mr-2" />
            All
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </Button>
        </div>
      </div>

      {activeTab === 'all' ? (
        <>
          {/* Actions */}
          {unreadCount > 0 && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            </div>
          )}

          {/* Notifications List */}
          <div className="space-y-3">
            {notifications.map((notification) => {
              const config = typeConfig[notification.type as keyof typeof typeConfig];
              const Icon = config.icon;

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "bg-card rounded-xl border p-4 transition-colors",
                    notification.read ? "border-border" : "border-primary bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", config.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={cn("font-semibold", !notification.read && "text-primary")}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button variant="ghost" size="icon" onClick={() => markAsRead(notification.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteNotification(notification.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{notification.child}</Badge>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {notifications.length === 0 && (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">No Notifications</h3>
              <p className="text-muted-foreground">You're all caught up!</p>
            </div>
          )}
        </>
      ) : (
        /* Settings Tab */
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-display font-semibold mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{setting.label}</p>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
                <Switch
                  checked={setting.enabled}
                  onCheckedChange={() => toggleSetting(setting.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
