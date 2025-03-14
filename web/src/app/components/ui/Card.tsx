import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { CardProps } from '@/types/CardProps';

export function Card({ onPress, children, style }: CardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        styles.card,
        { 
          backgroundColor: Colors[colorScheme].secondary,
          shadowColor: colorScheme === 'dark' ? '#000' : '#000',
          shadowOpacity: colorScheme === 'dark' ? 0.5 : 0.25,
        },
        style
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 400,
    height: 350,
    borderRadius: 12,
    padding: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 