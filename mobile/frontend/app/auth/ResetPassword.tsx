import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import axiosInstance from '../../config';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { InputField } from '@/components/InputField';
import { BaseButton } from '../../components/ui/buttons/BaseButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useStatus } from '@/context/StatusContext';

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const colorScheme = useColorScheme() ?? 'light';
  const { show, hide } = useStatus();
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async () => {
    if (!email) {
      show({
        type: 'error',
        title: 'Error',
        message: 'Please enter your email',
        primaryAction: {
          label: 'OK',
          onPress: hide
        }
      });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      show({
        type: 'error',
        title: 'Error',
        message: 'Please enter a valid email address',
        primaryAction: {
          label: 'OK',
          onPress: hide
        }
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axiosInstance.post(`/api/users/reset-password/request`, { email });
      
      if (response.status === 200) {
        show({
          type: 'success',
          title: 'Success',
          message: 'A reset link has been sent to your email. Check your inbox.',
          primaryAction: {
            label: 'OK',
            onPress: () => {
              hide();
              router.push({ pathname: '/auth/NewPassword', params: { email } });
            }
          }
        });
      }
    } catch (error) {
      console.error('Request reset error:', error);
      show({
        type: 'error',
        title: 'Error',
        message: (error as any).response?.data?.error || 'Failed to send reset link',
        primaryAction: {
          label: 'OK',
          onPress: hide
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText style={styles.title}>Forgot Password?</ThemedText>
          <ThemedText style={styles.subtitle}>
            Enter your email to reset password
          </ThemedText>

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
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </BaseButton>

          <ThemedText style={styles.loginText}>
            Remember your password?{" "}
            <ThemedText
              style={styles.loginLink}
              onPress={() => router.push("/auth/login")}
            >
              Login
            </ThemedText>
          </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    marginTop: 20,
  },
  loginText: {
    textAlign: "center",
    marginTop: 20,
  },
  loginLink: {
    color: Colors.light.primary,
    fontWeight: "bold",
  },
});

export default ForgotPassword;
