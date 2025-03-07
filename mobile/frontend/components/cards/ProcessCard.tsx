import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  elevation?: number;
  padding?: number;
  radius?: number;
}

export default function Card({ 
  children, 
  style, 
  elevation = 2,
  padding = 16,
  radius = 12
}: CardProps) {
  return (
    <View 
      style={[
        styles.card, 
        { 
          shadowOpacity: 0.1 * elevation,
          padding,
          borderRadius: radius,
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    marginVertical: 8,
  },
});