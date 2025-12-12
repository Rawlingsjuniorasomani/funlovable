import { useState } from "react";
import { Plus, Send, Bell, Users, GraduationCap, UserCheck, CheckCheck, Trash2, CreditCard, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAdminNotifications, AdminNotification } from "@/hooks/useAdminNotifications";
import { TeacherApprovalWorkflow } from "./TeacherApprovalWorkflow";
import { cn } from "@/lib/utils";

interface SentNotification {
  id: string;
  title: string;
  message: string;
  audience: string;
  sentAt: string;
  readCount: number;
}

const getNotificationIcon = (type: AdminNotification['type']) => {
  switch (type) {
    case 'new_parent': return Users;
    case 'new_subscription': return CreditCard;
    case 'new_payment': return CreditCard;
    case 'new_student': return GraduationCap;
    case 'new_teacher': return UserCheck;
    case 'teacher_approval': return UserCheck;
    default: return Bell;
  }
};

const getNotificationColor = (type: AdminNotification['type']) => {
  switch (type) {
    case 'new_parent': return 'text-violet-500 bg-violet-500/10';
    case 'new_subscription': return 'text-green-500 bg-green-500/10';
    case 'new_payment': return 'text-emerald-500 bg-emerald-500/10';
    case 'new_student': return 'text-blue-500 bg-blue-500/10';
    case 'new_teacher': return 'text-purple-500 bg-purple-500/10';
    case 'teacher_approval': return 'text-amber-500 bg-amber-500/10';
    default: return 'text-primary bg-primary/10';
  }
};

const getTypeLabel = (type: AdminNotification['type']) => {
  switch (type) {
    case 'new_parent': return 'Parent';
    case 'new_subscription': return 'Subscription';
    case 'new_payment': return 'Payment';
    case 'new_student': return 'Student';
    case 'new_teacher': return 'Teacher';
    case 'teacher_approval': return 'Approval';
    default: return 'System';
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export function AdminNotifications() {
  const { toast } = useToast();
  const { notifications: systemNotifications, markAsRead, markAllAsRead, clearNotifications, getUnreadCount } = useAdminNotifications();
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", message: "", audience: "all" });
  const [filter, setFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread'>('all');

  const handleSend = () => {
    if (!formData.title || !formData.message) return;
    const newNotification: SentNotification = {
      id: Date.now().toString(),
      title: formData.title,
      message: formData.message,
      audience: formData.audience,
      sentAt: new Date().toLocaleString(),
      readCount: 0,
    };
    setSentNotifications([newNotification, ...sentNotifications]);
    setFormData({ title: "", message: "", audience: "all" });
    setIsComposeOpen(false);
    toast({ title: "Notification Sent", description: "Your message has been sent to the selected audience." });
  };

  const audienceLabels: Record<string, string> = {
    all: "Everyone",
    parents: "All Parents",
    students: "All Students",
    teachers: "All Teachers",
  };

  const filteredNotifications = systemNotifications.filter(n => {
    const matchesType = filter === 'all' || n.type === filter;
    const matchesStatus = statusFilter === 'all' || !n.read;
    return matchesType && matchesStatus;
  });

  const unreadCount = getUnreadCount();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Notifications Center</h1>
          <p className="text-muted-foreground">Monitor platform activities and send announcements</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Badge variant="default" className="px-3 py-1">
              {unreadCount} unread
            </Badge>
          )}
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New Announcement</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Send Announcement</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Audience</Label>
                  <Select value={formData.audience} onValueChange={(v) => setFormData({ ...formData, audience: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all"><Users className="w-4 h-4 inline mr-2" /> Everyone</SelectItem>
                      <SelectItem value="parents"><Users className="w-4 h-4 inline mr-2" /> All Parents</SelectItem>
                      <SelectItem value="students"><GraduationCap className="w-4 h-4 inline mr-2" /> All Students</SelectItem>
                      <SelectItem value="teachers"><UserCheck className="w-4 h-4 inline mr-2" /> All Teachers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Title</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1" /></div>
                <div><Label>Message</Label><Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={4} className="mt-1" /></div>
                <Button onClick={handleSend} className="w-full"><Send className="w-4 h-4 mr-2" /> Send Announcement</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">
            Platform Activity
            {unreadCount > 0 && <Badge variant="destructive" className="ml-2 text-xs">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="approvals">Teacher Approvals</TabsTrigger>
          <TabsTrigger value="sent">Sent Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="new_parent">Parents</SelectItem>
                  <SelectItem value="new_subscription">Subscriptions</SelectItem>
                  <SelectItem value="new_payment">Payments</SelectItem>
                  <SelectItem value="new_student">Students</SelectItem>
                  <SelectItem value="teacher_approval">Approvals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>
                All ({systemNotifications.length})
              </Button>
              <Button variant={statusFilter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('unread')}>
                Unread ({unreadCount})
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />Mark all read
            </Button>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Notifications</h3>
              <p className="text-muted-foreground">Platform activities will appear here.</p>
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
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">{notification.title}</h4>
                            <Badge variant="outline" className="text-xs">{getTypeLabel(notification.type)}</Badge>
                            {!notification.read && <Badge variant="default" className="text-xs">New</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{notification.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" /><span>{formatTime(notification.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approvals">
          <TeacherApprovalWorkflow />
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {sentNotifications.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Announcements</h3>
              <p className="text-muted-foreground mb-4">Send your first announcement to users.</p>
              <Button onClick={() => setIsComposeOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Announcement</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sentNotifications.map((notification) => (
                <Card key={notification.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{notification.title}</CardTitle>
                      <span className="text-xs text-muted-foreground">{notification.sentAt}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Audience: {audienceLabels[notification.audience]}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
