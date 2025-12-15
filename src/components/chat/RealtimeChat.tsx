import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, Users, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "teacher" | "student" | "parent";
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  read: boolean;
  attachments?: { name: string; url: string; type: string }[];
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    role: "teacher" | "student" | "parent";
    avatar?: string;
    online: boolean;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  type: "direct" | "group";
  name?: string;
}

const STORAGE_KEY = "lovable_chat_messages";

interface RealtimeChatProps {
  currentUserId?: string;
  currentUserRole?: "teacher" | "student" | "parent";
}

export function RealtimeChat({
  currentUserId = "t1",
  currentUserRole = "teacher"
}: RealtimeChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedConversation) {
      setMessages([]);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserRole === "teacher" ? "Mr. Adjei" : "You",
      senderRole: currentUserRole,
      content: newMessage,
      timestamp: new Date(),
      read: false,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Update last message in conversation
    setConversations(prev =>
      prev.map(c =>
        c.id === selectedConversation.id
          ? { ...c, lastMessage: message }
          : c
      )
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find(p => p.id !== currentUserId);
  };

  const roleColors = {
    teacher: "bg-tertiary text-tertiary-foreground",
    student: "bg-primary text-primary-foreground",
    parent: "bg-secondary text-secondary-foreground",
  };

  const filteredConversations = conversations.filter(c => {
    if (!searchQuery) return true;
    const otherParticipant = getOtherParticipant(c);
    return (
      (c.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-card rounded-xl border border-border overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredConversations.map((conv) => {
            const otherParticipant = getOtherParticipant(conv);
            const isSelected = selectedConversation?.id === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-muted/50 border-b border-border",
                  isSelected && "bg-muted"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    {conv.type === "group" ? (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                    ) : (
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className={roleColors[otherParticipant?.role || "student"]}>
                          {otherParticipant?.avatar || otherParticipant?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {otherParticipant?.online && conv.type === "direct" && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-foreground truncate">
                        {conv.type === "group" ? conv.name : otherParticipant?.name}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {conv.lastMessage && formatTime(conv.lastMessage.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage?.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-primary text-primary-foreground text-xs h-5 px-1.5">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                    {conv.type === "direct" && otherParticipant && (
                      <Badge variant="outline" className="mt-1 text-xs capitalize">
                        {otherParticipant.role}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedConversation.type === "group" ? (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              ) : (
                <Avatar className="w-10 h-10">
                  <AvatarFallback className={roleColors[getOtherParticipant(selectedConversation)?.role || "student"]}>
                    {getOtherParticipant(selectedConversation)?.avatar}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <h3 className="font-semibold text-foreground">
                  {selectedConversation.type === "group"
                    ? selectedConversation.name
                    : getOtherParticipant(selectedConversation)?.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedConversation.type === "group"
                    ? `${selectedConversation.participants.length} participants`
                    : getOtherParticipant(selectedConversation)?.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isOwn = message.senderId === currentUserId;
                const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId;

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 animate-fade-in",
                      isOwn && "flex-row-reverse"
                    )}
                  >
                    {showAvatar && !isOwn ? (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={cn("text-xs", roleColors[message.senderRole])}>
                          {message.senderName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8" />
                    )}
                    <div className={cn("max-w-[70%]", isOwn && "items-end")}>
                      {showAvatar && !isOwn && (
                        <p className="text-xs text-muted-foreground mb-1">{message.senderName}</p>
                      )}
                      <div
                        className={cn(
                          "px-4 py-2 rounded-2xl",
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className={cn(
                        "text-xs text-muted-foreground mt-1",
                        isOwn && "text-right"
                      )}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button variant="ghost" size="icon">
                <Smile className="w-5 h-5" />
              </Button>
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="font-semibold text-lg">Select a conversation</h3>
            <p className="text-sm">Choose a chat from the list to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
