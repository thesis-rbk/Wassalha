import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import ProgressBar from "../../components/ProgressBar";
import { MaterialIcons } from "@expo/vector-icons";
import axiosInstance from "@/config";
import { router } from "expo-router";
import { BaseButton } from "@/components/ui/buttons/BaseButton";

interface FileData {
  uri: string;
  name: string;
  type: string;
}

export default function VerificationScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization" },
    { id: 2, title: "Verification", icon: "verification" },
    { id: 3, title: "Payment", icon: "payment" },
    { id: 4, title: "Pickup", icon: "pickup" },
  ];

  // Open camera to take a photo
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow camera access to take a photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Upload the photo for verification
  const uploadPhoto = async () => {
    if (!image) {
      Alert.alert("No Image", "Please take a photo first.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      const fileData: FileData = {
        uri: image,
        name: "verification_photo.jpg",
        type: "image/jpeg",
      };
      formData.append("file", fileData as any); // Type assertion due to FormData limitations

      const response = await axiosInstance.post(
        "/api/products/verify-product",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Photo uploaded successfully.");
        setIsVerified(true); // Mark as verified
      } else {
        Alert.alert("Error", "Failed to upload photo. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Confirm the product (for the user)
  const confirmProduct = async () => {
    try {
      const response = await axiosInstance.post(
        "/api/products/confirm-product",
        {
          productId: 123, // Replace with actual product ID
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Product confirmed successfully.");
        // Move to the next step (e.g., payment)
      } else {
        Alert.alert("Error", "Failed to confirm product. Please try again.");
      }
    } catch (error) {
      console.error("Error confirming product:", error);
      Alert.alert("Error", "An error occurred. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>
            Capture a photo of the product to send for validation
          </Text>

          <ProgressBar currentStep={2} steps={progressSteps} />

          {/* Description Section */}
          <Text style={styles.description}>
            Take a clear photo of the product to verify its authenticity. Ensure
            the product is well-lit and fully visible in the photo.
          </Text>

          {/* Image Upload Section */}
          {!isVerified && (
            <View style={styles.uploadSection}>
              {image ? (
                <View style={styles.previewContainer}>
                  <Text style={styles.previewTitle}>Preview</Text>
                  <Image source={{ uri: image }} style={styles.image} />
                  <BaseButton
                    style={styles.retakeButton}
                    onPress={() => setImage(null)}
                    size="medium"
                    variant="primary"
                  >
                    Retake Photo
                  </BaseButton>
                </View>
              ) : (
                <BaseButton
                  style={styles.cameraButton}
                  onPress={takePhoto}
                  size="large"
                  variant="primary"
                >
                  <MaterialIcons name="camera-alt" size={32} color="#ffffff" />
                </BaseButton>
              )}

              {image && (
                <BaseButton
                  style={styles.uploadButton}
                  onPress={uploadPhoto}
                  size="medium"
                  variant="primary"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Send Photo"}
                </BaseButton>
              )}
            </View>
          )}

          {/* Loading Indicator */}
          {isUploading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Uploading...</Text>
            </View>
          )}

          <View style={styles.tipsContainer}>
            <Text style={styles.tipTitle}>Notes:</Text>
            <Text style={styles.tipItem}>
              • Ensure the product is well-lit and the photo is clear.
            </Text>
            <Text style={styles.tipItem}>
              • Capture the entire product in the frame, avoiding any blur or
              obstructions.
            </Text>
            <Text style={styles.tipItem}>
              • Take a close-up shot if possible, highlighting any unique
              features of the product.
            </Text>
            <Text style={styles.tipItem}>
              • Avoid any reflections or shadows that could obscure the product
              details.
            </Text>
            <Text style={styles.tipItem}>
              • After taking the photo, review it for clarity before uploading.
            </Text>
          </View>

          <Text style={styles.description}>
            Once you upload the photo, a notification will be sent to the
            service owner for confirmation. Wait for their response before
            proceeding.
          </Text>

          {/* Success Message */}
          {isVerified && (
            <View style={styles.successContainer}>
              <MaterialIcons name="check-circle" size={48} color="#10b981" />
              <Text style={styles.successText}>
                Product Verified Successfully!
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
  },
  description: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
    textAlign: "center",
  },
  tipsContainer: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#f0f4f8",
    borderRadius: 8,
  },
  tipTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 8,
  },
  tipItem: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
  },
  uploadSection: {
    alignItems: "center",
    marginTop: 20,
  },
  cameraButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    alignItems: "center",
  },
  previewTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 10,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  retakeButton: {
    backgroundColor: "#ef4444",
    padding: 12,
    marginBottom: 14,
  },
  retakeButtonText: {
    color: "#ffffff",
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
  },
  uploadButton: {
    padding: 12,
  },
  uploadButtonText: {
    color: "#ffffff",
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  loadingText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    marginTop: 10,
  },
  successContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  successText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#10b981",
    marginTop: 10,
  },
  confirmationSection: {
    alignItems: "center",
    marginTop: 20,
  },
  confirmationText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    marginBottom: 10,
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: "#10b981",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
  },
});
