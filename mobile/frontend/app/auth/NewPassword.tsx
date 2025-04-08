import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { InputFieldPassword } from '@/components/InputFieldPassword';
import { BaseButton } from '@/components/ui/buttons/BaseButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axiosInstance from '../../config';
import { useStatus } from '@/context/StatusContext';

export default function NewPassword() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { show, hide } = useStatus();

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']); // 6-digit code array
  const [timer, setTimer] = useState<number>(60); // 1 minute in seconds for testing (adjust to 300 for 5 min)
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true); // Track if timer should run

  // Refs for focusing TextInputs
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer <= 0) {
      show({
        type: 'error',
        title: 'Code Expired',
        message: 'The verification code has expired. Request a new one.',
        primaryAction: {
          label: 'OK',
          onPress: () => {
            hide();
            router.back(); // Go back to request code screen
          }
        }
      });
      setIsTimerActive(false); // Stop further alerts
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, isTimerActive]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Must contain at least one uppercase letter';
    if (!/\d/.test(password)) return 'Must contain at least one number';
    return null;
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      show({
        type: 'error',
        title: 'Invalid Code',
        message: 'Please enter a 6-digit verification code',
        primaryAction: {
          label: 'OK',
          onPress: hide
        }
      });
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    const confirmValidation = newPassword !== confirmPassword ? 'Passwords do not match' : null;

    setPasswordError(passwordValidation);
    setConfirmError(confirmValidation);

    if (!passwordValidation && !confirmValidation) {
      try {
        setIsLoading(true);
        await axiosInstance.post('/api/users/reset-password', {
          email,
          code: fullCode,
          newPassword: confirmPassword,
        });

        // Stop the timer on success
        setIsTimerActive(false);

        show({
          type: 'success',
          title: 'Password Reset',
          message: 'Your password has been reset successfully!',
          primaryAction: {
            label: 'Go to Login',
            onPress: () => {
              hide();
              router.push('/auth/login');
            }
          }
        });
      } catch (error: any) {
        if (error.response?.data?.error) {
          show({
            type: 'error',
            title: 'Reset Failed',
            message: `Password reset failed: ${error.response.data.error}`,
            primaryAction: {
              label: 'Try Again',
              onPress: hide
            }
          });
        } else {
          show({
            type: 'error',
            title: 'Reset Failed',
            message: 'Password reset failed. Please try again.',
            primaryAction: {
              label: 'OK',
              onPress: hide
            }
          });
        }
      } finally {
        setIsLoading(false);
      }
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
          <ThemedText style={styles.title}>Create New Password</ThemedText>
          <ThemedText style={styles.subText}>
            Your new password must be different from previous used passwords
          </ThemedText>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Verification Code</ThemedText>
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={styles.codeInput}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                />
              ))}
            </View>
            {isTimerActive && (
              <ThemedText style={styles.timerText}>
                Time remaining: {formatTime(timer)}
              </ThemedText>
            )}

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
            disabled={isLoading || (timer <= 0 && isTimerActive)}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </BaseButton>

          <ThemedText style={styles.loginText}>
            Remember your password?{' '}
            <ThemedText style={styles.loginLink} onPress={() => router.push('/auth/login')}>
              Login
            </ThemedText>
          </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
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
  label: {
    fontSize: 14,
    fontFamily: 'InterSemiBold',
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  codeInput: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    fontSize: 18,
    backgroundColor: '#F5F5F5',
  },
  timerText: {
    fontSize: 12,
    textAlign: 'center',
    color: Colors.light.primary,
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