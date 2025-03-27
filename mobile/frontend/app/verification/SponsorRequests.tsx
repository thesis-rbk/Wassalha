import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator, Alert, Platform, Modal, TextInput, TouchableOpacity, Text } from 'react-native';
import { FlatList, StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import OrderCard from '../../components/fetchOrdersSponsors'; // Adjust the path based on your file structure
import axiosInstance from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Order } from "../../types/ServiceProvider"
import { TabBar } from "@/components/navigation/TabBar";

const AccountDetailsModal = ({ visible, onClose, onSubmit }) => {
    const [detailType, setDetailType] = useState('code'); // 'code' or 'account'
    const [code, setCode] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        if (detailType === 'code') {
            if (!code) {
                Alert.alert('Error', 'Please enter the code');
                return;
            }
            onSubmit({ type: 'code', details: code });
        } else {
            if (!email || !password) {
                Alert.alert('Error', 'Please enter both email and password');
                return;
            }
            onSubmit({ type: 'account', details: { email, password } });
        }
        // Reset form
        setCode('');
        setEmail('');
        setPassword('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[styles.typeButton, detailType === 'code' && styles.selectedType]}
                            onPress={() => setDetailType('code')}
                        >
                            <Text>Code</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, detailType === 'account' && styles.selectedType]}
                            onPress={() => setDetailType('account')}
                        >
                            <Text>Account</Text>
                        </TouchableOpacity>
                    </View>

                    {detailType === 'code' ? (
                        <TextInput
                            style={styles.input}
                            placeholder="Enter code"
                            value={code}
                            onChangeText={setCode}
                        />
                    ) : (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </>
                    )}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={onClose}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
                            <Text style={styles.submitText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
import { Order } from "../../types/ServiceProvider";

const OrdersScreen: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<null | string>(null);
    const [activeTab, setActiveTab] = useState("Home");
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // Fetch token
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
        setSelectedOrderId(orderId);
        setModalVisible(true);
    };

    const handleSubmitDetails = async (details) => {
        try {
            console.log('Submitting details:', details); // Debug log

            // Send the details object directly without formatting
            await sendAccountDetails(selectedOrderId, details);
        } catch (err) {
            console.error('Error submitting details:', err);
            Alert.alert('Error', 'Failed to submit details');
        }
    };

    const sendAccountDetails = async (orderId: number, details: any) => {
        try {
            console.log('Sending to API:', { orderId, details }); // Debug log

            const response = await axiosInstance.post(
                `/api/sponsor-orders/${orderId}/accept`,
                { accountDetails: details }, // Send the entire details object
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            console.log('Response:', response.data);
            Alert.alert("Success", "Order accepted and account details sent!");
            await fetchOrders(token);
        } catch (err) {
            console.error('Error accepting order:', err);
            Alert.alert("Error", "Failed to accept order");
        }
    };
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
        <AccountDetailsModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSubmit={handleSubmitDetails}
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    typeButton: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedType: {
        backgroundColor: '#e3e3e3',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        minWidth: 100,
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#007AFF',
    },
    submitText: {
        color: 'white',
    },
});

export default OrdersScreen;