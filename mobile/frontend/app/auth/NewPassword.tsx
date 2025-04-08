import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import { NewPasswordValidation } from "./newPasswordValidation";

const TIMER_DURATION = 900; // 15 minutes in seconds
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
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { show, hide } = useStatus();

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState<number>(TIMER_DURATION);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer <= 0) {
      Alert.alert(
        "Expired",
        "The verification code has expired. Request a new one."
      );
      setIsTimerActive(false);
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
    return `${minutes}:${secs < 10 ? "0" + secs : secs}`;
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== "")) {
      verifyCode(newCode.join(""));
    }
  };

  const verifyCode = (fullCode: string) => {
    // Here you would typically verify with your backend
    setShowPasswordForm(true);
  };

  const handleSuccess = () => {
    setIsTimerActive(false);
    Alert.alert(
      "Success",
      "Your password has been reset successfully!",
      [
        {
          text: "OK",
          onPress: () => router.push("/auth/login"),
        },
      ],
      { cancelable: false }
    );
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
          {!showPasswordForm ? (
            <>
              <ThemedText style={styles.title}>Verification Code</ThemedText>
              <ThemedText style={styles.subText}>
                Enter the 6-digit code sent to your email
              </ThemedText>

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
              <ThemedText style={styles.timerText}>
                Time remaining: {formatTime(timer)}
              </ThemedText>
            </>
          ) : (
            <NewPasswordValidation
              email={email}
              verificationCode={code.join("")}
              onSuccess={handleSuccess}
              remainingTime={timer}
              isTimerActive={isTimerActive}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: "InterBold",
    textAlign: "center",
    marginBottom: 16,
  },
  subText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    fontSize: 18,
    backgroundColor: "#F5F5F5",
  },
  timerText: {
    fontSize: 12,
    textAlign: "center",
    color: Colors.light.primary,
    marginBottom: 16,
  },
});
