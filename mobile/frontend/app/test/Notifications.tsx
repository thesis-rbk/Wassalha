import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';

type Notification = {
    id: number;
    userId: number;
    senderId?: number;
    type: string;
    title?: string;
    message?: string;
    status: string;
    requestId?: number;
    orderId?: number;
    pickupId?: number;
};

const NotificationsScreen: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const userId = 'user-id'; // Replace with actual user ID retrieval logic
                const token = 'your-auth-token'; // Replace with actual token retrieval logic
                const response = await axios.get(`api/allNot/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setNotifications(response.data);
            } catch (err) {
                setError('Failed to fetch notifications');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const renderItem = ({ item }: { item: Notification }) => (
        <View style={styles.notificationCard}>
            <Text style={styles.title}>{item.title || 'No Title'}</Text>
            <Text style={styles.message}>{item.message || 'No Message'}</Text>
            <Text style={styles.status}>Status: {item.status}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : error ? (
                <Text style={styles.error}>{error}</Text>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    notificationCard: {
        padding: 16,
        marginBottom: 10,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    message: {
        fontSize: 14,
        marginTop: 4,
    },
    status: {
        fontSize: 12,
        marginTop: 8,
        color: 'gray',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default NotificationsScreen;
