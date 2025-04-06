import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    GestureResponderEvent,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
    title: string;
    subtitle: string;
    onBackPress?: (event: GestureResponderEvent) => void;
    onNextPress?: (event: GestureResponderEvent) => void; // New prop for next button
    showBackButton?: boolean;
    showNextButton?: boolean; // New prop to control next button visibility
    backButtonTitle?: string;
    nextButtonTitle?: string; // New prop for next button text
}

const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    onBackPress,
    onNextPress,
    showBackButton = true,
    showNextButton = false, // Default to false
    backButtonTitle = 'Back',
    nextButtonTitle = 'Next', // Default value
}) => {
    const navigation = useNavigation();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleBackPress = (event: GestureResponderEvent) => {
        if (onBackPress) {
            onBackPress(event);
        } else {
            navigation.goBack();
        }
    };

    const handleNextPress = (event: GestureResponderEvent) => {
        if (onNextPress) {
            onNextPress(event);
        } else {
            // Default behavior could be added here if needed
            navigation.goBack(); // Fallback to goBack if no custom handler
        }
    };

    return (
        <Animated.View
            style={[
                styles.headerContainer,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}
        >
            {showBackButton && (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackPress}
                    accessibilityLabel="Go back to previous screen"
                    accessibilityRole="button"
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={18} color="#fff" />
                    {backButtonTitle && (
                        <Text style={styles.buttonText}>{backButtonTitle}</Text>
                    )}
                </TouchableOpacity>
            )}

            {showNextButton && (
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNextPress}
                    accessibilityLabel="Go to next screen"
                    accessibilityRole="button"
                    activeOpacity={0.7}
                >
                    {nextButtonTitle && (
                        <Text style={styles.buttonText}>{nextButtonTitle}</Text>
                    )}
                    <Ionicons name="chevron-forward" size={18} color="#fff" />
                </TouchableOpacity>
            )}

            <LinearGradient
                colors={['#007BFF', '#4dabf7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.contentContainer}>
                    <Text
                        style={styles.title}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {title}
                    </Text>
                    <Text
                        style={styles.subtitle}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {subtitle}
                    </Text>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
        zIndex: 1000,
    },
    backButton: {
        position: 'absolute',
        left: 10,
        top: '50%',
        transform: [{ translateY: -12 }],
        zIndex: 1100,
        flexDirection: 'row',
        alignItems: 'center',
    },
    nextButton: {
        position: 'absolute',
        right: 10, // Positioned on the right
        top: '50%',
        transform: [{ translateY: -12 }],
        zIndex: 1100,
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 13,
        color: '#fff',
        marginLeft: 4, // For back button
        marginRight: 4, // For next button
        fontWeight: '500',
    },
    header: {
        paddingTop: 30,
        paddingBottom: 10,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    contentContainer: {
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '500', // Changed from 700 to 500 for thinner appearance
        color: '#fff',
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    subtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginTop: 4,
        lineHeight: 16,
    },
});

export default Header;