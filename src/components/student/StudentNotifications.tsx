import { useState, useEffect } from "react";
import { Bell, CheckCircle, Trash2, CheckCheck, BookOpen, Brain, Target, Video, Award, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'class': return BookOpen;
    case 'quiz': return Brain;
    case 'reminder': return Target;
    case 'achievement': return Award;
    case 'message': return MessageSquare;
    default: return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'class': return 'text-blue-500 bg-blue-500/10';
    case 'quiz': return 'text-purple-500 bg-purple-500/10';
    case 'reminder': return 'text-orange-500 bg-orange-500/10';
    case 'achievement': return 'text-yellow-500 bg-yellow-500/10';
    case 'message': return 'text-green-500 bg-green-500/10';
    default: return 'text-primary bg-primary/10';
  }
};

export function StudentNotifications() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll, unreadCount } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on your learning activities</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display text-xl font-semibold mb-2">
            {filter === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {filter === 'unread' 
              ? "You've read all your notifications. Great job staying on top of things!"
              : "Notifications about quizzes, assignments, and achievements will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);
            
            return (
              <Card
                key={notification.id}
                className={cn(
                  "border-border transition-colors hover:bg-muted/50 cursor-pointer",
                  !notification.read && "border-l-4 border-l-primary bg-primary/5"
                )}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", colorClass)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-foreground">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-0.5">{notification.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!notification.read && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{notification.time}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
