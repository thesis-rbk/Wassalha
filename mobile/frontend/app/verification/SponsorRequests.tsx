import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator, Modal, TextInput, TouchableOpacity, Text } from 'react-native';
import OrderCard from '../../components/fetchOrdersSponsors';
import axiosInstance from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Order } from "../../types/ServiceProvider";
import { AccountDetailsModalProps } from "../../types/Sponsorship";
import { TabBar } from "@/components/navigation/TabBar";
import { useStatus } from '@/context/StatusContext';

const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({ visible, onClose, onSubmit }) => {
    const { show, hide } = useStatus();
    const [detailType, setDetailType] = useState('code');
    const [code, setCode] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        if (detailType === 'code') {
            if (!code) {
                show({
                    type: 'error',
                    title: 'Missing Code',
                    message: 'Please enter the code',
                    primaryAction: {
                        label: 'OK',
                        onPress: () => hide()
                    }
                });
                return;
            }
            onSubmit({ type: 'code', details: code });
        } else {
            if (!email || !password) {
                show({
                    type: 'error',
                    title: 'Missing Information',
                    message: 'Please enter both email and password',
                    primaryAction: {
                        label: 'OK',
                        onPress: () => hide()
                    }
                });
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
                            <Text style={styles.typeButtonText}>Code</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, detailType === 'account' && styles.selectedType]}
                            onPress={() => setDetailType('account')}
                        >
                            <Text style={styles.typeButtonText}>Account</Text>
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
                            <Text style={styles.buttonText}>Cancel</Text>
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

const OrdersScreen: React.FC = () => {
    const { show, hide } = useStatus();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

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
        if (!token) {
            show({
                type: 'error',
                title: 'Authentication Required',
                message: 'Please log in to view orders',
                primaryAction: {
                    label: 'OK',
                    onPress: () => hide()
                }
            });
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
            console.log("Sorted Orders:", sortedOrders.map((order: Order) => ({ id: order.id, createdAt: order.createdAt })));
            setOrders(sortedOrders);
        } catch (err) {
            console.error('Error fetching orders:', err);
            show({
                type: 'error',
                title: 'Loading Failed',
                message: 'Failed to fetch orders',
                primaryAction: {
                    label: 'Retry',
                    onPress: () => {
                        hide();
                        fetchOrders(token);
                    }
                },
                secondaryAction: {
                    label: 'Cancel',
                    onPress: () => hide()
                }
            });
        } finally {
            setLoading(false);
        }
    };

    // Accept an order - updates status to CONFIRMED
    const acceptOrder = async (orderId: number) => {
        if (!orderId || orderId <= 0) {
            show({
                type: 'error',
                title: 'Invalid Order',
                message: 'Invalid order ID',
                primaryAction: {
                    label: 'OK',
                    onPress: () => hide()
                }
            });
            console.error("Invalid orderId:", orderId);
            return;
        }

        try {
            console.log("Accepting order with ID:", orderId);
            const response = await axiosInstance.put("/api/confirmedUpdate", { orderId, status: "CONFIRMED" });
            show({
                type: 'success',
                title: 'Order Confirmed',
                message: 'Order confirmed successfully',
                primaryAction: {
                    label: 'OK',
                    onPress: async () => {
                        hide();
                        await fetchOrders(token);
                    }
                }
            });
            console.log("Order confirmed:", response.data);
        } catch (err) {
            console.error("Error accepting order:", err);
            show({
                type: 'error',
                title: 'Confirmation Failed',
                message: `Failed to confirm order: ${err}`,
                primaryAction: {
                    label: 'Retry',
                    onPress: () => {
                        hide();
                        acceptOrder(orderId);
                    }
                },
                secondaryAction: {
                    label: 'Cancel',
                    onPress: () => hide()
                }
            });
        }
    };

    // Send order - only for IN-TRANSIT status
    const sendOrder = async (orderId: number) => {
        setSelectedOrderId(orderId);
        setModalVisible(true);
    };

    const handleSubmitDetails = async (details: { type: string; details: string | { email: string; password: string } }) => {
        try {
            console.log('Submitting details:', details);
            if (selectedOrderId !== null) {
                await sendAccountDetails(selectedOrderId, details);
            } else {
                console.error('Error: selectedOrderId is null');
                show({
                    type: 'error',
                    title: 'Selection Error',
                    message: 'No order selected',
                    primaryAction: {
                        label: 'OK',
                        onPress: () => hide()
                    }
                });
            }
        } catch (err) {
            console.error('Error submitting details:', err);
            show({
                type: 'error',
                title: 'Submission Failed',
                message: 'Failed to submit details',
                primaryAction: {
                    label: 'Retry',
                    onPress: () => {
                        hide();
                        handleSubmitDetails(details);
                    }
                },
                secondaryAction: {
                    label: 'Cancel',
                    onPress: () => hide()
                }
            });
        }
    };

    const sendAccountDetails = async (orderId: number, details: any) => {
        try {
            console.log('Sending to API:', { orderId, details });

            const response = await axiosInstance.post(
                `/api/sponsor-orders/${orderId}/accept`,
                { accountDetails: details },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            console.log('Response:', response.data);
            show({
                type: 'success',
                title: 'Order Accepted',
                message: 'Order accepted and account details sent!',
                primaryAction: {
                    label: 'OK',
                    onPress: async () => {
                        hide();
                        await fetchOrders(token);
                    }
                }
            });
        } catch (err) {
            console.error('Error accepting order:', err);
            show({
                type: 'error',
                title: 'Acceptance Failed',
                message: 'Failed to accept order',
                primaryAction: {
                    label: 'Retry',
                    onPress: () => {
                        hide();
                        sendAccountDetails(orderId, details);
                    }
                },
                secondaryAction: {
                    label: 'Cancel',
                    onPress: () => hide()
                }
            });
        }
    };

    // Reject an order
    const rejectOrder = async (orderId: number) => {
        if (!orderId || orderId <= 0) {
            show({
                type: 'error',
                title: 'Invalid Order',
                message: 'Invalid order ID',
                primaryAction: {
                    label: 'OK',
                    onPress: () => hide()
                }
            });
            console.error("Invalid orderId:", orderId);
            return;
        }

        try {
            console.log("Rejecting order with ID:", orderId);
            await axiosInstance.put("/api/confirmedUpdate", { orderId, status: "REJECTED" });
            console.log("Order rejected:");
            await fetchOrders(token); // Refresh orders after rejection
            show({
                type: 'success',
                title: 'Order Rejected',
                message: 'Order rejected successfully',
                primaryAction: {
                    label: 'OK',
                    onPress: () => hide()
                }
            });
        } catch (err) {
            console.error("Error rejecting order:", err);
            show({
                type: 'error',
                title: 'Rejection Failed',
                message: `Failed to reject order: ${err}`,
                primaryAction: {
                    label: 'Retry',
                    onPress: () => {
                        hide();
                        rejectOrder(orderId);
                    }
                },
                secondaryAction: {
                    label: 'Cancel',
                    onPress: () => hide()
                }
            });
        }
    };

    useEffect(() => {
        const initialize = async () => {
            const token = await fetchToken();
            await fetchOrders(token);
        };
        initialize();
    }, []);

    // Custom render function that handles both regular orders and IN-TRANSIT orders
    const renderOrder = ({ item }: { item: Order }) => {
        // Check if the order is in IN-TRANSIT status
        const isInTransit = item.status === "IN_TRANSIT";

        return (
            <View style={styles.orderContainer}>
                <OrderCard
                    order={item}
                    onPress={() => console.log(`Order ${item.id} pressed`)}
                    onAccept={() => acceptOrder(item.id)}
                    onReject={() => rejectOrder(item.id)}
                />

                {/* Render Send button only for IN-TRANSIT orders */}
                {isInTransit && (
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={() => sendOrder(item.id)}
                    >
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

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
        borderRadius: 12,
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    typeButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    selectedType: {
        backgroundColor: '#e3e3e3',
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        marginBottom: 12,
        borderRadius: 8,
        fontSize: 14,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    submitButton: {
        backgroundColor: '#28A745',
    },
    buttonText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '600',
    },
    submitText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    orderContainer: {
        marginBottom: 10,
    },
    sendButton: {
        backgroundColor: '#28A745',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sendButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default OrdersScreen;