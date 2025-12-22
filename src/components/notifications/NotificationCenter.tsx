import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, X, Check, CheckCheck, MessageSquare, Trophy, Calendar, Award, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const typeIcons = {
  message: MessageSquare,
  quiz: Trophy,
  class: Calendar,
  achievement: Award,
  reminder: Clock,
};

const typeColors = {
  message: "text-primary bg-primary/10",
  quiz: "text-secondary bg-secondary/10",
  class: "text-tertiary bg-tertiary/10",
  achievement: "text-star bg-star/10",
  reminder: "text-quaternary bg-quaternary/10",
};

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", className)}>
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-96 p-0" align="end">
        { }
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-display font-semibold text-foreground">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        { }
        <div className="max-h-96 overflow-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification, index) => {
                const Icon = typeIcons[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-muted/50 transition-colors cursor-pointer animate-fade-in relative group",
                      !notification.read && "bg-primary/5"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {notification.actionUrl ? (
                      <Link to={notification.actionUrl} className="block">
                        <NotificationContent notification={notification} Icon={Icon} />
                      </Link>
                    ) : (
                      <NotificationContent notification={notification} Icon={Icon} />
                    )}

                    { }
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        { }
        {notifications.length > 0 && (
          <div className="p-3 border-t border-border">
            <Button variant="ghost" size="sm" onClick={clearAll} className="w-full text-muted-foreground">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function NotificationContent({ notification, Icon }: { notification: Notification; Icon: React.ElementType }) {
  return (
    <div className="flex gap-3">
      <div className={cn("p-2 rounded-lg shrink-0", typeColors[notification.type])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("font-medium text-sm", !notification.read ? "text-foreground" : "text-muted-foreground")}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.description}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">{notification.time}</p>
      </div>
    </div>
  );
}
