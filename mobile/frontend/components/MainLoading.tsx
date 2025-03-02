import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useRef } from 'react';
import loadingImage from '../assets/images/loading.png'; // Adjust the path as necessary
import { MainLoadingProps } from '@/types/MainLoadingProps';


const MainLoading: React.FC<MainLoadingProps> = ({ onLoadingComplete }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const percentageAnim = useRef(new Animated.Value(0)).current; // New animated value for percentage
  const [percentage, setPercentage] = useState('0%'); // Local state for percentage text

  useEffect(() => {
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000, // Keep the same speed
        useNativeDriver: true,
      })
    );
    rotate.start();

    // Animate percentage from 0 to 100
    const percentageAnimation = Animated.timing(percentageAnim, {
      toValue: 100,
      duration: 5000, // Duration for loading to reach 100%
      useNativeDriver: false,
    });

    // Update percentage state based on animated value
    const listenerId = percentageAnim.addListener(({ value }) => {
      setPercentage(`${Math.round(value)}%`); // Update percentage text
    });

    percentageAnimation.start(() => {
      rotate.stop(); // Stop rotation when loading is complete
      onLoadingComplete(); // Call the completion handler
    });

    return () => {
      rotate.stop();
      percentageAnim.removeListener(listenerId); // Clean up listener
    };
  }, [rotateAnim, percentageAnim, onLoadingComplete]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={loadingImage}
        style={[styles.image, { transform: [{ rotate: rotateInterpolate }] }]}
      />
      <Text style={styles.percentageText}>{percentage}</Text> {/* Displaying the percentage dynamically */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#008098', // Primary blue background
  },
  image: {
    width: 120, // Increased size by 20px
    height: 120, // Increased size by 20px
  },
  percentageText: {
    position: 'absolute',
    color: 'white',
    fontSize: 24,
    fontWeight: 'normal', // Changed to normal weight
  },
});

export default MainLoading; 