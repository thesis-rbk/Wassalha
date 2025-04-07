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
  Modal,
} from "react-native";
import ProgressBar from "../../components/ProgressBar";
import { MaterialIcons } from "@expo/vector-icons";
import axiosInstance, { BACKEND_URL } from "@/config";
import { router, useLocalSearchParams } from "expo-router";
import { Order } from "@/types";
import { useNotification } from "@/context/NotificationContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as atob } from "base-64";
import Animated from "react-native-reanimated";
import { io } from "socket.io-client";
import { useStatus } from "@/context/StatusContext";
import Header from "@/components/navigation/headers";

export default function VerificationScreen() {
  const params = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const orderId = params.idOrder;
  const [user, setUser] = useState<any>(null);
  const { sendNotification } = useNotification();
  const { show, hide } = useStatus();
  const socket = io(`${BACKEND_URL}/processTrack`, {
    transports: ["websocket"],
  });
  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization" },
    { id: 2, title: "Verification", icon: "verification" },
    { id: 3, title: "Payment", icon: "payment" },
    { id: 4, title: "Pickup", icon: "pickup" },
  ];
  const fetchOrder = async () => {
    try {
      const response = await axiosInstance.get(`/api/orders/${orderId}`);
      setOrder(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching order:", error);
      show({
        type: "error",
        title: "Loading Error",
        message: "Failed to fetch order details. Please try again.",
        primaryAction: {
          label: "Retry",
          onPress: () => {
            hide();
            fetchOrder();
          },
        },
        secondaryAction: {
          label: "Go Back",
          onPress: () => {
            hide();
            router.back();
          },
        },
      });
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchOrder();
  }, [orderId]);

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
    socket.on("photo", (data) => {
      // alert("hi");
      console.log("🔄 photo updated to:", data);
      fetchOrder();
    });
  }, []);

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
        { orderId, userId: params.requesterId, note: "Product Confirmed" }
      );

      if (response.status === 200) {
        sendNotification("product_confirmed", {
          travelerId: params.travelerId,
          requesterId: user?.id,
          requestDetails: {
            goodsName: params.goodsName || "this product",
            requestId: params.idRequest,
            orderId: params.idOrder,
            processId: params.idProcess,
          },
        });
        socket.emit("confirmProduct", {
          processId: params.idProcess,
        });

        show({
          type: "success",
          title: "Product Confirmed",
          message: "Product confirmed successfully",
          primaryAction: {
            label: "Continue to Payment",
            onPress: () => {
              hide();
              router.replace({
                pathname: "/processTrack/paymentSO",
                params: params,
              });
            },
          },
        });
      }
    } catch (error) {
      console.error("Error confirming product:", error);
      show({
        type: "error",
        title: "Confirmation Failed",
        message: "Failed to confirm product. Please try again.",
        primaryAction: {
          label: "Retry",
          onPress: () => {
            hide();
            confirmProduct();
          },
        },
        secondaryAction: {
          label: "Cancel",
          onPress: () => hide(),
        },
      });
    }
  };

  const requestAnotherPhoto = async () => {
    try {
      const response = await axiosInstance.post(
        "/api/products/request-new-photo",
        { orderId }
      );

      if (response.status === 200) {
        sendNotification("request_new_photo", {
          travelerId: params.travelerId,
          requesterId: user?.id,
          requestDetails: {
            goodsName: params.goodsName || "this product",
            requestId: params.idRequest,
            orderId: params.idOrder,
            processId: params.idProcess,
          },
        });

        show({
          type: "success",
          title: "Request Sent",
          message: "Another photo has been requested",
          primaryAction: {
            label: "OK",
            onPress: () => {
              hide();
              if (order) {
                setOrder({
                  ...order,
                  verificationImageId: undefined,
                });
              }
            },
          },
        });
      }
    } catch (error) {
      console.error("Error requesting new photo:", error);
      show({
        type: "error",
        title: "Request Failed",
        message: "Failed to request another photo. Please try again.",
        primaryAction: {
          label: "Retry",
          onPress: () => {
            hide();
            requestAnotherPhoto();
          },
        },
        secondaryAction: {
          label: "Cancel",
          onPress: () => hide(),
        },
      });
    }
  };

  const cancelProcess = async () => {
    try {
      const response = await axiosInstance.delete(`/api/process/${orderId}`);

      if (response.status === 200) {
        sendNotification("process_canceled", {
          travelerId: params.travelerId,
          requesterId: user?.id,
          requestDetails: {
            goodsName: params.goodsName || "this product",
            requestId: params.idRequest,
            orderId: params.idOrder,
            processId: params.idProcess,
          },
        });

        show({
          type: "success",
          title: "Process Cancelled",
          message: "Process has been cancelled successfully",
          primaryAction: {
            label: "Return Home",
            onPress: () => {
              hide();
              router.push("/home");
            },
          },
        });
      }
    } catch (error) {
      console.error("Error cancelling process:", error);
      show({
        type: "error",
        title: "Cancellation Failed",
        message: "Failed to cancel the process. Please try again.",
        primaryAction: {
          label: "Retry",
          onPress: () => {
            hide();
            cancelProcess();
          },
        },
        secondaryAction: {
          label: "Cancel",
          onPress: () => hide(),
        },
      });
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
      <Header
        title="Verification"
        subtitle="Track your order's process"
        showBackButton={true}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              {order?.verificationImageId
                ? "Product Image received successfully!"
                : "Waiting for the service provider to upload the product photo."}
            </Text>

            <ProgressBar currentStep={2} steps={progressSteps} />

            {!order?.verificationImageId && (
              <View style={styles.loadingContainer}>
                <MaterialIcons
                  name="hourglass-empty"
                  size={48}
                  color="#64748b"
                />
                <Text style={styles.waitingText}>
                  We are waiting for the service provider to upload the product
                  photo.
                </Text>
              </View>
            )}

            {order?.verificationImageId && (
              <View style={styles.imageSection}>
                <Text style={styles.imageTitle}>Uploaded Photo</Text>
                <TouchableOpacity onPress={() => setIsImageModalVisible(true)}>
                  <Image
                    source={{
                      uri: `${BACKEND_URL}/api/uploads/${order.verificationImage?.filename}`,
                    }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Modal for enlarged image */}
            <Modal
              visible={isImageModalVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setIsImageModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setIsImageModalVisible(false);
                  }}
                >
                  <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>

                <Animated.View style={styles.modalBackground}>
                  <Animated.Image
                    source={{
                      uri: `${BACKEND_URL}/api/uploads/${order?.verificationImage?.filename}`,
                    }}
                    style={styles.enlargedImage}
                    resizeMode="contain"
                  />
                </Animated.View>
              </View>
            </Modal>

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

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelProcess}
            >
              <Text style={styles.cancelButtonText}>Cancel Process</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  enlargedImage: {
    width: "90%",
    height: "80%",
    borderRadius: 10,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
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
