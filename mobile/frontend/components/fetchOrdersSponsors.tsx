import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Define TypeScript interface for the Order data
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

interface OrderCardProps {
    order: Order;
    onPress?: () => void;
    onAccept?: () => void;
    onReject?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress, onAccept, onReject }) => {
    const { amount, status, sponsorship, recipient } = order;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <Text style={styles.amount}>${amount.toFixed(2)}</Text>
                <Text
                    style={[
                        styles.status,
                        status === 'PENDING' ? styles.pending : styles.confirmed,
                    ]}
                >
                    {status}
                </Text>
            </View>

            <View style={styles.details}>
                <Text style={styles.label}>Platform:</Text>
                <Text style={styles.value}>{sponsorship?.platform || 'N/A'}</Text>
            </View>

            <View style={styles.details}>
                <Text style={styles.label}>Recipient:</Text>
                <Text style={styles.value}>{recipient?.name || 'N/A'}</Text>
            </View>

            {status === 'PENDING' && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.acceptButton]}
                        onPress={onAccept}
                    >
                        <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.rejectButton]}
                        onPress={onReject}
                    >
                        <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    amount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    status: {
        fontSize: 14,
        fontWeight: '600',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    pending: {
        backgroundColor: '#FFE082',
        color: '#FFB300',
    },
    confirmed: {
        backgroundColor: '#A5D6A7',
        color: '#388E3C',
    },
    details: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        width: 100,
    },
    value: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 4,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    acceptButton: {
        backgroundColor: '#388E3C',
    },
    rejectButton: {
        backgroundColor: '#D32F2F',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default OrderCard;