import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontFamily } from '@/assets/fonts';
import { BaseButtonProps } from '@/types/BaseButtonProps';
import React from 'react';

export function BaseButton({ 
  children, 
  variant = 'primary',
  size = 'medium',
  style,
  loading = false,
  ...props 
}: BaseButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  
  // Set background color based on variant
  let backgroundColor;
  if (variant === 'primary') {
    backgroundColor = Colors[colorScheme].primary;
  } else if (variant === 'secondary') {
    backgroundColor = '#F0F0F0'; // Default light gray for secondary buttons
  }

  return (
    <TouchableOpacity
      {...props}
      style={[
        styles.button,
        styles[size],
        { backgroundColor },
        variant === 'secondary' && styles.secondaryButton,
        style
      ]}
      disabled={loading || props.disabled}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? "#ffffff" : Colors[colorScheme].primary} size="small" />
      ) : (
        // If children is a string, wrap it in a Text component with the right style
        typeof children === 'string' ? (
          <Text 
            style={[
              styles.text, 
              variant === 'secondary' && { color: Colors[colorScheme].primary }
            ]}
          >
            {children}
          </Text>
        ) : (
          // Otherwise, just render the children directly (might be a custom component)
          children
        )
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 9999, // full rounded
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  small: {
    width: 90,
  },
  medium: {
    width: 121,
  },
  large: {
    width: 181,
  },
  login: {
    width: '100%', // Changed from fixed width to 100% for scalability
  },
  text: {
    fontFamily: FontFamily.semibold,
    fontSize: 18,
    color: '#ffffff',
  },
}); 