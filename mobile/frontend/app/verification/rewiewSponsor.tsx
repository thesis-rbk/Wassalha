import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { X, Star } from 'react-native-feather';

interface CallQualityFeedbackProps {
    visible: boolean;
    onClose: () => void;
}

const CallQualityFeedback: React.FC<CallQualityFeedbackProps> = ({ visible, onClose }) => {
    const [rating, setRating] = useState<number | null>(null);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.container}>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <X width={24} height={24} color="#666" />
                    </TouchableOpacity>

                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>
                            How did you find the quality of your call?
                        </Text>
                        <Text style={styles.subtitle}>
                            Your response is anonymous. It helps WhatsApp improve your call experience.
                        </Text>
                    </View>

                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                                activeOpacity={0.7}
                            >
                                <Star
                                    width={48}
                                    height={48}
                                    color="#4CAF50"
                                    fill={rating !== null && star <= rating ? "#4CAF50" : "none"}
                                    stroke="#4CAF50" // Ensure stroke is a valid color value
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.notNowButton}
                            activeOpacity={0.7}
                            onPress={onClose}
                        >
                            <Text style={styles.notNowText}>Not now</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                !rating && styles.disabledButton
                            ]}
                            activeOpacity={rating ? 0.7 : 1}
                            disabled={!rating}
                            onPress={() => {
                                if (rating) {
                                    // Handle submission
                                    onClose();
                                }
                            }}
                        >
                            <Text style={[
                                styles.sendText,
                                !rating && styles.disabledText
                            ]}>Send</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.progressBar} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    card: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        padding: 8,
        zIndex: 1,
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 48,
        gap: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 32,
        gap: 16,
    },
    notNowButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notNowText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    sendButton: {
        flex: 1,
        backgroundColor: '#4CAF50',
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#f0f0f0',
    },
    sendText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    disabledText: {
        color: '#999',
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: '#000',
        borderRadius: 2,
        marginTop: 48,
    },
});

export default CallQualityFeedback;