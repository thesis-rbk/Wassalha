import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import { NewPasswordValidation } from "./newPasswordValidation";
import { useStatus } from "@/context/StatusContext";

const TIMER_DURATION = 900; // 15 minutes in seconds

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
      show({
        type: 'error',
        title: 'Expired',
        message: 'The verification code has expired. Request a new one.',
        primaryAction: {
          label: 'OK',
          onPress: () => {}
        }
      });
      setIsTimerActive(false);
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
    show({
      type: 'success',
      title: 'Success',
      message: 'Your password has been reset successfully!',
      primaryAction: {
        label: 'OK',
        onPress: () => router.push("/auth/login")
      }
    });
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
