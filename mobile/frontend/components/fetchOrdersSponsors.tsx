import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Order, OrderCardProps } from "../types/Sponsorship";

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress, onAccept, onReject }) => {
    const { amount, status, sponsorship, recipient } = order;

    // Map status to appropriate colors
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING':
                return styles.pending;
            case 'IN_TRANSIT':
                return styles.inTransit;
            case 'CONFIRMED':
                return styles.confirmed;
            case 'DELIVERED':
                return styles.delivered;
            case 'REJECTED':
                return styles.rejected; // Added REJECTED status
            default:
                return styles.pending; // Fallback
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <Text style={styles.amount}>${amount.toFixed(2)}</Text>
                <Text style={[styles.status, getStatusStyle(status)]}>
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
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    amount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    status: {
        fontSize: 12,
        fontWeight: '600',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        textTransform: 'uppercase',
    },
    pending: {
        backgroundColor: '#FFFACD', // Lemon Chiffon
        color: '#333',
    },
    inTransit: {
        backgroundColor: '#87CEEB', // Sky Blue
        color: '#fff',
    },
    confirmed: {
        backgroundColor: '#90EE90', // Light Green
        color: '#fff',
    },
    delivered: {
        backgroundColor: '#98FB98', // Pale Green
        color: '#fff',
    },
    rejected: {
        backgroundColor: '#DC3545', // Red for REJECTED (Bootstrap red)
        color: '#fff', // White text for contrast
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
        fontWeight: '400',
        color: '#333',
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    acceptButton: {
        backgroundColor: '#28A745', // Bootstrap Green
    },
    rejectButton: {
        backgroundColor: '#DC3545', // Bootstrap Red
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default OrderCard;