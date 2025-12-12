import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, mockMessages } from '@/data/mockData';

interface MessageStore {
    messages: Message[];
    sendMessage: (message: Omit<Message, 'id' | 'sentAt' | 'read'>) => void;
    markAsRead: (id: string) => void;
    deleteMessage: (id: string) => void;
    getMessagesForUser: (userId: string) => Message[];
}

export const useMessageStore = create<MessageStore>()(
    persist(
        (set, get) => ({
            messages: mockMessages, // Initialize with mock data

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
    )
);
