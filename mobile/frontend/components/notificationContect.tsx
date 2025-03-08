// NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Alert } from 'react-native';

// Define the Notification type
type Notification = {
    id: number;
    title: string;
    message: string;
    timestamp: string;
};

// Define the NotificationContextType
type NotificationContextType = {
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    socket: typeof io.Socket | null;
    socketId: string | null;
};

// Create the NotificationContext
const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    addNotification: () => { },
    socket: null,
    socketId: null,
});

// Define the NotificationProvider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<typeof io.Socket | null>(null);
    const [socketId, setSocketId] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Connect to Socket.io server
        const newSocket = io('http://localhost:3000', {
            transports: ['websocket'], // Required for React Native
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            setSocketId(newSocket.id);
            console.log('Connected to server:', newSocket.id);
        });

        newSocket.on('notification', (notification: Notification) => {
            addNotification(notification);
            Alert.alert(notification.title, notification.message);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const addNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
    };

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, socket, socketId }}>
            {children}
        </NotificationContext.Provider>
    );
};

// Custom hook to use the NotificationContext
export const useNotifications = () => useContext(NotificationContext);
