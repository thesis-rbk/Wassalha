import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { InputFieldPassword } from "@/components/InputFieldPassword";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { useRouter } from "expo-router";
import axiosInstance from "@/config";

interface NewPasswordValidationProps {
  email?: string;
  verificationCode: string;
  onSuccess: () => void;
}

export function NewPasswordValidation({
  email,
  verificationCode,
  onSuccess,
}: NewPasswordValidationProps) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password))
      return "Must contain at least one uppercase letter";
    if (!/\d/.test(password)) return "Must contain at least one number";
    return null;
  };

  const handleSubmit = async () => {
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
          Alert.alert(
            "Error",
            `Password reset failed: ${error.response.data.error}`
          );
        } else {
          Alert.alert("Error", "Password reset failed. Please try again.");
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
        Your new password must be different from previous used passwords
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
        disabled={isLoading}
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
  inputContainer: {
    marginBottom: 24,
  },
  button: {
    marginTop: 24,
    paddingVertical: 16,
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
