import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface TicketCardProps {
    ticketId: string;
    title: string;
    status: 'Open' | 'In Progress' | 'Closed';
    priority: 'Low' | 'Medium' | 'High';
    createdDate: string;
    description: string;
    onPressDetails: () => void;  // Function to handle view details action
    imageUrl?: string;  // Optional image URL for the circular image
}

const TicketCard: React.FC<TicketCardProps> = ({
    ticketId,
    title,
    status,
    priority,
    createdDate,
    description,
    onPressDetails,
    imageUrl,
}) => {
    // Define color mappings for status and priority
    const statusColor = status === 'Open' ? 'red' : status === 'In Progress' ? 'orange' : 'green';
    const priorityColor = priority === 'High' ? 'red' : priority === 'Medium' ? 'yellow' : 'green';

    return (
        <View style={styles.cardContainer}>
            <View style={styles.header}>
                {/* Profile Image Circle */}
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder} />
                )}

                <View style={styles.textContainer}>
                    <Text style={styles.title}>Ticket #{ticketId}</Text>
                    <Text style={[styles.status, { color: statusColor }]}>{status}</Text>
                </View>
            </View>

            <View style={styles.body}>
                <Text style={styles.priority}>Priority: <Text style={{ color: priorityColor }}>{priority}</Text></Text>
                <Text style={styles.createdDate}>Created: {createdDate}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={onPressDetails}>
                    <Text style={styles.buttonText}>View Details</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 5,  // Shadow effect on Android
        shadowColor: '#007BFF', // Blue shadow effect on iOS
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        marginBottom: 20,
        marginHorizontal: 15,
        padding: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    imagePlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ddd',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    status: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#777',
    },
    body: {
        marginBottom: 15,
    },
    priority: {
        fontSize: 14,
        marginBottom: 5,
    },
    createdDate: {
        fontSize: 12,
        color: '#777',
    },
    description: {
        fontSize: 14,
        color: '#333',
        marginTop: 5,
    },
    footer: {
        alignItems: 'flex-end',
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        elevation: 2,
        shadowColor: '#007BFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default TicketCard;
