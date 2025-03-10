import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, SafeAreaView, TextInput } from 'react-native';
import io, { Socket } from 'socket.io-client';
import NotificationItem from '../components/notificationContect'; // Import the reusable component
import { Notificationy } from '@/types/notifications';
import { SOCKET_Notifcation_URL } from "../config"
// Constants
const SOCKET = SOCKET_Notifcation_URL; // Replace with your server URL
const USER_ID = '11'; // Example user ID

export const Notification: React.FC = () => {
    const [socket, setSocket] = useState<typeof Socket | null>(null);
    const [notifications, setNotifications] = useState<Notificationy[]>([]);

    useEffect(() => {
        const socketInstance = io(SOCKET, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log('Connected to server');
            socketInstance.emit('register', USER_ID);
        });

        socketInstance.on('notification', (data: { message: string }) => {
            console.log('Received notification:', data);
            const newNotification: Notificationy = {
                id: Math.random().toString(36).substring(2),
                message: data.message,
                timestamp: Date.now(),
            };
            setNotifications((prev) => [...prev, newNotification]);
            setTimeout(() => {
                setNotifications((prev) => prev.filter((notification) => notification.id !== newNotification.id));
            }, 4000); // Remove notification after 4 seconds
        });

        socketInstance.on('connect_error', (error: Error) => {
            console.log('Connection error:', error);
        });

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return null;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    noNotifications: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    notificationList: {
        flex: 1,
    },
});

export default Notification;
