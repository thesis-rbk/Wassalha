import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { OrderfetchCardProps } from "../types/Sponsorship";

const OrderCard: React.FC<OrderfetchCardProps> = ({ order, onPress, onAccept, onReject }) => {
    const {
        status,
        goods,
        goodsLocation,
        goodsDestination,
        date,
    } = order;

    // Map status to appropriate colors
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING':
                return styles.pending;
            case 'ACCEPTED':
                return styles.confirmed;
            case 'IN_TRANSIT':
                return styles.inTransit;
            case 'COMPLETED':
                return styles.delivered;
            case 'REJECTED':
                return styles.rejected;
            default:
                return styles.pending;
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            {/* Image Section */}
            {goods?.image?.url && (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: goods.image.url }}
                        style={styles.goodsImage}
                        resizeMode="cover"
                    />
                </View>
            )}

            {/* Header with Price and Status */}
            <View style={styles.header}>
                <Text style={styles.amount}>${goods?.price?.toFixed(2) || 'N/A'}</Text>
                <Text style={[styles.status, getStatusStyle(status)]}>
                    {status}
                </Text>
            </View>

            {/* Location Details */}
            <View style={styles.details}>
                <Text style={styles.label}>From:</Text>
                <Text style={styles.value}>{goodsLocation || 'N/A'}</Text>
            </View>

            <View style={styles.details}>
                <Text style={styles.label}>To:</Text>
                <Text style={styles.value}>{goodsDestination || 'N/A'}</Text>
            </View>

            {/* Date */}
            <View style={styles.details}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>
                    {date ? new Date(date).toLocaleDateString() : 'N/A'}
                </Text>
            </View>

            {/* Action Buttons for PENDING status */}
            {status === 'PENDING' && (
                <View style={styles.buttonContainer}>
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
    imageContainer: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 12,
    },
    goodsImage: {
        width: '100%',
        height: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    amount: {
        fontSize: 24,
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
        backgroundColor: '#FFFACD',
        color: '#333',
    },
    inTransit: {
        backgroundColor: '#87CEEB',
        color: '#fff',
    },
    confirmed: {
        backgroundColor: '#90EE90',
        color: '#fff',
    },
    delivered: {
        backgroundColor: '#98FB98',
        color: '#fff',
    },
    rejected: {
        backgroundColor: '#DC3545',
        color: '#fff',
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
        backgroundColor: '#28A745',
    },
    rejectButton: {
        backgroundColor: '#DC3545',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default OrderCard;