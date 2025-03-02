import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { InputField } from "@/components/InputField";
import { BaseButton } from "../../components/ui/buttons/BaseButton";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../../store/authSlice";
import { RootState } from "../../store";
import axiosInstance from "../../config";
import { InputFieldPassword } from "@/components/InputFieldPassword";

export default function Login() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      if (!email) setEmailError("Email is required");
      if (!password) setPasswordError("Password is required");
      return;
    }

    dispatch(loginStart());
    try {
      const res = await axiosInstance.post("/api/users/login", {
        email,
        password,
      });
      const data = res.data;

      if (res.status === 200) {
        // Save token and user data
        await AsyncStorage.setItem("jwtToken", data.token);
        dispatch(
          loginSuccess({
            token: data.token,
            user: {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
            },
          })
        );

        // Check if onboarding is completed
        const onboardingStatus = data.user.hasCompletedOnboarding; // Assuming the backend returns this field
        if (!onboardingStatus) {
          router.push("/onboarding/howYouHeard"); // Redirect to onboarding
        } else {
          router.push("/home"); // Redirect to home
        }
      } else {
        dispatch(loginFailure("Wrong email or password"));
        setEmailError(null);
        setPasswordError(null);
      }
    } catch (error) {
      console.error("Login error:", error);
      dispatch(loginFailure("Wrong email or password"));
      setEmailError(null);
      setPasswordError(null);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo or Header Image */}
        <Image
          source={require("@/assets/images/11.jpeg")} // Use your logo
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Welcome Text */}
        <ThemedText style={styles.welcomeText}>Welcome Back!</ThemedText>
        <ThemedText style={styles.subText}>Sign in to continue</ThemedText>

        {/* Email Input */}
        <InputField
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError(null); // Clear error on change
          }}
          error={emailError || undefined}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password Input */}
        <InputFieldPassword
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError(null);
          }}
          error={passwordError || undefined}
          secureTextEntry
        />

        {/* Add this error message display */}
        {error && (
          <ThemedText style={styles.errorText}>
            Wrong email or password
          </ThemedText>
        )}

        {/* Forgot Password Link */}
        <ThemedText
          style={styles.forgotPasswordText}
          onPress={() => router.push("/auth/ResetPassword")}
        >
          Forgot Password?
        </ThemedText>

        {/* Login Button */}
        <BaseButton
          variant="primary"
          size="login"
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging In..." : "Log In"}
        </BaseButton>

        {/* Sign Up Link */}
        <ThemedText style={styles.signUpText}>
          Don't have an account?{" "}
          <ThemedText
            style={styles.signUpLink}
            onPress={() => router.push("/auth/signup")}
          >
            Sign Up
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
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: Colors.light.text + "80", // Slightly transparent
  },
  loginButton: {
    marginTop: 20,
  },
  signUpText: {
    textAlign: "center",
    marginTop: 20,
  },
  signUpLink: {
    color: Colors.light.primary,
    fontWeight: "bold",
  },
  forgotPasswordText: {
    textAlign: "right",
    marginTop: 10,
    color: Colors.light.primary,
    fontSize: 14,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },
});
