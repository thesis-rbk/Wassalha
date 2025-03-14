import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { FontFamily } from '@/assets/fonts';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { InputFieldProps } from '@/types/InputField';


export function InputFieldPassword({ label, error, placeholder, value, onChangeText, secureTextEntry }: InputFieldProps & { secureTextEntry?: boolean }) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={styles.container}>
      <Text style={[
        styles.label,
        { color: Colors[colorScheme].text }
      ]}>
        {label}
      </Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          { 
            color: Colors[colorScheme].text,
            borderColor: Colors[colorScheme].primary,
            backgroundColor: Colors[colorScheme].background,
          }
        ]}
        placeholderTextColor={Colors[colorScheme].text + '80'}
        secureTextEntry={secureTextEntry}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    width: '100%',
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 2,
    borderRadius: 12,
    fontFamily: FontFamily.regular,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  error: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: '#EF4444',
  },
}); 