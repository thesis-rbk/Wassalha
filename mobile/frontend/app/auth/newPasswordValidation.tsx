import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { InputFieldPassword } from "@/components/InputFieldPassword";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import axiosInstance from "../../config";
import { useStatus } from "@/context/StatusContext";

export function NewPasswordValidation({
  email,
  verificationCode,
  onSuccess,
  remainingTime,
  isTimerActive,
}: NewPasswordValidationProps) {
  const router = useRouter();
  const { show, hide } = useStatus();
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(remainingTime);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer <= 0) {
      show({
        type: 'error',
        title: 'Expired',
        message: 'The verification code has expired. Please go back and request a new one.',
        primaryAction: {
          label: 'OK',
          onPress: () => {}
        }
      });
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

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password))
      return "Must contain at least one uppercase letter";
    if (!/\d/.test(password)) return "Must contain at least one number";
    return null;
  };

  const handleSubmit = async () => {
    if (timer <= 0) {
      show({
        type: 'error',
        title: 'Error',
        message: 'The verification code has expired',
        primaryAction: {
          label: 'OK',
          onPress: () => {}
        }
      });
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    const confirmValidation =
      newPassword !== confirmPassword ? "Passwords do not match" : null;

    setPasswordError(passwordValidation);
    setConfirmError(confirmValidation);

    if (!passwordValidation && !confirmValidation) {
      try {
        setIsLoading(true);
        await axiosInstance.post("/api/users/reset-password", {
          email,
          code: verificationCode,
          newPassword: confirmPassword,
        });
        onSuccess();
      } catch (error: any) {
        if (error.response?.data?.error) {
          show({
            type: 'error',
            title: 'Error',
            message: `Password reset failed: ${error.response.data.error}`,
            primaryAction: {
              label: 'OK',
              onPress: () => {}
            }
          });
        } else {
          show({
            type: 'error',
            title: 'Error',
            message: 'Password reset failed. Please try again.',
            primaryAction: {
              label: 'OK',
              onPress: () => {}
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
      <ThemedText style={styles.title}>Create New Password</ThemedText>
      <ThemedText style={styles.subText}>
        Make sure your new password is strong and easy to remember
      </ThemedText>

      <ThemedText style={styles.timerText}>
        Time remaining: {formatTime(timer)}
      </ThemedText>

      <View style={styles.inputContainer}>
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
        disabled={isLoading || timer <= 0}
      >
        {isLoading ? "Resetting..." : "Reset Password"}
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
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
  timerText: {
    fontSize: 12,
    textAlign: "center",
    color: Colors.light.primary,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  button: {
    marginTop: 24,
  },
  loginText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.light.primary,
    fontFamily: "InterSemiBold",
  },
});
