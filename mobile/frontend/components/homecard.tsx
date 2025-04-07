import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CardProps } from '../types/Sponsorship'; // Assuming this is your type file

// Extend CardProps to include showButton
interface ExtendedCardProps extends CardProps {
    showButton: boolean; // New prop to control button visibility
}

// Get the screen width for responsive design
const { width } = Dimensions.get('window');

// Card Component with Enhanced UX
const CardHome: React.FC<ExtendedCardProps> = ({ title, description, imageUrl, onPress, showButton }) => {
    // Animation for scaling effect on press
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
            {/* Gradient Overlay on Image */}
            <View style={styles.imageWrapper}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                    style={styles.gradientOverlay}
                />
            </View>

            {/* Content Section */}
            <View style={styles.contentWrapper}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>

                {/* Conditionally render the button based on showButton prop */}
                {showButton && (
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={onPress}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#FFD700', '#FFA500']}
                            style={styles.ctaGradient}
                        >
                            <Text style={styles.ctaText}>Join Now</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );
};

// Styles for the Card Component
const styles = StyleSheet.create({
    cardContainer: {
        position: 'relative',
        backgroundColor: 'transparent',
        borderRadius: 16,
        marginVertical: 15,
        marginHorizontal: 15,
        height: 220,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    imageWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f0f0f0',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    contentWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        paddingHorizontal: 20,
        paddingVertical: 25,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slight white overlay for readability
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'uppercase',
        maxWidth: '80%',
    },
    description: {
        fontSize: 14,
        color: '#ddd',
        lineHeight: 20,
        maxWidth: '80%',
        marginBottom: 15,
    },
    ctaButton: {
        alignSelf: 'flex-start',
        borderRadius: 25,
        overflow: 'hidden',
    },
    ctaGradient: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
    },
    ctaText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default CardHome;