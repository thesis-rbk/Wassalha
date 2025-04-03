import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { FontFamily } from '@/assets/fonts';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { InputFieldProps } from '@/types/InputField';
import { Eye, EyeOff } from 'lucide-react-native';

export function InputFieldPassword({ label, error, placeholder, value, onChangeText }: InputFieldProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[
        styles.label,
        { color: Colors[colorScheme].text }
      ]}>
        {label}
      </Text>
      <View style={[
        styles.inputContainer,
        { 
          borderColor: Colors[colorScheme].primary,
          backgroundColor: Colors[colorScheme].background,
        }
      ]}>
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          style={[
            styles.input,
            { 
              color: Colors[colorScheme].text,
            }
          ]}
          placeholderTextColor={Colors[colorScheme].text + '80'}
          secureTextEntry={!showPassword}
        />
        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          {showPassword ? (
            <EyeOff size={20} color={Colors[colorScheme].primary} />
          ) : (
            <Eye size={20} color={Colors[colorScheme].primary} />
          )}
        </Pressable>
      </View>
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
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    flex: 1,
    padding: 10,
    fontFamily: FontFamily.regular,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  error: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: '#EF4444',
  },
}); 