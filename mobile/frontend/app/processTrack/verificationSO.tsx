import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import ProgressBar from "../../components/ProgressBar";
import { MaterialIcons } from "@expo/vector-icons";
import axiosInstance from "@/config";
import { router, useLocalSearchParams } from "expo-router";
import { User } from "@/types";
import { Goods } from "@/types";

interface Request {
  id: number;
  userId: number;
  user: User;
  goodsId: number;
  goods: Goods;
  quantity: number;
  goodsLocation: string;
  goodsDestination: string;
  pickupId?: number;
  date: Date;
  status: "PENDING" | "ACCEPTED" | "CANCELLED" | "REJECTED";
  withBox?: boolean;
  verificationImage: string | null;
  isVerified?: boolean;
  verificationStatus?: "NEEDS_VERIFICATION" | "NEEDS_NEW_PHOTO" | "VERIFIED";
}

export default function VerificationScreen() {
  const params = useLocalSearchParams();
  const [request, setRequest] = useState<Request | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestId = params.idRequest;

  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization" },
    { id: 2, title: "Verification", icon: "verification" },
    { id: 3, title: "Payment", icon: "payment" },
    { id: 4, title: "Pickup", icon: "pickup" },
  ];

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await axiosInstance.get(`/api/requests/${requestId}`);
        setRequest(response.data.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching request:", error);
        Alert.alert("Error", "Failed to fetch request details");
      }
    };

    const pollInterval = setInterval(fetchRequest, 5000); // Poll every 5 seconds
    fetchRequest(); // Initial fetch

    return () => clearInterval(pollInterval);
  }, [requestId]);

  const confirmProduct = async () => {
    try {
      const response = await axiosInstance.post(
        "/api/products/confirm-product",
        {
          requestId,
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Product confirmed successfully");
        router.push("./payment");
      }
    } catch (error) {
      console.error("Error confirming product:", error);
      Alert.alert("Error", "Failed to confirm product");
    }
  };

  const requestAnotherPhoto = async () => {
    try {
      const response = await axiosInstance.post(
        "/api/products/request-new-photo",
        {
          requestId,
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Another photo has been requested");
        if (request) {
          setRequest({
            ...request,
            verificationStatus: "NEEDS_NEW_PHOTO",
            verificationImage: null,
          });
        }
      }
    } catch (error) {
      console.error("Error requesting new photo:", error);
      Alert.alert("Error", "Failed to request another photo");
    }
  };

  const cancelProcess = async () => {
    try {
      const response = await axiosInstance.put(`/api/requests/${requestId}`, {
        status: "CANCELLED",
      });

      if (response.status === 200) {
        Alert.alert("Success", "Process cancelled successfully");
        router.push("/home");
      }
    } catch (error) {
      console.error("Error cancelling process:", error);
      Alert.alert("Error", "Failed to cancel the process");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>
          {request?.isVerified
            ? "Product verified successfully!"
            : "Waiting for the service provider to upload the product photo."}
        </Text>

        <ProgressBar currentStep={2} steps={progressSteps} />

        {/* Waiting Message */}
        {!request?.verificationImage && (
          <View style={styles.loadingContainer}>
            <MaterialIcons name="hourglass-empty" size={48} color="#64748b" />
            <Text style={styles.waitingText}>
              We are waiting for the service provider to upload the product
              photo.
            </Text>
          </View>
        )}

        {/* Uploaded Image Section */}
        {request?.verificationImage && (
          <View style={styles.imageSection}>
            <Text style={styles.imageTitle}>Uploaded Photo</Text>
            <Image
              source={{ uri: request.verificationImage }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Confirmation Section */}
        {request?.verificationImage && !request?.isVerified && (
          <View style={styles.confirmationSection}>
            <Text style={styles.confirmationText}>
              Please confirm that the product matches your expectations.
            </Text>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmProduct}
            >
              <Text style={styles.confirmButtonText}>Confirm Product</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.requestButton}
              onPress={requestAnotherPhoto}
            >
              <Text style={styles.requestButtonText}>
                Request Another Photo
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={cancelProcess}>
          <Text style={styles.cancelButtonText}>Cancel Process</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Add your styles here
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  waitingText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    marginTop: 10,
    textAlign: "center",
  },
  imageSection: {
    alignItems: "center",
    marginTop: 20,
  },
  imageTitle: {
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
    width: "100%",
    marginBottom: 10,
  },
  confirmButtonText: {
    color: "#ffffff",
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
  },
  requestButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  requestButtonText: {
    color: "#ffffff",
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  cancelButtonText: {
    color: "#ffffff",
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
  },
});
