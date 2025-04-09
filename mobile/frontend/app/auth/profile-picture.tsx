"use client";

import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Platform } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import axiosInstance from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { useStatus } from "@/context/StatusContext";

const ProfilePicture = () => {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const { userId, userName } = useLocalSearchParams();
  
  const { show, hide } = useStatus();
  
  const [image, setImage] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isSkipping, setIsSkipping] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Fetch token when component mounts
  useEffect(() => {
    const getTokenAndUserId = async () => {
      try {
        const authToken = await AsyncStorage.getItem("jwtToken");
        const userIdStored = await AsyncStorage.getItem("userId");
        
        console.log("Token retrieved:", authToken ? "Found" : "Not found");
        console.log("Stored userId:", userIdStored);
        console.log("URL param userId:", userId);
        
        if (authToken) {
          setToken(authToken);
          console.log("Token set in component state");
        } else {
          console.log("No token found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error retrieving token:", error);
      }
    };
    
    getTokenAndUserId();
  }, [userId]);
  
  // Image upload handler
  const handleImageUpload = async () => {
    try {
      // Request permissions first on Android
      if (Platform.OS !== 'ios') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          show({
            type: "error",
            title: "Permission Required",
            message: "Please grant camera roll permissions to upload a photo.",
            primaryAction: {
              label: "OK",
              onPress: hide
            }
          });
          return;
        }
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];
        const imageUri = selectedImage.uri;
        
        // Get file extension from URI
        const uriParts = imageUri.split('.');
        const fileExtension = uriParts[uriParts.length - 1];

        // Create image file with proper mime type
        const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
        const imageFile = {
          uri: imageUri,
          type: mimeType,
          name: `profile-photo.${fileExtension}`,
        } as const;

        console.log("Selected image file:", imageFile);
        setImage(imageFile);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      show({
        type: "error",
        title: "Error",
        message: "Failed to select image",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
    }
  };

  // Handle upload profile picture
  const handleUploadProfilePicture = async () => {
    if (!image) {
      show({
        type: "error",
        title: "No Image",
        message: "Please select an image first or skip this step",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
      return;
    }

    // Get fresh token to ensure we have the latest
    const freshToken = await AsyncStorage.getItem("jwtToken");
    const freshUserId = await AsyncStorage.getItem("userId") || String(userId);
    
    if (!freshUserId) {
      show({
        type: "error",
        title: "Missing User ID",
        message: "Could not determine your user ID. Please try logging in again.",
        primaryAction: {
          label: "Go to Login",
          onPress: () => {
            hide();
            router.replace("/auth/login");
          }
        }
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      
      // Add the image to FormData with proper file type - using 'image' field name
      formData.append("image", {
        uri: image.uri,
        type: image.type || 'image/jpeg', 
        name: image.name || 'profile-image.jpg'
      } as any);

      console.log("Uploading profile picture for user:", freshUserId);
      console.log("Token status:", freshToken ? "Available" : "Not available");

      // Configure request with headers
      const config: any = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      
      // Add token if available
      if (freshToken) {
        config.headers["Authorization"] = `Bearer ${freshToken}`;
        console.log("Using token for upload:", freshToken.substring(0, 10) + "...");
      }
      
      try {
        console.log(`Attempting upload via endpoint: /api/users/${freshUserId}/profile-picture`);
        
        const response = await axiosInstance.post(
          `/api/users/${freshUserId}/profile-picture`, 
          formData, 
          config
        );
        
        console.log("Upload response status:", response.status);
        
        if (response.status === 200 || response.status === 201) {
          console.log("Upload successful");
          handleUploadSuccess();
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (uploadError: any) {
        console.error("Upload failed:", uploadError.message);
        
        if (uploadError.response) {
          console.error("Error response status:", uploadError.response.status);
          console.error("Error response data:", JSON.stringify(uploadError.response.data));
        }
        
        show({
          type: "error",
          title: "Upload Failed", 
          message: "Could not upload profile picture. Would you like to continue without a profile picture?",
          primaryAction: {
            label: "Continue", 
            onPress: () => {
              hide();
              navigateToHome();
            }
          },
          secondaryAction: {
            label: "Try Again", 
            onPress: () => {
              hide();
              setIsUploading(false);
            }
          }
        });
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      
      show({
        type: "error",
        title: "Profile Picture Upload", 
        message: "Failed to upload profile picture. You can continue without a profile picture.",
        primaryAction: {
          label: "Continue", 
          onPress: () => {
            hide();
            navigateToHome();
          }
        },
        secondaryAction: {
          label: "Try Again", 
          onPress: () => {
            hide();
            setIsUploading(false);
          }
        }
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle successful upload
  const handleUploadSuccess = () => {
    console.log("Profile picture uploaded successfully");
    show({
      type: "success",
      title: "Success", 
      message: "Profile picture uploaded successfully!",
      primaryAction: {
        label: "Continue", 
        onPress: () => {
          hide();
          navigateToHome();
        }
      }
    });
  };

  // Navigate to login after completing profile setup
  const navigateToHome = async () => {
    try {
      console.log("Navigating to login page after profile picture setup");
      
      // Clear all authentication data before redirecting to login
      await AsyncStorage.multiRemove(["jwtToken", "userId", "hasCompletedOnboarding"]);
      console.log("Cleared authentication data");
      
      // Redirect to login
      router.replace("/auth/login");
    } catch (error) {
      console.error("Error during navigation:", error);
      router.replace("/auth/login");
    }
  };

  // Skip profile picture setup
  const handleSkip = async () => {
    setIsSkipping(true);
    console.log("Skipping profile picture, checking onboarding status");
    
    // Use setTimeout to ensure the UI shows the button as loading
    setTimeout(() => {
      navigateToHome();
    }, 300);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Add Profile Picture</ThemedText>
        <ThemedText style={styles.subtitle}>
          Add a profile picture to personalize your account
        </ThemedText>

        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleImageUpload}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: Colors[colorScheme].primary }]}>
                <ThemedText style={styles.avatarText}>
                  {userName ? String(userName).charAt(0).toUpperCase() : "U"}
                </ThemedText>
              </View>
            )}
            <View style={[styles.editButton, { backgroundColor: Colors[colorScheme].primary }]}>
              <Feather name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <ThemedText style={styles.photoInstruction}>
            Tap to select a profile picture
          </ThemedText>
        </View>

        <View style={styles.buttonContainer}>
          <BaseButton
            variant="primary"
            size="login"
            onPress={handleUploadProfilePicture}
            loading={isUploading}
            style={styles.uploadButton}
            disabled={!image || isUploading || isSkipping}
          >
            Upload Picture
          </BaseButton>
          
          <BaseButton
            variant="secondary"
            size="login"
            onPress={handleSkip}
            style={styles.skipButton}
            loading={isSkipping}
            disabled={isUploading || isSkipping}
          >
            Skip for Now
          </BaseButton>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: Colors.light.text + "80",
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  avatarPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 60,
    fontWeight: "bold",
  },
  editButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  photoInstruction: {
    fontSize: 14,
    color: Colors.light.text + "99",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  uploadButton: {
    marginBottom: 15,
  },
  skipButton: {
    width: "100%",
  },
});

export default ProfilePicture; 