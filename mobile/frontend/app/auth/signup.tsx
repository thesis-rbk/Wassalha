"use client";

import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { InputField } from "@/components/InputField";
import { BaseButton } from "../../components/ui/buttons/BaseButton";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InputFieldPassword } from "@/components/InputFieldPassword";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import axiosInstance from "../../config";
const Signup = () => {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [image, setImage] = useState<any>(null);
  const [passwordStrength, setPasswordStrength] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

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

  // Image upload handler
  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];
        const imageUri = selectedImage.uri;

        const imageFile = {
          uri: imageUri,
          type: "image/jpeg",
          name: "profile-image.jpg",
        } as const;

        console.log("Selected image file:", imageFile);
        setImage(imageFile);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  // Updated signup handler with FormData and React Native Alert
  const handleEmailSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      if (!name) setNameError("Name is required");
      if (!email) setEmailError("Email is required");
      if (!password) setPasswordError("Password is required");
      if (!confirmPassword) setConfirmPasswordError("Confirm Password is required");
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
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      if (image && image.uri) {
        formData.append("image", image as any);
        console.log("Appending image:", image);
      }

      console.log("Signup payload:", Object.fromEntries(formData as any));

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          "Accept": "application/json",
        },
      };

      const res = await axiosInstance.post("/api/users/register", formData, config);
      const data = res.data;

      if (res.status === 201 || res.status === 200) {
        await AsyncStorage.setItem("jwtToken", data.token || "");
        Alert.alert(
          "Success",
          "Signup successful!",
          [
            {
              text: "OK",
              onPress: () => router.push("/auth/login"),
            },
          ],
          { cancelable: false }
        );
      } else {
        setEmailError(data.error || "Signup failed");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setEmailError(error.response?.data?.error || "Something went wrong");
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.welcomeText}>Join Us!</ThemedText>
        <ThemedText style={styles.subText}>Sign up to get started</ThemedText>

        <View style={styles.photoSection}>
          <View style={styles.avatarContainer}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: Colors[colorScheme].primary }]}>
                <ThemedText style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : "U"}</ThemedText>
              </View>
            )}
            <BaseButton
              variant="primary"
              size="medium"
              style={[styles.editButton, { backgroundColor: Colors[colorScheme].primary }]}
              onPress={handleImageUpload}
            >
              <Feather name="edit-2" size={16} color="#FFFFFF" />
            </BaseButton>
          </View>
          <ThemedText style={[styles.photoLimit, { color: Colors[colorScheme].primary }]}>
            Tap to upload a profile picture
          </ThemedText>
        </View>

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
        >
          Sign Up
        </BaseButton>

        {/* Login Link */}
        <ThemedText style={styles.loginText}>
          Already have an account?{" "}
          <ThemedText style={styles.loginLink} onPress={() => router.push("/auth/login")}>
            Log In
          </ThemedText>
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
};

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
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  photoLimit: {
    fontSize: 12,
    marginTop: 8,
  },
});

export default Signup;