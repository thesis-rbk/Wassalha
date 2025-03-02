import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AwesomeAlert from 'react-native-awesome-alerts';
import { useRouter } from 'expo-router';
import axiosInstance from '../../config';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { InputField } from '@/components/InputField';
import { BaseButton } from '../../components/ui/buttons/BaseButton';
import { useColorScheme } from '@/hooks/useColorScheme';

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);
  const colorScheme = useColorScheme() ?? 'light';

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      const response = await axiosInstance.post(`/api/users/reset-password/request`, { email });
      if (response.status === 200) {
        setShowSuccessAlert(true);
        router.push({ pathname: '/auth/NewPassword', params: { email } });
      }
    } catch (error) {
      console.error('Request reset error:', error);
      Alert.alert('Error', (error as any).response?.data?.error || 'Failed to send reset link');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.title}>Forgot Password?</ThemedText>
        <ThemedText style={styles.subtitle}>Enter your email to reset password</ThemedText>

        <InputField
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={undefined}
        />

        <BaseButton
          variant="primary"
          size="login"
          style={styles.button}
          onPress={handleRequestReset}
        >
          Send Reset Link
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

      <AwesomeAlert
        show={showSuccessAlert}
        showProgress={false}
        title="Success"
        message="A reset link has been sent to your email. Check your inbox."
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor="#00FF00"
        onConfirmPressed={() => {
          setShowSuccessAlert(false);
          router.push('/auth/login');
        }}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    marginTop: 20,
  },
  loginText: {
    textAlign: 'center',
    marginTop: 20,
  },
  loginLink: {
    fontWeight: 'bold',
  },
});

export default ForgotPassword;