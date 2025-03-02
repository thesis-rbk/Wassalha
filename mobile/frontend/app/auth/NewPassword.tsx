import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { InputField } from '@/components/InputField';
import { InputFieldPassword } from '@/components/InputFieldPassword';
import { BaseButton } from '@/components/ui/buttons/BaseButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axiosInstance from '../../config';

export default function NewPassword() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('');

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Must contain at least one uppercase letter';
    if (!/\d/.test(password)) return 'Must contain at least one number';
    return null;
  };

  const handleSubmit = async () => {
    console.log('email:', email);
    const passwordValidation = validatePassword(newPassword);
    const confirmValidation = newPassword !== confirmPassword ? 'Passwords do not match' : null;

    setPasswordError(passwordValidation);
    setConfirmError(confirmValidation);

    if (!passwordValidation && !confirmValidation) {
      try {
        setIsLoading(true);
        await axiosInstance.post('/api/users/reset-password', {
          email,
          code,
          newPassword: confirmPassword
        });

        router.push('/auth/login');
      } catch (error: any) {
        if (error.response?.data?.error) {
          alert(`Password reset failed: ${error.response.data.error}`);
        } else {
          alert('Password reset failed. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require('@/assets/images/11.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />

        <ThemedText style={styles.title}>Create New Password</ThemedText>
        <ThemedText style={styles.subText}>
          Your new password must be different from previous used passwords
        </ThemedText>

        <View style={styles.inputContainer}>
          <InputField
            label="Verification Code"
            placeholder="Enter 6-digit code"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            maxLength={6}
          />

          <InputFieldPassword
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            error={passwordError || undefined}
            secureTextEntry
          />

          <InputFieldPassword
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={confirmError || undefined}
            secureTextEntry
          />
        </View>

        <BaseButton
          variant="primary"
          size="login"
          style={styles.button}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </BaseButton>

        <ThemedText style={styles.loginText}>
          Remember your password?{' '}
          <ThemedText 
            style={styles.loginLink}
            onPress={() => router.push('/auth/login')}
          >
            Login
          </ThemedText>
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'InterBold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputField: {
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
    paddingVertical: 16,
  },
  loginText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.light.primary,
    fontFamily: 'InterSemiBold',
  },
});
