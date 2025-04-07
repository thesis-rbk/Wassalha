import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import ProgressBar from "../../components/ProgressBar";
import { MaterialIcons } from "@expo/vector-icons";
import axiosInstance from "@/config";
import { useLocalSearchParams } from "expo-router";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { useNotification } from "@/context/NotificationContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as atob } from "base-64";
import { io } from "socket.io-client";
import { BACKEND_URL } from "@/config";
import { useStatus } from "@/context/StatusContext";
import Header from "@/components/navigation/headers";

export default function VerificationScreen() {
  const params = useLocalSearchParams();
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { sendNotification } = useNotification();
  const { show, hide } = useStatus();
  const socket = io(`${BACKEND_URL}/processTrack`);
  const router = useRouter();

  console.log(params);

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
      show({
        type: "error",
        title: "Permission Required",
        message: "Please allow camera access to take a photo.",
        primaryAction: {
          label: "Try Again",
          onPress: () => {
            hide();
            takePhoto();
          },
        },
        secondaryAction: {
          label: "Cancel",
          onPress: () => hide(),
        },
      });
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

  // Add user data loading effect
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
          return;
        }

        const token = await AsyncStorage.getItem("jwtToken");
        if (token) {
          const tokenParts = token.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            if (payload.id) {
              setUser({
                id: payload.id,
                email: payload.email,
                name: payload.name,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
    socket.on("connect", () => {
      console.log("🔌 Orders page socket connected");
      const room = params.idProcess; // Example; get this from props, context, or params
      socket.emit("joinProcessRoom", room);
      console.log("🔌 Ophoto socket connected, ", room);
    });
    socket.on("confirmProduct", (data) => {
      router.push({
        pathname: "/processTrack/paymentSP",
        params: params,
      });
      console.log("🔄 product confirmed updated to:", data);
    });
  }, []);

  // Upload the photo for verification
  const uploadPhoto = async () => {
    if (!image) {
      show({
        type: "error",
        title: "No Image",
        message: "Please take a photo first.",
        primaryAction: {
          label: "Take Photo",
          onPress: () => {
            hide();
            takePhoto();
          },
        },
        secondaryAction: {
          label: "Cancel",
          onPress: () => hide(),
        },
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      const fileData = {
        uri: image,
        name: "verification_photo.jpg",
        type: "image/jpeg",
      };
      formData.append("file", fileData as any);
      formData.append("orderId", params.idOrder as string);

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
        sendNotification("verification_photo_submitted", {
          requesterId: params.requesterId,
          travelerId: user?.id,
          requestDetails: {
            goodsName: params.goodsName || "this product",
            requestId: params.idRequest,
            orderId: params.idOrder,
            processId: params.idProcess,
          },
        });
        socket.emit("photo", {
          processId: params.idProcess,
        });

        show({
          type: "success",
          title: "Upload Successful",
          message:
            "Photo uploaded successfully. Waiting for product confirmation.",
          primaryAction: {
            label: "OK",
            onPress: () => {
              hide();
              setIsVerified(true);
            },
          },
        });
      } else {
        throw new Error("Failed to upload photo");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      show({
        type: "error",
        title: "Upload Failed",
        message: "Failed to upload photo. Please try again.",
        primaryAction: {
          label: "Retry",
          onPress: () => {
            hide();
            uploadPhoto();
          },
        },
        secondaryAction: {
          label: "Cancel",
          onPress: () => hide(),
        },
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Verification"
        subtitle="Track your order's process"
        showBackButton={true}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Capture a photo of the product to send for validation
            </Text>

            <ProgressBar currentStep={2} steps={progressSteps} />

            {/* Description Section */}
            <Text style={styles.description}>
              Take a clear photo of the product to verify its authenticity.
              Ensure the product is well-lit and fully visible in the photo.
            </Text>

            {/* Success Message */}
            {isVerified && (
              <View style={styles.successContainer}>
                <MaterialIcons name="check-circle" size={48} color="#10b981" />
                <Text style={styles.successText}>
                  Product Image Sent Successfully!
                </Text>
              </View>
            )}

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
                    <MaterialIcons
                      name="camera-alt"
                      size={32}
                      color="#ffffff"
                    />
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
                • Avoid any reflections or shadows that could obscure the
                product details.
              </Text>
              <Text style={styles.tipItem}>
                • After taking the photo, review it for clarity before
                uploading.
              </Text>
            </View>

            <Text style={styles.description}>
              Once you upload the photo, a notification will be sent to the
              service owner for confirmation. Wait for their response before
              proceeding.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
