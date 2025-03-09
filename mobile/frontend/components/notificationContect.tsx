import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { NotificationProps } from "../types/notifications"

const NotificationItem: React.FC<NotificationProps> = ({ message, timestamp }) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(translateY, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            });
        }, 3500);

        return () => clearTimeout(timer);
    }, []);

    const handleAccept = () => {
        console.log('Accepted');
        // Add your accept logic here
    };

    const handleRefuse = () => {
        console.log('Refused');
        // Add your refuse logic here
    };

    const handleNegotiate = () => {
        console.log('Negotiate');
        // Add your negotiate logic here
    };

    return (
        <Animated.View style={[styles.notificationItem, { transform: [{ translateY }], opacity }]}>
            <View style={styles.contentContainer}>
                <Text style={styles.notificationText}>{message}</Text>
                <Text style={styles.timestamp}>
                    {new Date(timestamp).toLocaleTimeString()}
                </Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.refuseButton]}
                    onPress={handleRefuse}
                >
                    <Text style={styles.buttonText}>Refuse</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.negotiateButton]}
                    onPress={handleNegotiate}
                >
                    <Text style={styles.buttonText}>Negotiate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={handleAccept}
                >
                    <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    notificationItem: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        elevation: 2,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    contentContainer: {
        marginBottom: 10,
    },
    notificationText: {
        fontSize: 16,
        fontWeight: '500',
    },
    timestamp: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        gap: 8,
    },
    button: {
        flex: 1,
        padding: 8,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    refuseButton: {
        backgroundColor: '#ff4444',
    },
    negotiateButton: {
        backgroundColor: '#ffbb33',
    },
    acceptButton: {
        backgroundColor: '#00C851',
    },
    buttonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default NotificationItem;
