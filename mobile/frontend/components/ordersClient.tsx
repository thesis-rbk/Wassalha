import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sponsorship } from '../types/Sponsorship';

// Define the props interface for OrderCard
interface OrderCardProps {
    order: Sponsorship; // Top-level Sponsorship object (for status)
    sponsorship: Sponsorship['sponsorship']; // Nested sponsorship object (for price, platform, description)
    onPress?: () => void;
    onPayment?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ sponsorship, order, onPress, onPayment }) => {
    const { price, platform, description } = sponsorship;
    const { status } = order; // Use top-level status

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <Text style={styles.price}>${price ? price.toFixed(2) : 'N/A'}</Text>
                <Text
                    style={[
                        styles.status,
                        status === 'PENDING' ? styles.pending : status === 'CONFIRMED' ? styles.confirmed : styles.defaultStatus,
                    ]}
                >
                    {status || 'N/A'}
                </Text>
            </View>

            <View style={styles.details}>
                <Text style={styles.label}>Platform:</Text>
                <Text style={styles.value}>{platform || 'N/A'}</Text>
            </View>

            <View style={styles.details}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.value}>{description || 'N/A'}</Text>
            </View>

            {status === 'CONFIRMED' && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.paymentButton]}
                        onPress={onPayment}
                    >
                        <Text style={styles.buttonText}>Payment</Text>
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
    price: {
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
        backgroundColor: '#FF9800', // Orange background for PENDING
        color: '#FFFFFF', // White text for contrast
    },
    confirmed: {
        backgroundColor: '#A5D6A7', // Green background for CONFIRMED
        color: '#388E3C', // Green text
    },
    defaultStatus: {
        backgroundColor: '#E0E0E0', // Grey background for other statuses
        color: '#666', // Grey text
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
        justifyContent: 'center',
        marginTop: 12,
    },
    button: {
        paddingVertical: 8,
        borderRadius: 4,
        alignItems: 'center',
        width: 150,
    },
    paymentButton: {
        backgroundColor: '#388E3C', // Green button for payment
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default OrderCard;