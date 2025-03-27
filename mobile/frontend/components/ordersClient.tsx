import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sponsorship } from '../types/Sponsorship';
import { OrderCardProps } from "../types/OrderCardProps"



const OrderCard: React.FC<OrderCardProps> = ({ sponsorship, order, onPress, onPayment, onDelete }) => {
    const { price, platform, description } = sponsorship;
    const { status } = order; // Use top-level status

    // Map status to appropriate styles
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
                return styles.rejected;
            default:
                return styles.defaultStatus;
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <Text style={styles.price}>${price ? price.toFixed(2) : 'N/A'}</Text>
                <Text style={[styles.status, getStatusStyle(status)]}>
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

            {status === 'REJECTED' && (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={onDelete}
                >
                    {/* Replace this with an icon from a library like react-native-vector-icons */}
                    <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12, // Softer corners
        padding: 16, // Increased padding for better spacing
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4, // Slightly increased elevation for better depth
        position: 'relative', // Needed for absolute positioning of the delete button
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    price: {
        fontSize: 20, // Larger font size for emphasis
        fontWeight: '700', // Bolder for better hierarchy
        color: '#333',
    },
    status: {
        fontSize: 12,
        fontWeight: '600',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        textTransform: 'uppercase', // For consistency
    },
    pending: {
        backgroundColor: '#FFFACD', // Lemon Chiffon
        color: '#333', // Black text for contrast
    },
    inTransit: {
        backgroundColor: '#87CEEB', // Sky Blue
        color: '#fff', // White text for contrast
    },
    confirmed: {
        backgroundColor: '#90EE90', // Light Green
        color: '#fff', // White text for contrast
    },
    delivered: {
        backgroundColor: '#98FB98', // Pale Green
        color: '#fff', // White text for contrast
    },
    rejected: {
        backgroundColor: '#FF6347', // Tomato Red
        color: '#fff', // White text for contrast
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
        fontWeight: '400', // Lighter weight for contrast
        color: '#333',
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16, // Increased spacing above button
    },
    button: {
        paddingVertical: 12, // Taller button for better tap target
        borderRadius: 8, // More rounded corners
        alignItems: 'center',
        width: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    paymentButton: {
        backgroundColor: '#28A745', // Bootstrap Green
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    deleteButton: {
        position: 'absolute',
        bottom: 8, // Position at the bottom
        right: 8, // Position at the right
        backgroundColor: '#DC3545', // Bootstrap Red
        borderRadius: 20, // Circular button
        width: 36, // Fixed size for the button
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    deleteIcon: {
        fontSize: 18, // Size of the icon
        color: '#fff', // White icon color
    },
});

export default OrderCard;