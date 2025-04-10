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
  interpolateColor,
  interpolate,
} from 'react-native-reanimated';
import { useFontLoader } from '../assets/fonts/fontLoader';

const { width, height } = Dimensions.get('window');

export default function WelcomeAnimation({ onAnimationComplete }: WelcomeAnimationProps) {
  // Load fonts using the existing fontLoader utility
  const fontsLoaded = useFontLoader();
  
  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.8);
  const welcomeOpacity = useSharedValue(0);
  const welcomeScale = useSharedValue(0.9);
  const toOpacity = useSharedValue(0);
  const toScale = useSharedValue(0.9);
  
  // Individual letter animations for "Wassalha"
  const letterOpacities = Array(8).fill(0).map(() => useSharedValue(0));
  const letterScales = Array(8).fill(0).map(() => useSharedValue(0.5));
  const letterRotations = Array(8).fill(0).map(() => useSharedValue(-15));
  const letterY = Array(8).fill(0).map(() => useSharedValue(30));
  const letterX = Array(8).fill(0).map((_, i) => useSharedValue(i % 2 === 0 ? -20 : 20));

  // Content container animation styles
  const contentContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [{ scale: contentScale.value }],
    };
  });

  // Welcome text animation style
  const welcomeTextStyle = useAnimatedStyle(() => {
    return {
      opacity: welcomeOpacity.value,
      transform: [
        { scale: welcomeScale.value },
        { translateY: interpolate(welcomeScale.value, [0.9, 1.05, 1], [30, -10, 0]) }
      ],
    };
  });

  // To text animation style
  const toTextStyle = useAnimatedStyle(() => {
    return {
      opacity: toOpacity.value,
      transform: [
        { scale: toScale.value },
        { translateY: interpolate(toScale.value, [0.9, 1.05, 1], [20, -5, 0]) }
      ],
    };
  });

  // Create animated styles for each letter
  const letterAnimatedStyles = letterOpacities.map((opacity, index) => {
    return useAnimatedStyle(() => {      
      return {
        opacity: opacity.value,
        transform: [
          { scale: letterScales[index].value },
          { rotate: `${letterRotations[index].value}deg` },
          { translateY: letterY[index].value },
          { translateX: letterX[index].value }
        ],
      };
    });
  });

  useEffect(() => {
    // Start with content fade in
    contentOpacity.value = withTiming(1, { duration: 800 });
    contentScale.value = withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    
    // Animate the "Welcome" text
    welcomeOpacity.value = withDelay(300, withTiming(1, { 
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    }));
    
    welcomeScale.value = withDelay(300, withSequence(
      withTiming(1.05, { duration: 700, easing: Easing.bezier(0.34, 1.56, 0.64, 1) }),
      withTiming(1, { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    ));

    // Animate the "to" text with a slight delay after "Welcome"
    toOpacity.value = withDelay(800, withTiming(1, { 
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    }));
    
    toScale.value = withDelay(800, withSequence(
      withTiming(1.05, { duration: 700, easing: Easing.bezier(0.34, 1.56, 0.64, 1) }),
      withTiming(1, { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    ));

    // Animate each letter of "Wassalha" with a staggered delay
    const letterBaseDelay = 1600; // Increased delay to start after both "Welcome" and "to"
    const letterStaggerDelay = 60;

    letterOpacities.forEach((opacity, index) => {
      const delay = letterBaseDelay + (index * letterStaggerDelay);

      // Animate opacity
      opacity.value = withDelay(
        delay,
        withTiming(1, { duration: 400 })
      );

      // Animate scale with an enhanced bounce effect
      letterScales[index].value = withDelay(
        delay,
        withSequence(
          withTiming(1.5, {
            duration: 400,
            easing: Easing.bezier(0.34, 1.56, 0.64, 1),
          }),
          withTiming(1, {
            duration: 350,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          })
        )
      );

      // Animate rotation
      letterRotations[index].value = withDelay(
        delay,
        withTiming(0, {
          duration: 500,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        })
      );

      // Animate Y position
      letterY[index].value = withDelay(
        delay,
        withTiming(0, {
          duration: 500,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        })
      );

      // Animate X position
      letterX[index].value = withDelay(
        delay,
        withTiming(0, {
          duration: 500,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        })
      );
    });

    // Set a timeout to call onAnimationComplete
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Split "Wassalha" into individual letters for animation
  const wassalhaLetters = "Wassalha".split("");

  // Return blue background even if fonts aren't loaded yet
  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.contentContainer, contentContainerStyle]}>
        <View style={styles.welcomeContainer}>
          <Animated.Text style={[styles.welcomeText, welcomeTextStyle]}>
            WELCOME
          </Animated.Text>
          <Animated.Text style={[styles.toText, toTextStyle]}>
            TO
          </Animated.Text>
        </View>
        
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
      </Animated.View>
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
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    width: '100%',
  },
  welcomeContainer: {
    alignItems: 'center',
    width: '90%',
    marginBottom: 35,
  },
  welcomeText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '600',
    fontFamily: 'Inter-Regular',
    letterSpacing: 5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 15,
  },
  toText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '600',
    fontFamily: 'Inter-Regular',
    letterSpacing: 5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  wassalhaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
    width: '100%',
    marginTop: 0,
    paddingHorizontal: 20,
  },
  wassalhaLetter: {
    color: 'white',
    fontSize: 60,
    fontWeight: '900',
    fontFamily: 'Inter-Bold',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
});
