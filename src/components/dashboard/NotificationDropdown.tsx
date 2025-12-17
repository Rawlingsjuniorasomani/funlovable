import { useState, useEffect } from "react";
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, FileText, MessageSquare, Video, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { notificationsAPI } from "@/config/api";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Reusing interface
interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    data?: any;
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'submission': return FileText;
        case 'message': return MessageSquare;
        case 'student': return Users;
        case 'live_class': return Video;
        case 'system': return Settings;
        case 'warning': return AlertTriangle;
        case 'success': return CheckCircle;
        case 'info': return Info;
        default: return Bell;
    }
};

const getNotificationColor = (type: string) => {
    switch (type) {
        case 'submission': return 'text-blue-500';
        case 'message': return 'text-green-500';
        case 'student': return 'text-purple-500';
        case 'live_class': return 'text-orange-500';
        case 'system': return 'text-gray-500';
        case 'warning': return 'text-yellow-500';
        case 'error': return 'text-red-500';
        default: return 'text-primary';
    }
};

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationsAPI.getMy();
            if (Array.isArray(data)) {
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    // Poll for notifications or fetch on open
    useEffect(() => {
        fetchNotifications();
        // Optional: Poll every 60s
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            await notificationsAPI.markAsRead(id);
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const markAllRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            // Using existing API helper which calls PUT /read-all
            await notificationsAPI.markAllAsRead();
            toast({ title: "All marked as read" });
        } catch (error) {
            // ignore or toast
        }
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            setNotifications(prev => prev.filter(n => n.id !== id));
            await notificationsAPI.delete(id);
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const clearAll = async () => {
        try {
            const current = [...notifications];
            setNotifications([]);
            await Promise.all(current.map(n => notificationsAPI.delete(n.id)));
            toast({ title: "Cleared all notifications" });
        } catch (error) {
            fetchNotifications();
        }
    };

    const handleNotificationClick = (notification: NotificationItem) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        // Navigate based on type/data if needed
        // For now, just close dropdown
        setIsOpen(false);

        if (notification.type === 'message') {
            navigate('/teacher/messages');
        } else if (notification.type === 'submission') {
            navigate('/teacher/assignments');
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 sm:w-96">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    <div className="flex gap-1">
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" title="Mark all read" onClick={markAllRead}>
                                <Check className="w-3.5 h-3.5" />
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" title="Clear all" onClick={clearAll}>
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        )}
                    </div>
                </div>
                <ScrollArea className="h-[300px]">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        <div className="grid">
                            {notifications.map((n) => {
                                const Icon = getNotificationIcon(n.type);
                                return (
                                    <DropdownMenuItem
                                        key={n.id}
                                        className={cn(
                                            "flex items-start gap-3 p-3 cursor-pointer focus:bg-muted/50",
                                            !n.is_read && "bg-primary/5 border-l-2 border-primary rounded-none"
                                        )}
                                        onClick={() => handleNotificationClick(n)}
                                    >
                                        <div className={cn("mt-1", getNotificationColor(n.type))}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={cn("text-sm leading-none", !n.is_read && "font-semibold")}>{n.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                            <p className="text-[10px] text-muted-foreground opacity-70">
                                                {new Date(n.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-1"
                                            onClick={(e) => deleteNotification(n.id, e)}
                                        >
                                            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                                        </Button>
                                    </DropdownMenuItem>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
