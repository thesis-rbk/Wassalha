import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import OrderCard from '../../components/fetchOrdersSponsors'; // Adjust the path based on your file structure
import axiosInstance from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Order } from "../../types/ServiceProvider";

const OrdersScreen: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);

    // Fetch token (still needed for fetchOrders)
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
        if (!token) {
            Alert.alert("Error", "Please log in to view orders");
            return;
        }
        setLoading(true);
        try {
            const result = await axiosInstance.get("/api/requestsSponsor", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            const sortedOrders = result.data.requests.sort((a: Order, b: Order) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateB.getTime() - dateA.getTime(); // Newest first
            });
            setOrders(sortedOrders);
        } catch (err) {
            console.error('Error fetching orders:', err);
            Alert.alert("Error", "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    // Accept an order (no token or headers)
    const acceptOrder = async (orderId: number) => {
        if (!orderId || orderId <= 0) {
            Alert.alert("Error", "Invalid order ID");
            console.error("Invalid orderId:", orderId);
            return;
        }

        try {
            console.log("Accepting order with ID:", orderId);
            const response = await axiosInstance.put("/api/confirmedUpdate", { orderId, status: "CONFIRMED" });

            Alert.alert("Success", "Order confirmed successfully");
            // Refresh orders after acceptance
            await fetchOrders(token);
            console.log("Order confirmed:", response.data);
        } catch (err) {
            console.error("Error accepting order:", err);
            Alert.alert("Error", `Failed to confirm order: ${err}`);
        }
    };

    // Reject an order (no token or headers)
    const rejectOrder = async (orderId: number) => {
        if (!orderId || orderId <= 0) {
            Alert.alert("Error", "Invalid order ID");
            console.error("Invalid orderId:", orderId);
            return;
        }

        try {
            console.log("Rejecting order with ID:", orderId);
            const response = await axiosInstance.put("/api/updateOrderSponsor", { orderId, status: "REJECTED" });

            Alert.alert("Success", "Order rejected successfully");
            // Refresh orders after rejection
            await fetchOrders(token);
            console.log("Order rejected:", response.data);
        } catch (err) {
            console.error("Error rejecting order:", err);
            Alert.alert("Error", `Failed to reject order: ${err}`);
        }
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