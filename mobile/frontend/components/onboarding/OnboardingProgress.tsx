import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { OnboardingProgressProps } from '@/types/OnboardingProgress';

export const OnboardingProgress = ({ currentStep, totalSteps }: OnboardingProgressProps) => {
  return (
    <View style={styles.container}>
      {Array(totalSteps).fill(0).map((_, index) => (
        <View key={index} style={styles.dotContainer}>
          <View
            style={[
              styles.dot,
              currentStep === index + 1 && styles.activeDot,
              currentStep > index + 1 && styles.completedDot
            ]}
          />
          {index < totalSteps - 1 && (
            <View 
              style={[
                styles.line,
                currentStep > index + 1 && styles.completedLine
              ]} 
            />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  activeDot: {
    backgroundColor: '#007AFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  completedDot: {
    backgroundColor: '#007AFF',
  },
  line: {
    width: 20,
    height: 2,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  completedLine: {
    backgroundColor: '#007AFF',
  },
}); 