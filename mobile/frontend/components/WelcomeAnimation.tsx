import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { WelcomeAnimationProps } from '@/types/WelcomeAnimationProps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function WelcomeAnimation({ onAnimationComplete }: WelcomeAnimationProps) {
  // Animation values
  const welcomeTranslateX = useSharedValue(-width);
  const toTranslateX = useSharedValue(width);

  // Individual letter opacities for "Wassalha"
  const letterOpacities = [
    useSharedValue(0), // W
    useSharedValue(0), // a
    useSharedValue(0), // s
    useSharedValue(0), // s
    useSharedValue(0), // a
    useSharedValue(0), // l
    useSharedValue(0), // h
    useSharedValue(0), // a
  ];

  const letterScales = [
    useSharedValue(0.5), // W
    useSharedValue(0.5), // a
    useSharedValue(0.5), // s
    useSharedValue(0.5), // s
    useSharedValue(0.5), // a
    useSharedValue(0.5), // l
    useSharedValue(0.5), // h
    useSharedValue(0.5), // a
  ];

  // Welcome text animation style
  const welcomeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: welcomeTranslateX.value }],
    };
  });

  // "to" text animation style
  const toAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: toTranslateX.value }],
    };
  });

  // Create animated styles for each letter
  const letterAnimatedStyles = letterOpacities.map((opacity, index) => {
    return useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
        transform: [
          { scale: letterScales[index].value },
          { translateY: (1 - letterScales[index].value) * -20 }
        ],
      };
    });
  });

  useEffect(() => {
    // Start the animation sequence

    // 1. Animate "Welcome" from left to center
    welcomeTranslateX.value = withTiming(0, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    // 2. Animate "to" from right to center with a slight delay
    toTranslateX.value = withDelay(
      600,
      withTiming(0, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );

    // 3. Animate each letter of "Wassalha" with a staggered delay
    const letterBaseDelay = 1400; // Start after "Welcome to" animations
    const letterStaggerDelay = 150; // Delay between each letter

    letterOpacities.forEach((opacity, index) => {
      const delay = letterBaseDelay + (index * letterStaggerDelay);

      // Animate opacity
      opacity.value = withDelay(
        delay,
        withTiming(1, {
          duration: 400,
          easing: Easing.bezier(0.42, 0, 0.58, 1),
        })
      );

      // Animate scale with a slight bounce effect
      letterScales[index].value = withDelay(
        delay,
        withSequence(
          withTiming(1.2, {
            duration: 300,
            easing: Easing.bezier(0.34, 1.56, 0.64, 1), // Bounce out easing
          }),
          withTiming(1, {
            duration: 200,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          })
        )
      );
    });

    // Set a timeout to call onAnimationComplete after 5 seconds
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Split "Wassalha" into individual letters for animation
  const wassalhaLetters = "Wassalha".split("");

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.welcomeText, welcomeAnimatedStyle]}>
        Welcome
      </Animated.Text>
      <Animated.Text style={[styles.toText, toAnimatedStyle]}>
        to
      </Animated.Text>
      <View style={styles.wassalhaContainer}>
        {wassalhaLetters.map((letter, index) => (
          <Animated.Text
            key={index}
            style={[styles.wassalhaLetter, letterAnimatedStyles[index]]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007BFF',
  },
  welcomeText: {
    color: 'white',
    fontSize: 36,
    fontWeight: '700', // You can increase weight for more emphasis
    marginBottom: 10,
    fontFamily: 'Roboto-Bold', // You can change to a better font
    letterSpacing: 1, // Adds space between letters
    textShadowColor: 'rgba(0, 0, 0, 0.2)', // Adds subtle shadow
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  toText: {
    color: 'white',
    fontSize: 28,
    marginBottom: 10,
    fontFamily: 'Roboto-Regular',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  wassalhaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wassalhaLetter: {
    color: 'white',
    fontSize: 56,
    fontWeight: '700', // Make it bold for better emphasis
    fontFamily: 'Pacifico', // Or another fancy font
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
