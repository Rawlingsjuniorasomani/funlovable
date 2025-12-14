import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
    id: string;
    from: string;
    fromName: string;
    to: string;
    subject: string;
    content: string;
    type: "message" | "announcement" | "alert";
    sentAt: string;
    read: boolean;
}

interface MessageStore {
    messages: Message[];
    sendMessage: (message: Omit<Message, 'id' | 'sentAt' | 'read'>) => void;
    markAsRead: (id: string) => void;
    deleteMessage: (id: string) => void;
    getMessagesForUser: (userId: string) => Message[];
}

export const useMessageStore = create<MessageStore>()(
    persist(
        (set, get: () => MessageStore) => ({
            messages: [], // Initialize with empty array

            sendMessage: (messageData) => {
                const newMessage: Message = {
                    ...messageData,
                    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    sentAt: new Date().toISOString(),
                    read: false,
                };

                set((state) => ({
                    messages: [newMessage, ...state.messages],
                }));
            },

            markAsRead: (id) => {
                set((state) => ({
                    messages: state.messages.map((msg) =>
                        msg.id === id ? { ...msg, read: true } : msg
                    ),
                }));
            },

            deleteMessage: (id) => {
                set((state) => ({
                    messages: state.messages.filter((msg) => msg.id !== id),
                }));
            },

            getMessagesForUser: (userId) => {
                return get().messages.filter(
                    (msg) => msg.to === userId || msg.to === 'all' || msg.from === userId
                );
            },
        }),
        {
            name: 'education-platform-messages',
        }
    ) as any
);
