import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, MoreVertical, Trash2, Pin, Ban, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { socket, connectSocket } from "@/services/socket";
import { cn } from "@/lib/utils";

interface ChatMessage {
    id: string;
    sender_id: string;
    sender_name: string;
    sender_role: string;
    message: string;
    message_type: 'chat' | 'question' | 'announcement';
    is_pinned: boolean;
    created_at: string;
}

interface ChatSettings {
    chat_enabled: boolean;
    questions_only_mode: boolean;
}

interface LiveClassChatProps {
    liveClassId: string;
    userId: string;
    userRole: string;
    userName: string;
}

export function LiveClassChat({ liveClassId, userId, userRole, userName }: LiveClassChatProps) {
    const { toast } = useToast();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [settings, setSettings] = useState<ChatSettings>({ chat_enabled: true, questions_only_mode: false });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isTeacher = userRole === 'teacher' || userRole === 'admin';

    useEffect(() => {
        // Connect Socket
        connectSocket();

        // Join Chat
        socket.emit('join-chat', { liveClassId });

        // Listeners
        socket.on('chat-history', (history: ChatMessage[]) => {
            setMessages(history);
        });

        socket.on('new-message', (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on('chat-settings', (newSettings: ChatSettings) => {
            if (newSettings) setSettings(newSettings);
        });

        socket.on('chat-settings-updated', (newSettings: ChatSettings) => {
            setSettings(prev => ({ ...prev, ...newSettings }));
            toast({ title: "Chat Settings Updated" });
        });

        socket.on('message-deleted', ({ messageId }: { messageId: string }) => {
            setMessages(prev => prev.filter(m => m.id !== messageId));
        });

        socket.on('message-pinned', ({ messageId, isPinned }: { messageId: string, isPinned: boolean }) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_pinned: isPinned } : m));
        });

        socket.on('chat-error', (err: { message: string }) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        });

        return () => {
            socket.off('chat-history');
            socket.off('new-message');
            socket.off('chat-settings');
            socket.off('chat-settings-updated');
            socket.off('message-deleted');
            socket.off('message-pinned');
            socket.off('chat-error');
        };
    }, [liveClassId, toast]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (type: 'chat' | 'question' = 'chat') => {
        if (!newMessage.trim()) return;

        socket.emit('send-message', {
            liveClassId,
            message: newMessage,
            messageType: type
        });
        setNewMessage("");
    };

    const handleModAction = (action: string, targetId?: string, value?: any) => {
        if (!isTeacher) return;
        socket.emit('mod-action', { action, liveClassId, targetId, value });
    };

    const pinnedMessages = messages.filter(m => m.is_pinned);

    return (
        <div className="flex flex-col h-full bg-card border-l border-border w-80 shadow-xl">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h3 className="font-semibold flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Live Chat
                </h3>
                {isTeacher && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Moderation</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleModAction('toggle-chat', undefined, !settings.chat_enabled)}>
                                {settings.chat_enabled ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                                {settings.chat_enabled ? "Disable Chat" : "Enable Chat"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleModAction('toggle-questions', undefined, !settings.questions_only_mode)}>
                                <Ban className="w-4 h-4 mr-2" />
                                {settings.questions_only_mode ? "Allow All Messages" : "Questions Only Mode"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Pinned Messages */}
            {pinnedMessages.length > 0 && (
                <div className="bg-primary/10 p-2 border-b border-primary/20">
                    {pinnedMessages.map(msg => (
                        <div key={msg.id} className="text-xs p-2 bg-background rounded border border-primary/20 mb-1 last:mb-0">
                            <div className="flex items-center gap-1 font-bold text-primary mb-1">
                                <Pin className="w-3 h-3" /> Pinned
                            </div>
                            <span className="font-medium">{msg.sender_name}: </span>
                            {msg.message}
                        </div>
                    ))}
                </div>
            )}

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm py-8">
                            No messages yet. Start the conversation!
                        </div>
                    )}

                    {messages.map((msg) => {
                        const isOwn = msg.sender_id === userId;
                        const isQuestion = msg.message_type === 'question';

                        return (
                            <div key={msg.id} className={cn("flex flex-col animate-fade-in group", isOwn && "items-end")}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-muted-foreground">{msg.sender_name}</span>
                                    {msg.sender_role === 'teacher' && (
                                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded">TEACHER</span>
                                    )}
                                </div>
                                <div className={cn(
                                    "px-3 py-2 rounded-lg text-sm max-w-[90%] break-words relative",
                                    isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                                    isQuestion && "border-2 border-orange-400 bg-orange-50 text-orange-900"
                                )}>
                                    {isQuestion && <span className="text-xs font-bold block text-orange-600 mb-1">QUESTION</span>}
                                    {msg.message}
                                </div>

                                {/* Teacher Actions */}
                                {isTeacher && !isOwn && (
                                    <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleModAction('delete-message', msg.id)}
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn("h-6 w-6 text-muted-foreground hover:text-primary", msg.is_pinned && "text-primary")}
                                            onClick={() => handleModAction('pin-message', msg.id, !msg.is_pinned)}
                                            title="Pin"
                                        >
                                            <Pin className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-background">
                {!settings.chat_enabled && !isTeacher ? (
                    <div className="text-center text-sm text-destructive font-medium p-2 bg-destructive/10 rounded">
                        Chat is currently disabled.
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Input
                            placeholder={settings.questions_only_mode && !isTeacher ? "Ask a question..." : "Type a message..."}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(settings.questions_only_mode && !isTeacher ? 'question' : 'chat')}
                            className="flex-1"
                            maxLength={200}
                        />
                        <Button
                            onClick={() => handleSendMessage(settings.questions_only_mode && !isTeacher ? 'question' : 'chat')}
                            disabled={!newMessage.trim()}
                            size="icon"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                )}
                {settings.questions_only_mode && !isTeacher && settings.chat_enabled && (
                    <p className="text-[10px] text-orange-600 mt-1 font-medium text-center">
                        Questions Only Mode Active
                    </p>
                )}
            </div>
        </div>
    );
}
