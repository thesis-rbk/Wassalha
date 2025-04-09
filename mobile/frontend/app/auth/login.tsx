import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Image, Platform, KeyboardAvoidingView, Keyboard } from "react-native";
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
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useStatus } from '@/context/StatusContext';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { setUser } = useAuth();


  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const redirect = process.env.EXPO_PUBLIC_REDIRECT
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      process.env.EXPO_PUBLIC_GOOGLE_AUTH,
    scopes: ["profile", "email"],
    redirectUri: redirect,
  });
  React.useEffect(() => {
    if (response) {
      console.log("Response:", JSON.stringify(response, null, 2));
      if (response?.type === "success") {
        console.log("Access Token:", response.authentication?.accessToken);
      } else {
        console.log("Error details:", response);
      }
    }
  }, [response]);
  console.log("redirecturi", redirect);

  useEffect(() => {
    console.log("Auth URL:", request?.url);
  }, [request]);

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    } else if (response?.type === "error") {
      console.error("Google login error:", response);
      alert("An error occurred during Google login. Please try again.");
    }
  }, [response]);

  const handleLogin = async () => {
    if (!email || !password) {
      if (!email) setEmailError("Email is required");
      if (!password) setPasswordError("Password is required");
      return;
    }

    dispatch(loginStart());
    try {
      console.log("Logging in...", process.env.EXPO_PUBLIC_API_URL);
      const res = await axiosInstance.post("/api/users/login", {
        email,
        password,
      });
      const data = res.data;

      if (res.status === 200) {
        // Clear any existing data
        await AsyncStorage.multiRemove(["jwtToken", "userId", "hasCompletedOnboarding"]);
        
        // Save token and user data
        await AsyncStorage.setItem("jwtToken", data.token);
        await AsyncStorage.setItem("userId", data.user.id.toString());
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
        });
        console.log("user iddddddddddddddddddddddddddddddd", data.user.id);
        
        console.log("Login successful");
        console.log("Token stored:", data.token.substring(0, 10) + "...");
        console.log("User ID stored:", data.user.id);
        
        // Store onboarding status if provided
        if (data.user.hasCompletedOnboarding !== undefined) {
          await AsyncStorage.setItem("hasCompletedOnboarding", String(!!data.user.hasCompletedOnboarding));
          console.log("Onboarding status stored:", !!data.user.hasCompletedOnboarding);
        }
        
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

  const handleGoogleLogin = async (idToken: string) => {
    //console.log("Google response:", response);

    dispatch(loginStart());
    try {
      const res = await axiosInstance.post("/api/users/google-login", {
        idToken,
      });
      const data = res.data;
      if (res.status === 200) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
        });
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
        await AsyncStorage.setItem("jwtToken", data.token);
        router.push("/home");
      }
    } catch (error) {
      console.error("Google login error:", error);
      dispatch(loginFailure("Google login failed"));
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light.background,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 20,
    },
    logo: {
      width: 110,
      height: 110,
      alignSelf: "center",
      marginBottom: 20,
      marginTop: 20,
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
    googleButton: {
      marginTop: 20,
      flexDirection: "row",
      gap: 10,
      justifyContent: "center",
      backgroundColor: Colors[colorScheme as "light" | "dark"].googleButton,
    },
    googleButtonText: {
      color: Colors[colorScheme as "light" | "dark"].text,
    },
  });

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo or Header Image */}
          <Image
            source={require("../../assets/images/globe.png")} // Use your logo
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

          {/* Google Login Button */}
          <BaseButton
            variant="secondary"
            size="login"
            style={styles.googleButton}
            onPress={() => promptAsync({ showInRecents: true })}
            disabled={!request || loading}
          >
            <FontAwesome5
              name="google"
              size={20}
              color={Colors[colorScheme as "light" | "dark"].text}
            />
            <ThemedText style={styles.googleButtonText}>
              Continue with Google
            </ThemedText>
          </BaseButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}