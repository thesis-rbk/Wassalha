import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Image } from "expo-image";
import {
  MapPin,
  Package,
  Clock,
  Star,
  CheckCircle,
  Award,
} from "lucide-react-native";
import axiosInstance from "@/config";
import ProgressBar from "@/components/ProgressBar";
import { BACKEND_URL } from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useNotification } from "@/context/NotificationContext";
import { useStatus } from "@/context/StatusContext";
import { io } from "socket.io-client";
import Header from "@/components/navigation/headers";

export default function InitializationSO() {
  const params = useLocalSearchParams();
  const processId = params.idProcess;
  const orderId = params.idOrder;
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { sendNotification } = useNotification();
  const { show, hide } = useStatus();

  console.log(user?.id, "user data");
  // Progress steps
  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization" },
    { id: 2, title: "Verification", icon: "verification" },
    { id: 3, title: "Payment", icon: "payment" },
    { id: 4, title: "Pickup", icon: "pickup" },
  ];

  // Load user data
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
  }, []);

  // Fetch offer details
  useEffect(() => {
    fetchOrderDetails();
    console.log("InitializationSO params:", { orderId, processId, params });
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/orders/${orderId}`);
      setOrder(response.data.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      show({
        type: "error",
        title: "Loading Error",
        message: "Failed to load order details",
        primaryAction: {
          label: "Try Again",
          onPress: () => {
            hide();
            fetchOrderDetails();
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
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async () => {
    console.log("=== STARTING ACCEPT OFFER FUNCTION ===");

    try {
      setProcessing(true);
      console.log("Setting processing to true");

      console.log("Order data prepared:", JSON.stringify(params, null, 2));

      try {
        console.log("Updating offer status");
        const response = await axiosInstance.patch(
          `/api/process/${processId}/status`,
          {
            status: "INITIALIZED",
          }
        );
        console.log("Offer status updated successfully");
        const socket = io(`${BACKEND_URL}/processTrack`);
        socket.emit("processStatusUpdate", {
          processId: processId,
          status: "INITIALIZED",
        });
        console.log("📤 Emitted statut Order event immediately", processId);
        console.log("Current user ID:", user?.id);
        console.log("Request params:", params);

        console.log("🧪 DEBUGGING NOTIFICATION DATA:");
        console.log("- Logged in user:", user);
        console.log("- Params received:", params);
        console.log("- Notification data:", {
          travelerId: params.travelerId,
          status: "ACCEPTED",
          requestDetails: {
            requesterId: user?.id,
            goodsName: params.goodsName,
            requestId: params.idRequest,
            orderId: params.idOrder,
          },
        });

        sendNotification("offer_response", {
          travelerId: params.travelerId,
          status: "ACCEPTED",
          requestDetails: {
            requesterId: user?.id,
            goodsName: params.goodsName,
            requestId: params.idRequest,
            orderId: params.idOrder,
          },
        });

        router.replace({
          pathname: "/processTrack/verificationSO",
          params: params,
        });
      } catch (apiError) {
        console.error("=== API ERROR ===");
        console.error("Error object:", apiError);
        show({
          type: "error",
          title: "Process Error",
          message: "Failed to accept offer. Please try again.",
          primaryAction: {
            label: "Try Again",
            onPress: () => {
              hide();
              handleAcceptOffer();
            },
          },
          secondaryAction: {
            label: "Cancel",
            onPress: hide,
          },
        });
      }
    } catch (error) {
      console.error("=== GENERAL ERROR ===");
      console.error("Error object:", error);
      show({
        type: "error",
        title: "Data Error",
        message: "Failed to prepare order data",
        primaryAction: {
          label: "OK",
          onPress: hide,
        },
      });
    } finally {
      console.log("Setting processing to false");
      setProcessing(false);
      console.log("=== ENDING ACCEPT OFFER FUNCTION ===");
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? The request will become available for new offers.",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessing(true);

              // First, update the order status to CANCELLED
              const orderResponse = await axiosInstance.patch(
                `/api/orders/${order.id}/status`,
                {
                  status: "CANCELLED",
                  userId: user?.id,
                }
              );

              if (orderResponse.status === 200) {
                // Then, update the associated request directly (not using the status endpoint)
                const requestId = params.idRequest;
                if (requestId) {
                  await axiosInstance.put(`/api/requests/${requestId}`, {
                    status: "PENDING",
                  });
                }

                // Send notification about cancellation
                sendNotification("order_cancelled", {
                  travelerId: params.travelerId,
                  requestDetails: {
                    requesterId: user?.id,
                    goodsName: params.goodsName || "this item",
                    requestId: params.idRequest,
                    orderId: order.id,
                  },
                });

                Alert.alert(
                  "Order Cancelled",
                  "The request is now available for new offers.",
                  [
                    {
                      text: "OK",
                      onPress: () => router.back(),
                    },
                  ]
                );
              }
            } catch (error) {
              console.error("Error cancelling order:", error);
              Alert.alert("Error", "Failed to cancel order. Please try again.");
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
        <ThemedText style={styles.loadingText}>Loading details...</ThemedText>
      </ThemedView>
    );
  }

  const displayData = order;
  if (!displayData) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>No data found</ThemedText>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Initialization"
        subtitle="Track your order's process"
        showBackButton={true}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subtitle}>
          This is the first step of the process, check the traveler public
          details below and you can confirm if you want
        </Text>
        <ProgressBar currentStep={1} steps={progressSteps} />

        <View style={styles.detailsContainer}>
          <ThemedText style={styles.productName}>
            {offer ? offer.request.goods.name : order.request.goods.name}
          </ThemedText>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Request Details</ThemedText>

            <View style={styles.detailRow}>
              <MapPin size={16} color="#64748b" />
              <ThemedText style={styles.detailText}>
                From: {order.request.goodsLocation}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <MapPin size={16} color="#64748b" />
              <ThemedText style={styles.detailText}>
                To: {order.request.goodsDestination}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <Package size={16} color="#64748b" />
              <ThemedText style={styles.detailText}>
                Quantity: {order.request.quantity}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <Clock size={16} color="#64748b" />
              <ThemedText style={styles.detailText}>
                Estimated Delivery:{" "}
                {new Date(displayData.arrivalDate).toLocaleDateString()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Traveler</ThemedText>

            <View style={styles.travelerCard}>
              <View style={styles.travelerHeader}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarPlaceholder}>
                    <ThemedText style={styles.avatarInitials}>
                      {getInitials(params.travelerName?.toString())}
                    </ThemedText>
                  </View>

                  {params.travelerVerified && (
                    <View style={styles.verifiedBadge}>
                      <CheckCircle size={16} color="#10b981" />
                    </View>
                  )}
                </View>

                <View style={styles.travelerInfo}>
                  <ThemedText style={styles.travelerName}>
                    {getInitials(params.travelerName?.toString())}
                  </ThemedText>

                  <View style={styles.reputationRow}>
                    <View style={styles.reputationContainer}>
                      <Star size={16} color="#f59e0b" fill="#f59e0b" />
                      <ThemedText style={styles.reputationText}>
                        {parseInt(params.travelerRating.toString()).toFixed(1)}{" "}
                        ({params.travelerTotalRatings} ratings)
                      </ThemedText>
                    </View>

                    <View style={styles.experienceBadge}>
                      <Award size={14} color="#7c3aed" />
                      <ThemedText style={styles.experienceText}>
                        Level {params.travelerLevel}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.statsContainer}></View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomActions}>
          {/* Show Accept button when we have an offer */}
          {processId && order ? (
            <TouchableOpacity
              style={[styles.acceptButton, processing && styles.buttonDisabled]}
              onPress={handleAcceptOffer}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <ThemedText style={styles.buttonText}>
                  Accept and Proceed to Verification
                </ThemedText>
              )}
            </TouchableOpacity>
          ) : null}

          {/* Show Cancel button for orders */}
          {orderId && order ? (
            <TouchableOpacity
              style={[styles.cancelButton, processing && styles.buttonDisabled]}
              onPress={handleCancelOrder}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <ThemedText style={styles.cancelButtonText}>
                  Cancel Order
                </ThemedText>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const getInitials = (name?: string) => {
  if (!name) return "?";
  const names = name.split(" ");
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return names[0][0].toUpperCase();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  imageContainer: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.primary,
    marginBottom: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    color: "#64748b",
  },
  travelerCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
  },
  travelerHeader: {
    flexDirection: "row",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: "600",
    color: "#64748b",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 2,
  },
  travelerInfo: {
    flex: 1,
  },
  travelerName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  reputationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reputationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reputationText: {
    fontSize: 14,
    color: "#64748b",
  },
  experienceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  experienceText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#7c3aed",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 8,
  },
  statText: {
    fontSize: 13,
    color: "#64748b",
  },
  notesText: {
    fontSize: 16,
    color: "#64748b",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
  },
  bottomSpacer: {
    height: 80,
  },
  bottomActions: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    borderTopColor: "#e2e8f0",
    gap: 12,
  },
  acceptButton: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  backButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
