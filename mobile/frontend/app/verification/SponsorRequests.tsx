import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator } from 'react-native';
import OrderCard from '../../components/fetchOrdersSponsors'; // Adjust the path based on your file structure
import axiosInstance from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Order } from "../../types/ServiceProvider"
import { TabBar } from "@/components/navigation/TabBar";

const OrdersScreen: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<null | string>(null);
    const [activeTab, setActiveTab] = useState("Home");
    // Fetch token
    const fetchToken = async () => {
        try {
            const tokeny = await AsyncStorage.getItem("jwtToken");
            console.log("token:", tokeny);
            setToken(tokeny);
            return tokeny;
        } catch (error) {
            console.error("Error fetching token:", error);
            return null;
        }
    };

    // Fetch orders after the token is fetched
    const fetchOrders = async (token: string | null) => {
        if (!token) return;
        setLoading(true);
        try {
            const result = await axiosInstance.get("/api/requests", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            const sortedOrders = result.data.requests.sort((a: Order, b: Order) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateB.getTime() - dateA.getTime(); // Newest first
            })
            setOrders(sortedOrders);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    // Accept an order
    const acceptOrder = async (orderId: number) => {
        // Empty function - implement your API call here
    };

    // Reject an order
    const rejectOrder = async (orderId: number) => {
        // Empty function - implement your API call here
    };

    // Fetch orders on component mount
    useEffect(() => {
        const initialize = async () => {
            const token = await fetchToken();
            await fetchOrders(token);
        };
        initialize();
    }, []);

    const renderOrder = ({ item }: { item: Order }) => (
        <OrderCard
            order={item}
            onPress={() => console.log(`Order ${item.id} pressed`)}
            onAccept={() => acceptOrder(item.id)}
            onReject={() => rejectOrder(item.id)}
        />
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
            />
            <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    list: {
        paddingBottom: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default OrdersScreen;
