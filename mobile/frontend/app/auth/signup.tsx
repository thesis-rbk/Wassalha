"use client";

import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Platform, KeyboardAvoidingView } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { InputField } from "@/components/InputField";
import { BaseButton } from "../../components/ui/buttons/BaseButton";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InputFieldPassword } from "@/components/InputFieldPassword";
import axiosInstance from "../../config";
import { useStatus } from '@/context/StatusContext';

const Signup = () => {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const { show, hide } = useStatus();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordStrength, setPasswordStrength] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [registrationStep, setRegistrationStep] = useState<string>("signup"); // signup, login, or complete

  // Password strength checker function
  const checkPasswordStrength = (pwd: string) => {
    if (pwd.length < 6) {
      return "weak";
    }
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

    if (pwd.length >= 12 && strengthScore >= 3) {
      return "strong";
    } else if (pwd.length >= 8 && strengthScore >= 2) {
      return "normal";
    } else {
      return "weak";
    }
  };

  // Validation functions
  const isNameValid = (name: string) => name.trim() !== "";
  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkPasswordRequirements = (pwd: string) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/\d/.test(pwd)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  // Handle input changes with validation
  const handleNameChange = (text: string) => {
    setName(text);
    setNameError(isNameValid(text) ? null : "Name cannot be empty");
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError(text && !isEmailValid(text) ? "Please enter a valid email address" : null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordStrength(checkPasswordStrength(text));
    setPasswordError(checkPasswordRequirements(text));
    if (confirmPassword) {
      setConfirmPasswordError(text === confirmPassword ? null : "Passwords do not match");
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setConfirmPasswordError(text && text !== password ? "Passwords do not match" : null);
  };

  // Handle login after registration
  const handleLoginAfterRegistration = async (email: string, password: string) => {
    try {
      setRegistrationStep("login");
      console.log("Logging in after registration...");
      
      // Try login with a few retries if needed
      let loginAttempts = 0;
      const maxLoginAttempts = 3;
      let loginSuccess = false;
      let userId = null;
      let authToken = null;
      let onboardingStatus = false;
      
      while (loginAttempts < maxLoginAttempts && !loginSuccess) {
        loginAttempts++;
        console.log(`Login attempt ${loginAttempts}/${maxLoginAttempts}`);
        
        try {
          const response = await axiosInstance.post("/api/users/login", {
            email,
            password
          });
          
          console.log(`Login response (attempt ${loginAttempts}):`, JSON.stringify(response.data));
          
          if (response.status === 200) {
            const { token, user } = response.data;
            
            if (!token) {
              console.error("Login successful but no token received on attempt", loginAttempts);
              // Wait a bit before next retry
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
            
            if (!user || !user.id) {
              console.error("Login successful but no user ID received on attempt", loginAttempts);
              // Wait a bit before next retry
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
            
            // Login successful with token and user ID
            console.log("Login successful on attempt", loginAttempts);
            console.log("User ID:", user.id);
            console.log("Token received:", token ? token.substring(0, 10) + "..." : "No");
            
            // Store onboarding status if available
            onboardingStatus = user.hasCompletedOnboarding || false;
            console.log("Onboarding status:", onboardingStatus);
            
            // Store token, user ID, and onboarding status
            await AsyncStorage.setItem("jwtToken", token);
            await AsyncStorage.setItem("userId", user.id.toString());
            await AsyncStorage.setItem("hasCompletedOnboarding", String(onboardingStatus));
            
            // Verify token and user ID were stored correctly
            authToken = await AsyncStorage.getItem("jwtToken");
            userId = await AsyncStorage.getItem("userId");
            
            console.log("Stored token:", authToken ? authToken.substring(0, 10) + "..." : "No");
            console.log("Stored user ID:", userId);
            
            if (authToken && userId) {
              // Verify token works by making a simple auth-required API call
              try {
                const verifyResponse = await axiosInstance.get(`/api/users/${userId}`, {
                  headers: {
                    Authorization: `Bearer ${authToken}`
                  }
                });
                
                if (verifyResponse.status === 200) {
                  console.log("Token verification successful");
                  loginSuccess = true;
                  break;
                } else {
                  console.error("Token verification failed:", verifyResponse.status);
                }
              } catch (verifyError) {
                console.error("Token verification request failed:", verifyError);
                // Still continue even if verification fails - token might still work for other requests
                loginSuccess = true;
                break;
              }
            } else {
              console.error("Failed to store token or user ID");
            }
          } else {
            console.error("Login response not OK:", response.status);
          }
        } catch (loginError: any) {
          console.error("Login error on attempt", loginAttempts, ":", loginError.message);
          if (loginError.response) {
            console.error("Error status:", loginError.response.status);
            console.error("Error data:", JSON.stringify(loginError.response.data));
          }
        }
        
        // Wait before retrying
        if (!loginSuccess && loginAttempts < maxLoginAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return loginSuccess;
    } catch (error: any) {
      console.error("Auto-login error:", error.message);
      return false;
    }
  };

  // Updated signup handler
  const handleEmailSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      if (!name) setNameError("Name is required");
      if (!email) setEmailError("Email is required");
      if (!password) setPasswordError("Password is required");
      if (!confirmPassword) setConfirmPasswordError("Confirm Password is required");
      
      // Add a status message for missing fields
      show({
        type: "error",
        title: "Incomplete Form",
        message: "Please fill in all required fields",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
      return;
    }
    if (!isNameValid(name)) {
      setNameError("Name cannot be empty");
      return;
    }
    if (!isEmailValid(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    if (passwordStrength === "weak" || checkPasswordRequirements(password)) {
      setPasswordError(
        "Password must be at least 8 characters long and include an uppercase letter and a number"
      );
      
      // Add a status message for weak password
      show({
        type: "error",
        title: "Password Strength",
        message: "Password must be at least 8 characters long and include an uppercase letter and a number",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      
      // Add a status message for password mismatch
      show({
        type: "error",
        title: "Password Mismatch",
        message: "Passwords do not match",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
      return;
    }

    setIsLoading(true);
    try {
      setRegistrationStep("signup");
      const userData = {
        name,
        email,
        password
      };

      console.log("Signing up with data:", userData);

      const res = await axiosInstance.post("/api/users/register", userData);
      
      if (res.status === 201 || res.status === 200) {
        console.log("Registration successful");
        console.log("Registration response:", JSON.stringify(res.data));
        
        // Check if registration response contains user data and token
        if (res.data && res.data.user && res.data.user.id) {
          const userId = res.data.user.id.toString();
          
          // Clear all previous data to ensure clean state
          await AsyncStorage.multiRemove(["jwtToken", "userId", "hasCompletedOnboarding"]);
          
          // Store user ID
          await AsyncStorage.setItem("userId", userId);
          console.log("Stored user ID:", userId);
          
          // Store token if provided in response
          if (res.data.token) {
            await AsyncStorage.setItem("jwtToken", res.data.token);
            console.log("Stored token from registration response");
          }
          
          // Show success message
          show({
            type: "success",
            title: "Registration Successful",
            message: "Your account has been created successfully!",
            primaryAction: {
              label: "Continue",
              onPress: () => {
                hide();
                // Navigate to profile picture page
                console.log("Navigating to profile picture setup");
                router.push({
                  pathname: "/auth/profile-picture" as any,
                  params: {
                    userId,
                    userName: name
                  }
                });
              }
            }
          });
        } else {
          setEmailError("Registration successful but user data not found. Please try logging in manually.");
          show({
            type: "error",
            title: "Registration Issue",
            message: "Registration successful but user data not found. Please try logging in manually.",
            primaryAction: {
              label: "OK",
              onPress: hide
            }
          });
          setIsLoading(false);
        }
      } else {
        setEmailError(res.data?.error || "Signup failed");
        show({
          type: "error",
          title: "Signup Failed",
          message: res.data?.error || "Signup failed. Please try again.",
          primaryAction: {
            label: "OK",
            onPress: hide
          }
        });
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Handle 409 conflict (email already exists)
      if (error.response && error.response.status === 409) {
        setEmailError("This email is already registered. Please try logging in or use a different email.");
        show({
          type: "error",
          title: "Email Already Registered",
          message: "This email is already registered. Please try logging in or use a different email.",
          primaryAction: {
            label: "OK",
            onPress: hide
          }
        });
      } else if (error.response && error.response.data && error.response.data.error) {
        // Show specific error from server
        setEmailError(error.response.data.error);
        show({
          type: "error",
          title: "Signup Failed",
          message: error.response.data.error,
          primaryAction: {
            label: "OK",
            onPress: hide
          }
        });
      } else {
        // Generic error message
        setEmailError("Something went wrong during signup. Please try again.");
        show({
          type: "error",
          title: "Signup Error",
          message: "Something went wrong during signup. Please try again.",
          primaryAction: {
            label: "OK",
            onPress: hide
          }
        });
      }
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "weak":
        return "red";
      case "normal":
        return "orange";
      case "strong":
        return "green";
      default:
        return "gray";
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
          <ThemedText style={styles.welcomeText}>Join Us!</ThemedText>
          <ThemedText style={styles.subText}>Sign up to get started</ThemedText>

          {/* Name Input */}
          <InputField
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={handleNameChange}
            error={nameError || undefined}
          />

          {/* Email Input */}
          <InputField
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={handleEmailChange}
            error={emailError || undefined}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <InputFieldPassword
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={handlePasswordChange}
            error={passwordError || undefined}
            secureTextEntry
          />
          {passwordStrength && (
            <ThemedText style={[styles.strengthText, { color: getStrengthColor() }]}>
              Password Strength: {passwordStrength}
            </ThemedText>
          )}

          {/* Confirm Password Input */}
          <InputFieldPassword
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            error={confirmPasswordError || undefined}
            secureTextEntry
          />

          {/* Signup Button */}
          <BaseButton
            variant="primary"
            size="login"
            style={styles.signupButton}
            onPress={handleEmailSignup}
            loading={isLoading}
          >
            {isLoading 
              ? registrationStep === "signup" 
                ? "Signing Up..." 
                : registrationStep === "login" 
                  ? "Logging In..." 
                  : "Completing..." 
              : "Sign Up"
            }
          </BaseButton>

          {/* Login Link */}
          <ThemedText style={styles.loginText}>
            Already have an account?{" "}
            <ThemedText style={styles.loginLink} onPress={() => router.push("/auth/login")}>
              Log In
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
    color: Colors.light.text + "80",
  },
  signupButton: {
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
  strengthText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  }
});

export default Signup;