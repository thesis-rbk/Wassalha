import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import io, { Socket } from 'socket.io-client';

// Constants
const SOCKET_URL = 'http://192.168.1.14:3000'; // Replace with your server URL
const USER_ID = '11'; // Example user ID

// Types
interface Notification {
    id: string;
    message: string;
    timestamp: number;
}

export const Notification: React.FC = () => {
    const [socket, setSocket] = useState<typeof Socket | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Initialize Socket.IO connection
        const socketInstance = io(SOCKET_URL, {
            transports: ['websocket'], // Force WebSocket transport
            reconnection: true, // Enable reconnection
            reconnectionAttempts: 5, // Retry 5 times
            reconnectionDelay: 1000, // Wait 1s between retries
        });

        setSocket(socketInstance);

        // Handle connection
        socketInstance.on('connect', () => {
            console.log('Connected to server');
            socketInstance.emit('register', USER_ID);
        });

        // Listen for incoming notifications
        socketInstance.on('notification', (data: { message: string }) => {
            console.log('Received notification:', data);
            const newNotification: Notification = {
                id: Math.random().toString(36).substring(2),
                message: data.message,
                timestamp: Date.now(),
            };
            setNotifications((prev) => [...prev, newNotification]);
        });

        // Handle connection errors
        socketInstance.on('connect_error', (error: Error) => {
            console.log('Connection error:', error);
        });

        // Cleanup on unmount
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Send a test notification (optional)
    const sendTestNotification = () => {
        if (socket) {
            socket.emit('sendNotification', {
                userId: USER_ID,
                message: 'This is a test notification!',
            });
        }
    };

    // Render notification item
    const renderNotification = ({ item }: { item: Notification }) => (
        <View style={styles.notificationItem}>
            <Text style={styles.notificationText}>{item.message}</Text>
            <Text style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Notifications</Text>
            {notifications.length === 0 ? (
                <Text style={styles.noNotifications}>No notifications yet</Text>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id}
                    style={styles.notificationList}
                />
            )}
            <Button title="Send Test Notification" onPress={sendTestNotification} />
        </SafeAreaView>
    );
};

// Styles
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
    notificationItem: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        elevation: 2,
    },
    notificationText: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
});

