import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { WelcomeAnimationProps } from '@/types/WelcomeAnimationProps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
  Extrapolate,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function WelcomeAnimation({ onAnimationComplete }: WelcomeAnimationProps) {
  // Animation values
  const backgroundScale = useSharedValue(1.2);
  const contentOpacity = useSharedValue(0);
  const titleY = useSharedValue(50);
  const subtitleScale = useSharedValue(0.7);

  // Animated styles
  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backgroundScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: subtitleScale.value }],
    opacity: interpolate(subtitleScale.value, [0.7, 1], [0, 1], Extrapolate.CLAMP),
  }));

  useEffect(() => {
    // Background animation
    backgroundScale.value = withTiming(1, { duration: 3000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });

    // Content fade-in
    contentOpacity.value = withTiming(1, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });

    // Title animation
    titleY.value = withDelay(300, withSpring(0, { damping: 12, stiffness: 100, mass: 0.8 }));

    // Subtitle animation
    subtitleScale.value = withDelay(600, withSequence(
      withSpring(1.1, { damping: 10, stiffness: 120, mass: 0.6 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    ));

    // Complete the animation after 4 seconds
    const timer = setTimeout(() => onAnimationComplete(), 4000);
    return () => clearTimeout(timer);
  }, [backgroundScale, contentOpacity, titleY, subtitleScale, onAnimationComplete]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.background, backgroundStyle]}>
        <Image
          source={require('./worldwide-shipping.png')} // Replace with your image path
          style={styles.backgroundImage}
          resizeMode="contain" // Keeps image proportions intact
        />
        <LinearGradient
          colors={['rgba(0, 91, 181, 0.3)', 'rgba(51, 156, 255, 0.3)']} // Reduced opacity for clarity
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      <Animated.View style={[styles.content, contentStyle]}>
        <Animated.View style={[styles.textContainer, titleStyle]}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Animated.Text style={[styles.appName, subtitleStyle]}>
            Wassalha
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007BFF', // Fallback background color
  },
  background: {
    position: 'absolute',
    width: width, // Matches screen width
    height: height, // Matches screen height
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center', // Center text vertically
    alignItems: 'center',
    padding: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 36,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  appName: {
    fontSize: 56,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});