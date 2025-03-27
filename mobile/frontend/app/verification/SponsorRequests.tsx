import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator } from 'react-native';
import OrderCard from '../../components/fetchOrdersSponsors'; // Adjust the path based on your file structure
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage";
// Define TypeScript interface for the Order data (same as in OrderCard)
interface Order {
    id: number;
    amount: number;
    status: string;
    sponsorship: {
        platform: string;
    };
    recipient: {
        name: string;
    };
}

const OrdersScreen: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<null | string>(null);

    // Fetch token
    const fetchToken = async () => {
        try {
            const tokeny = await AsyncStorage.getItem("jwtToken");
            console.log("token:", tokeny);
            setToken(tokeny)
        } catch (error) {

            console.error("Error fetching token:", error);
            return null;
        }
    };

    // Fetch orders after the token is fetched
    const fetchOrders = async () => {
        try {
            const result = await axios.get("/api/requests", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            console.log("result")
            setOrders(result.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
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
        fetchToken()
    }, []);
    useEffect(() => {
        fetchOrders()
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
