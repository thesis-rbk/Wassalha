import React, { useState, useEffect } from "react";
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
import ProgressBar from "../../components/ProgressBar";
import { MaterialIcons } from "@expo/vector-icons";
import axiosInstance, { BACKEND_URL } from "@/config";
import { router, useLocalSearchParams } from "expo-router";
import { Order } from "@/types";

export default function VerificationScreen() {
  const params = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const orderId = params.idOrder;

  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization" },
    { id: 2, title: "Verification", icon: "verification" },
    { id: 3, title: "Payment", icon: "payment" },
    { id: 4, title: "Pickup", icon: "pickup" },
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axiosInstance.get(`/api/orders/${orderId}`);
        setOrder(response.data.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching order:", error);
        Alert.alert("Error", "Failed to fetch order details");
      }
    };

    fetchOrder();
    console.log(order);
  }, [orderId]);

  const getImageUrl = () => {
    // If no image data at all, return null
    if (!params.imageUrl) return null;

    // If ordersUrl has the full path
    if (params.imageUrl.toString().startsWith("/api/uploads/")) {
      return `${BACKEND_URL}${params.imageUrl}`;
    }

    // If ordersUrl is just the filename
    if (params.imageUrl) {
      return `${BACKEND_URL}/api/uploads/${params.imageUrl}`;
    }

    console.log(params, getImageUrl());

    // If we have imageId but no direct access to filename
    // if (orders.verificationImageId) {
    //   // Use the imageId to construct the URL
    //   return `${BACKEND_URL}/api/uploads/${orders.verificationImageId}`;
    // }

    return null;
  };

  const confirmProduct = async () => {
    try {
      const response = await axiosInstance.post(
        "/api/products/confirm-product",
        {
          orderId,
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Product confirmed successfully");
        router.replace({
          pathname: "/processTrack/paymentSO",
          params: params,
        });
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
          orderId,
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Another photo has been requested");
        if (order) {
          setOrder({
            ...order,
            // verificationImageId: null,
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
      const response = await axiosInstance.delete(`/api/process/${orderId}`);

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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>
            {order?.verificationImageId
              ? "Product Image recieved successfully!"
              : "Waiting for the service provider to upload the product photo."}
          </Text>

          <ProgressBar currentStep={2} steps={progressSteps} />

          {/* Waiting Message */}
          {!order?.verificationImageId && (
            <View style={styles.loadingContainer}>
              <MaterialIcons name="hourglass-empty" size={48} color="#64748b" />
              <Text style={styles.waitingText}>
                We are waiting for the service provider to upload the product
                photo.
              </Text>
            </View>
          )}

          {/* Uploaded Image Section */}
          {order?.verificationImageId && (
            <View style={styles.imageSection}>
              <Text style={styles.imageTitle}>Uploaded Photo</Text>
              <Image
                source={{ uri: order?.verificationImage?.url }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          )}

          {/* Confirmation Section */}
          {order?.verificationImageId && (
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
    </ScrollView>
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
