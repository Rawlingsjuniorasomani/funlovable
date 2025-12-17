import { useEffect, useState } from "react";
import { Mail, Send, Search, Bell, User, Users, Plus, Circle, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Message } from "@/hooks/useMessageStore";
import { messagingAPI } from "@/config/api";

const typeIcons = {
  message: Mail,
  announcement: Bell,
  alert: Bell,
};

const typeColors = {
  message: "bg-primary/10 text-primary",
  announcement: "bg-accent/10 text-accent",
  alert: "bg-destructive/10 text-destructive",
};

export function TeacherMessages() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [allMessages, setAllMessages] = useState<Message[]>([]);

  // Load inbox from backend
  useEffect(() => {
    const loadMessages = async () => {
      if (!user) return;

      try {
        const [inbox, sent, announcements] = await Promise.all([
          messagingAPI.getInbox(),
          messagingAPI.getSent ? messagingAPI.getSent() : Promise.resolve([]), // Check if getSent exists in API
          messagingAPI.getAnnouncements ? messagingAPI.getAnnouncements() : Promise.resolve([])
        ]);

        const mapMessage = (m: any, source: 'inbox' | 'sent' | 'announcement') => ({
          id: String(m.id),
          from: String(m.sender_id || m.teacher_id), // sender_id for msg, teacher_id for announcement
          fromName: m.sender_name || m.teacher_name || (source === 'sent' ? 'Me' : 'Unknown'),
          to: String(m.recipient_id || (m.class_name ? `Class: ${m.class_name}` : 'all')),
          subject: m.subject || m.title || "(No subject)",
          content: m.message || m.content || "",
          type: (m.type || (source === 'announcement' ? 'announcement' : 'message')) as Message["type"],
          sentAt: m.created_at || new Date().toISOString(),
          read: !!m.is_read || (source === 'sent'), // Sent msgs read by default
        });

        const mappedInbox = (Array.isArray(inbox) ? inbox : []).map(m => mapMessage(m, 'inbox'));
        const mappedSent = (Array.isArray(sent) ? sent : []).map(m => mapMessage(m, 'sent'));
        const mappedAnnouncements = (Array.isArray(announcements) ? announcements : []).map(m => mapMessage(m, 'announcement'));

        const combined = [...mappedInbox, ...mappedSent, ...mappedAnnouncements];

        // Sort newest first
        combined.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        setAllMessages(combined);
      } catch (error) {
        console.error("Failed to load teacher messages:", error);
        toast({ title: "Failed to load messages", variant: "destructive" });
      }
    };

    loadMessages();
  }, [user, toast]);

  // Filter messages for current user
  const messages = allMessages.filter(m =>
    m.to === user?.id ||
    m.to === 'all' ||
    m.from === user?.id
  ).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [composeForm, setComposeForm] = useState({
    to: "",
    subject: "",
    content: "",
    type: "message" as Message["type"],
  });

  const unreadCount = messages.filter(m => !m.read && m.to === user?.id).length; // Use dynamic user ID
  const sentMessages = messages.filter(m => m.from === user?.id);
  const receivedMessages = messages.filter(m => m.to === user?.id || m.to === 'all');

  const filteredReceived = receivedMessages.filter(m =>
    m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.fromName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSend = async () => {
    if (!composeForm.subject || !composeForm.content || !user) return;

    const baseMessage: Omit<Message, "id" | "sentAt" | "read"> = {
      from: user.id,
      fromName: user.name,
      to: composeForm.to || "all",
      subject: composeForm.subject,
      content: composeForm.content,
      type: composeForm.type,
    };

    try {
      // For announcements / broadcasts, prefer the announcements endpoint
      if (composeForm.type !== "message" || composeForm.to === "all" || composeForm.to === "parents") {
        await messagingAPI.createAnnouncement({
          subject_id: undefined, // could be wired to a subject filter later
          class_name: undefined,
          title: baseMessage.subject,
          content: baseMessage.content,
          priority: composeForm.type === "alert" ? "high" : "normal",
        });
      } else {
        // Direct message to a specific recipient
        await messagingAPI.send({
          recipient_id: baseMessage.to,
          subject: baseMessage.subject,
          message: baseMessage.content,
        });
      }

      // Optimistically add to local list
      const newMessage: Message = {
        ...baseMessage,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sentAt: new Date().toISOString(),
        read: true,
      };
      setAllMessages(prev => [newMessage, ...prev]);

      toast({
        title: composeForm.type === "announcement" ? "Announcement sent" : "Message sent",
        description: `Your message has been sent successfully.`,
      });
      setIsComposeOpen(false);
      setComposeForm({ to: "", subject: "", content: "", type: "message" });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await messagingAPI.markAsRead(id);
      setAllMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

  const handleDelete = (id: string) => {
    // No backend delete endpoint yet; perform local delete only
    setAllMessages(prev => prev.filter(m => m.id !== id));
    setSelectedMessage(null);
    toast({ title: "Message deleted", variant: "destructive" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Messages</h2>
          <p className="text-muted-foreground">{unreadCount} unread messages</p>
        </div>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">To</label>
                  <Select value={composeForm.to} onValueChange={(v) => setComposeForm(prev => ({ ...prev, to: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="parents">All Parents</SelectItem>
                      <SelectItem value="s1">Kwame Asante</SelectItem>
                      <SelectItem value="s2">Ama Mensah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={composeForm.type} onValueChange={(v) => setComposeForm(prev => ({ ...prev, type: v as Message["type"] }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="message">Message</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Message subject"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={composeForm.content}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your message..."
                  className="mt-1 min-h-[150px]"
                />
              </div>
              <Button onClick={handleSend} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        {/* Message List */}
        <div className="lg:col-span-1 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="inbox" className="flex-1 flex flex-col">
            <TabsList className="w-full grid grid-cols-2 rounded-none border-b border-border">
              <TabsTrigger value="inbox" className="relative">
                Inbox
                {unreadCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="flex-1 overflow-auto m-0">
              <div className="divide-y divide-border">
                {filteredReceived.map((message) => {
                  const Icon = typeIcons[message.type];
                  return (
                    <button
                      key={message.id}
                      onClick={() => { setSelectedMessage(message); handleMarkRead(message.id); }}
                      className={cn(
                        "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                        selectedMessage?.id === message.id && "bg-muted/50",
                        !message.read && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", typeColors[message.type])}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={cn("font-medium truncate", !message.read && "text-foreground")}>
                              {message.fromName}
                            </span>
                            {!message.read && <Circle className="w-2 h-2 fill-primary text-primary shrink-0" />}
                          </div>
                          <p className="text-sm text-foreground truncate">{message.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(message.sentAt)}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="sent" className="flex-1 overflow-auto m-0">
              <div className="divide-y divide-border">
                {sentMessages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={cn(
                      "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                      selectedMessage?.id === message.id && "bg-muted/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        {message.to === "all" ? <Users className="w-4 h-4 text-muted-foreground" /> : <User className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">
                          To: {message.to === "all" ? "All Students" : message.to}
                        </p>
                        <p className="text-sm text-foreground truncate">{message.subject}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(message.sentAt)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{selectedMessage.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedMessage.from === "t1" ? `To: ${selectedMessage.to === "all" ? "All Students" : selectedMessage.to}` : `From: ${selectedMessage.fromName}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("capitalize", typeColors[selectedMessage.type])}>
                      {selectedMessage.type}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(selectedMessage.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{formatDate(selectedMessage.sentAt)}</p>
              </div>
              <div className="flex-1 p-6 overflow-auto">
                <p className="text-foreground whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
              {selectedMessage.from !== "t1" && (
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input placeholder="Type your reply..." className="flex-1" />
                    <Button>
                      <Send className="w-4 h-4 mr-2" />
                      Reply
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a message to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
