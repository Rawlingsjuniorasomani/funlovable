import { io } from 'socket.io-client';

const API_URL: string = import.meta.env.VITE_API_URL || '/api';
const SOCKET_URL = API_URL.startsWith('http')
    ? API_URL.replace(/\/api$/, '')
    : (typeof window !== 'undefined' ? window.location.origin : '');

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
});

export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
