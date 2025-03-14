import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withRepeat,
  runOnJS,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import Svg, { Path, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const CIRCLE_RADIUS = 120;
const ANIMATION_DURATION = 2000;
const MAX_DOTS = 18;
const DOT_INTERVAL = ANIMATION_DURATION / MAX_DOTS;

export function LoadingScreen() {
  const rotation = useSharedValue(0);
  const [trailDots, setTrailDots] = useState<Array<{
    id: number,
    position: { x: number, y: number },
    age: number
  }>>([]);

  const letterOpacities = [
    useSharedValue(1), // L
    useSharedValue(1), // O
    useSharedValue(1), // A
    useSharedValue(1), // D
    useSharedValue(1), // I
    useSharedValue(1), // N
    useSharedValue(1), // G
  ];

  const addTrailDot = useCallback((angle: number) => {
    const radians = (angle * Math.PI) / 180;
    const x = CIRCLE_RADIUS * Math.cos(radians);
    const y = CIRCLE_RADIUS * Math.sin(radians);

    setTrailDots(prev => {
      const newDots = [...prev, {
        id: Date.now(),
        position: { x, y },
        age: 0
      }];

      if (newDots.length > MAX_DOTS) {
        newDots.shift(); // Remove the oldest dot
      }

      return newDots.map((dot, index) => ({
        ...dot,
        age: dot.age + 1
      }));
    });
  }, []);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: ANIMATION_DURATION,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    const interval = setInterval(() => {
      runOnJS(addTrailDot)(rotation.value % 360);
    }, DOT_INTERVAL);

    const animateLetters = () => {
      letterOpacities.forEach((opacity, index) => {
        opacity.value = withSequence(
          withDelay(
            index * 150,
            withTiming(0.3, { duration: 500, easing: Easing.inOut(Easing.ease) })
          ),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        );
      });
      setTimeout(animateLetters, 2500);
    };

    animateLetters();

    return () => clearInterval(interval);
  }, []);

  const animatedAirplaneStyle = useAnimatedStyle(() => {
    const radians = (rotation.value * Math.PI) / 180;
    return {
      transform: [
        { translateX: CIRCLE_RADIUS * Math.cos(radians) },
        { translateY: CIRCLE_RADIUS * Math.sin(radians) },
        { rotate: `${rotation.value - 90}deg` },
      ],
    };
  });

  const letterStyles = letterOpacities.map(opacity =>
    useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ scale: opacity.value * 0.3 + 0.7 }],
    }))
  );

  return (
    <View style={styles.container}>
      {/* Trail dots */}
      {trailDots.map((dot) => (
        <Animated.View
          key={dot.id}
          style={[
            styles.dot,
            {
              transform: [
                { translateX: dot.position.x },
                { translateY: dot.position.y }
              ],
              opacity: 1 - (dot.age / (MAX_DOTS / 2)) // Faster fade-out
            }
          ]}
        />
      ))}

      {/* Airplane */}
      <Animated.View style={[styles.airplaneContainer, animatedAirplaneStyle]}>
        <Svg width={60} height={60} viewBox="0 0 256 256">
          <G
            transform="translate(54.91126262566496 254.5934065934066) rotate(-105) scale(2.3 2.3)"
            fill="#00d6d5"
          >
            <Path d="M 66.362 90 c -0.062 0 -0.124 -0.006 -0.186 -0.018 c -0.325 -0.062 -0.599 -0.279 -0.73 -0.582 L 48.998 51.788 L 37.192 63.594 l 3.292 10.806 c 0.108 0.353 0.012 0.737 -0.25 0.998 l -6.436 6.436 c -0.23 0.23 -0.557 0.331 -0.88 0.278 c -0.321 -0.057 -0.594 -0.266 -0.732 -0.561 l -7.519 -16.035 L 8.383 57.88 c -0.295 -0.139 -0.504 -0.412 -0.561 -0.732 c -0.056 -0.321 0.047 -0.649 0.278 -0.88 l 6.436 -6.436 c 0.261 -0.261 0.644 -0.354 0.999 -0.25 l 10.805 3.291 l 11.872 -11.872 L 0.599 24.553 c -0.303 -0.132 -0.521 -0.406 -0.582 -0.73 c -0.062 -0.325 0.042 -0.659 0.275 -0.893 l 7.538 -7.538 c 0.239 -0.239 0.583 -0.34 0.914 -0.271 l 45.69 9.658 L 76.979 2.234 C 78.42 0.793 80.335 0 82.372 0 c 2.038 0 3.953 0.793 5.394 2.234 C 89.207 3.675 90 5.59 90 7.627 s -0.793 3.953 -2.234 5.394 L 65.223 35.565 l 9.657 45.69 c 0.069 0.331 -0.032 0.675 -0.271 0.914 l -7.539 7.538 C 66.88 89.896 66.625 90 66.362 90 z M 77.687 2.941 h 0.01 H 77.687 z" />
          </G>
        </Svg>
      </Animated.View>

      {/* Animated "LOADING" text */}
      <View style={styles.loadingTextContainer}>
        <Animated.Text style={[styles.loadingText, letterStyles[0]]}>L</Animated.Text>
        <Animated.Text style={[styles.loadingText, letterStyles[1]]}>O</Animated.Text>
        <Animated.Text style={[styles.loadingText, letterStyles[2]]}>A</Animated.Text>
        <Animated.Text style={[styles.loadingText, letterStyles[3]]}>D</Animated.Text>
        <Animated.Text style={[styles.loadingText, letterStyles[4]]}>I</Animated.Text>
        <Animated.Text style={[styles.loadingText, letterStyles[5]]}>N</Animated.Text>
        <Animated.Text style={[styles.loadingText, letterStyles[6]]}>G</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F9',
  },
  airplaneContainer: {
    position: 'absolute',
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#00d6d5',
    borderRadius: 4,
  },
  loadingTextContainer: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
  },
  loadingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00d6d5',
    marginHorizontal: 4,
  },
});