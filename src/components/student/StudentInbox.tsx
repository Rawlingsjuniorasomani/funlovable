import { useState, useEffect } from "react";
import { messagingAPI } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, MailOpen, Clock } from "lucide-react";
import { toast } from "sonner";

export function StudentInbox() {
    const [messages, setMessages] = useState<any[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const data = await messagingAPI.getInbox();
            setMessages(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMessage = async (message: any) => {
        setSelectedMessage(message);
        if (!message.is_read) {
            try {
                await messagingAPI.markAsRead(message.id);
                setMessages(prev => prev.map(m => m.id === message.id ? { ...m, is_read: true } : m));
            } catch (error) {
                console.error("Failed to mark as read:", error);
            }
        }
    };

    const unreadCount = messages.filter(m => !m.is_read).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold">Messages</h2>
                    <p className="text-muted-foreground">
                        {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-sm">Inbox</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[600px]">
                            {loading ? (
                                <div className="p-4 text-center text-muted-foreground">Loading...</div>
                            ) : messages.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No messages yet</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {messages.map((message) => (
                                        <button
                                            key={message.id}
                                            onClick={() => handleSelectMessage(message)}
                                            className={`w-full text-left p-4 hover:bg-accent transition-colors ${selectedMessage?.id === message.id ? 'bg-accent' : ''
                                                } ${!message.is_read ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        {message.is_read ? (
                                                            <MailOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                        ) : (
                                                            <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                        )}
                                                        <p className={`font-medium truncate ${!message.is_read ? 'font-bold' : ''}`}>
                                                            {message.sender_name}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-medium truncate mt-1">{message.subject}</p>
                                                    <p className="text-xs text-muted-foreground truncate mt-1">
                                                        {message.message.substring(0, 60)}...
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                                    {message.sender_role}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                                <Clock className="w-3 h-3" />
                                                {new Date(message.created_at).toLocaleDateString()}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm">Message Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedMessage ? (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold">{selectedMessage.subject}</h3>
                                        <Badge variant="outline">{selectedMessage.sender_role}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>From: {selectedMessage.sender_name}</span>
                                        <span>•</span>
                                        <span>{selectedMessage.sender_email}</span>
                                        <span>•</span>
                                        <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="border-t pt-4">
                                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Select a message to read</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
