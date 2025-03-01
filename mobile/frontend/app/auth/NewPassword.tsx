import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { InputFieldPassword } from '@/components/InputFieldPassword';
import { BaseButton } from '@/components/ui/buttons/BaseButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

export default function NewPassword() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Must contain at least one uppercase letter';
    if (!/\d/.test(password)) return 'Must contain at least one number';
    return null;
  };

  const handleSubmit = () => {
    const passwordValidation = validatePassword(newPassword);
    const confirmValidation = newPassword !== confirmPassword ? 'Passwords do not match' : null;

    setPasswordError(passwordValidation);
    setConfirmError(confirmValidation);

    if (!passwordValidation && !confirmValidation) {
      // Handle password reset API call here
      console.log('Submitting new password');
      router.push('/auth/login');
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
        <ThemedText style={styles.subText}>Enter your new password</ThemedText>

        <InputFieldPassword
          label="New Password"
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={setNewPassword}
          error={passwordError || undefined}
        />

        <InputFieldPassword
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={confirmError || undefined}
        />

        <BaseButton
          variant="primary"
          size="login"
          style={styles.button}
          onPress={handleSubmit}
        >
          Reset Password
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
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: Colors.light.text + '80',
  },
  button: {
    marginTop: 20,
  },
  loginText: {
    textAlign: 'center',
    marginTop: 20,
  },
  loginLink: {
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
});
