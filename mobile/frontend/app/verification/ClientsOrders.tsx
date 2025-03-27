import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '@/config';
import OrderCard from '../../components/ordersClient';
import { Sponsorship } from '../../types/Sponsorship';
import { useRouter } from 'expo-router';
import { TabBar } from "@/components/navigation/TabBar";


const OrdersSponsor: React.FC = () => {
    const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("orders");

    // Function to retrieve JWT token from AsyncStorage
    const getToken = async (): Promise<string | null> => {
        try {
            const token = await AsyncStorage.getItem('jwtToken');
            if (token) {
                setToken(token);
                return token;
            } else {
                setError('No token found');
                return null;
            }
        } catch (err) {
            setError('Failed to retrieve token');
            console.error('Error retrieving token:', err);
            return null;
        }
    };

    // Function to fetch orders (sponsorships) using token
    const fetchOrders = async (token: string): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get<Sponsorship[]>('/api/ordersSponsor', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });
            console.log("Fetched orders:", response.data);
            // Filter out invalid items (ensure id and sponsorship exist)
            const validSponsorships = (response.data || []).filter(
                (item: Sponsorship) => item && item.id && item.sponsorship && item.sponsorship.id
            );
            setSponsorships(validSponsorships);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to fetch orders');
            setSponsorships([]);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle deletion of a rejected order
    const handleDelete = async (orderId: number) => {
        try {
            // Make API call to delete the order
            await axiosInstance.delete(`/api/ordersSponsor/${orderId}`);

            setSponsorships((prevSponsorships) =>
                prevSponsorships.filter((sponsorship) => sponsorship.id !== orderId)
            );
            Alert.alert('Success', 'Order deleted successfully');
        } catch (err) {
            console.error('Error deleting order:', err);
            Alert.alert('Error', 'Failed to delete order');
        }
    };

    // Fetch token and then fetch orders on component mount
    useEffect(() => {
        const initialize = async () => {
            const retrievedToken = await getToken();
            if (retrievedToken) {
                await fetchOrders(retrievedToken);
            }
        };
        initialize();
    }, []);

    // Update the handleCardPress function
    const handleCardPress = (orderId: number, status: string) => {
        console.log(`Card pressed for order ID: ${orderId} with status: ${status}`);
        if (status === 'IN_TRANSIT') {
            router.push({
                pathname: "/sponsorshipTrack/deliveryBuyer",
                params: { processId: orderId }
            });
        }
    };

    // Update the handlePayment function to handle different statuses
    const handlePayment = (orderId: number, status: string) => {
        console.log(`Payment pressed for order ID: ${orderId} with status: ${status}`);
            router.push({ 
                pathname: "/sponsorshipTrack/initializationBuyer", 
                params: { id: orderId } 
            });
        
    };

    // Update the renderItem function to pass status
    const renderItem = ({ item }: { item: Sponsorship }) => {
        if (!item || !item.id || !item.sponsorship || !item.sponsorship.id) return null;
        return (
            <OrderCard
                order={item}
                sponsorship={item.sponsorship}
                onPress={() => handleCardPress(item.id, item.status)}
                onPayment={() => handlePayment(item.id, item.status)}
                onDelete={() => handleDelete(item.id)}
            />
        );
    };

    const handleTabPress = (tabName: string) => {
        setActiveTab(tabName);
        // Add navigation logic if needed
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" style={styles.loading} />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : sponsorships.length === 0 ? (
                <Text style={styles.emptyText}>No orders found.</Text>
            ) : (
                <FlatList
                    data={sponsorships}
                    renderItem={renderItem}
                    keyExtractor={(item) => (item && item.id ? item.id.toString() : Math.random().toString())} // Use top-level id as key
                    contentContainerStyle={styles.listContent}
                />
            )}
            <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loading: {
        marginTop: 20,
    },
    errorText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#D32F2F',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666666',
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
});

export default OrdersSponsor;