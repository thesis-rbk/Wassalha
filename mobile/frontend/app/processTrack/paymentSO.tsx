import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { CreditCard, Lock, CheckCircle } from "lucide-react-native";
import ProgressBar from "../../components/ProgressBar";
import Card from "../../components/cards/ProcessCard";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { router, useLocalSearchParams } from "expo-router";
import axiosInstance, { BACKEND_URL } from "@/config";
import { useNotification } from "@/context/NotificationContext";
import { useStatus } from "@/context/StatusContext";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import Header from "@/components/navigation/headers";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [userData, setUserData] = useState<any>(null);
  const { sendNotification } = useNotification();
  const { show, hide } = useStatus();
  const socket = io(`${BACKEND_URL}/processTrack`);

  const totalPrice =
    parseInt(params.quantity.toString()) * parseInt(params.price.toString());
  const travelerFee = totalPrice * 0.1;
  const serviceFee = 1;
  const totalAmount = totalPrice + travelerFee + serviceFee;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUserData(JSON.parse(userData));
          return;
        }

        const token = await AsyncStorage.getItem("jwtToken");
        if (token) {
          const tokenParts = token.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            if (payload.id) {
              setUserData({
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

  useEffect(() => {
    // Listen for socket events
    socket.on("connect", () => {
      console.log("🔌 Payment page socket connected");
      if (params.idProcess) {
        socket.emit("joinProcessRoom", params.idProcess);
        console.log(`🔌 Joined process room: ${params.idProcess}`);
      }
    });

    socket.on("confirmPayment", (data) => {
      console.log("🔄 Payment confirmed:", data);
      if (data.processId.toString() === params.idProcess?.toString()) {
        sendNotification("payment_completed", {
          travelerId: params.travelerId?.toString(),
          requesterId: user?.id,
          requestDetails: {
            goodsName: params.goodsName?.toString() || "your ordered item",
            requestId: params.idRequest?.toString(),
            orderId: params.idOrder?.toString(),
            processId: params.idProcess?.toString(),
            amount: totalAmount.toFixed(2),
          },
        });

        show({
          type: "success",
          title: "Payment Successful",
          message: "Your payment has been processed!",
          primaryAction: {
            label: "Continue",
            onPress: () => {
              hide();
              router.replace({
                pathname: "/pickup/pickup",
                params: params,
              });
            },
          },
        });
      }
    });

    socket.on("paymentFailed", (data) => {
      console.log("🔄 Payment failed:", data);
      if (data.processId.toString() === params.idProcess?.toString()) {
        show({
          type: "error",
          title: "Payment Failed",
          message: "The payment could not be completed.",
          primaryAction: {
            label: "Try Again",
            onPress: () => {
              hide();
            },
          },
        });
      }
    });

    return () => {
      socket.off("confirmPayment");
      socket.off("paymentFailed");
    };
  }, [params.idProcess]);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Validate all required params exist
      if (!params.idOrder || !params.travelerId || !params.idProcess) {
        throw new Error("Missing required order parameters");
      }

      // Prepare the request payload with proper types
      const payload = {
        amount: totalAmount,
        orderId: params.idOrder.toString(),
        travelerId: params.travelerId.toString(),
        travelerFee: travelerFee,
        processId: params.idProcess.toString(),
      };

      console.log("Sending payment request with payload:", payload);

      // 1. Initiate payment with Flouci
      const response = await axiosInstance.post(
        "api/payment-process/create-payment",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      const responseData = response.data;

      if (response.status >= 400) {
        console.error("Backend error response:", responseData);
        throw new Error(
          responseData.message ||
            `Payment failed with status ${response.status}`
        );
      }

      if (!responseData?.paymentLink || !responseData?.flouciPaymentId) {
        throw new Error("Invalid payment response from server");
      }

      // Send payment initiated notification
      if (user?.id) {
        sendNotification("payment_initiated", {
          travelerId: params.travelerId.toString(),
          requesterId: user.id,
          requestDetails: {
            goodsName: params.goodsName?.toString() || "your ordered item",
            requestId: params.idRequest.toString(),
            orderId: params.idOrder.toString(),
            processId: params.idProcess.toString(),
          },
        });
      }

      // Open payment page
      const result = await WebBrowser.openBrowserAsync(
        responseData.paymentLink
      );

      console.log("WebBrowser result:", result);

      // Set up deep link listener for payment result
      const subscription = Linking.addEventListener(
        "url",
        async (event: any) => {
          const url = new URL(event.url);

          console.log("Deep link event:", url);

          if (
            url.pathname.includes("/payment/success") ||
            url.pathname.includes("google")
          ) {
            try {
              // Verify payment with backend using flouciPaymentId
              const verification = await axiosInstance.get(
                `api/payment-process/verify/${responseData.flouciPaymentId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (verification.data.success) {
                // Payment verified successfully
                sendNotification("payment_completed", {
                  travelerId: params.travelerId.toString(),
                  requesterId: user?.id,
                  requestDetails: {
                    goodsName:
                      params.goodsName?.toString() || "your ordered item",
                    requestId: params.idRequest.toString(),
                    orderId: params.idOrder.toString(),
                    processId: params.idProcess.toString(),
                    amount: totalAmount.toFixed(2),
                  },
                });

                show({
                  type: "success",
                  title: "Payment Successful",
                  message: "Your payment has been processed!",
                  primaryAction: {
                    label: "Continue",
                    onPress: () => {
                      hide();
                      router.replace({
                        pathname: "/pickup/pickup",
                        params: params,
                      });
                    },
                  },
                });
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              show({
                type: "error",
                title: "Verification Failed",
                message: "Payment verification failed. Please contact support.",
                primaryAction: {
                  label: "OK",
                  onPress: hide,
                },
              });
            }
          } else if (
            url.pathname.includes("/payment/fail") ||
            url.pathname.includes("youtube")
          ) {
            show({
              type: "error",
              title: "Payment Failed",
              message: "The payment could not be completed.",
              primaryAction: {
                label: "OK",
                onPress: hide,
              },
            });
          }

          subscription.remove(); // Clean up listener
        }
      );

      // Set timeout for payment completion (20 minutes - Flouci's session timeout)
      setTimeout(() => {
        subscription.remove();
      }, 1200000);
    } catch (error: any) {
      console.error("Full payment error:", error);

      // Send payment failed notification
      if (user?.id) {
        sendNotification("payment_failed", {
          travelerId: params.travelerId.toString(),
          requesterId: user.id,
          requestDetails: {
            goodsName: params.goodsName?.toString() || "your ordered item",
            requestId: params.idRequest.toString(),
            orderId: params.idOrder.toString(),
            processId: params.idProcess.toString(),
            errorMessage: error.message || "Payment processing failed",
          },
        });
      }

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to process payment";

      show({
        type: "error",
        title: "Payment Error",
        message: errorMessage,
        primaryAction: {
          label: "OK",
          onPress: hide,
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization" },
    { id: 2, title: "Verification", icon: "verification" },
    { id: 3, title: "Payment", icon: "payment" },
    { id: 4, title: "Pickup", icon: "pickup" },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Payment"
        subtitle="Track your order's process"
        showBackButton={true}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Your payment will be held in escrow until delivery is confirmed
          </Text>

          <ProgressBar currentStep={3} steps={progressSteps} />

          <Card style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Order Summary</Text>

            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Item:</Text>
              <Text style={styles.orderValue}>{params.goodsName}</Text>
            </View>

            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Traveler:</Text>
              <View style={styles.travelerInfo}>
                <Text style={styles.orderValue}>
                  {getInitials(params.travelerName.toString())}
                </Text>
              </View>
            </View>

            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Price:</Text>
              <Text style={styles.priceValue}>{totalPrice.toFixed(2)} TND</Text>
            </View>

            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Traveler Fee:</Text>
              <Text style={styles.orderValue}>
                {travelerFee.toFixed(2)} TND
              </Text>
            </View>

            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Service Fee:</Text>
              <Text style={styles.orderValue}>{serviceFee.toFixed(2)} TND</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.orderRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                {totalAmount.toFixed(2)} TND
              </Text>
            </View>
          </Card>

          <View style={styles.feeNote}>
            <CreditCard size={16} color="#3b82f6" />
            <Text style={styles.feeText}>
              A <Text style={{ fontWeight: "bold" }}>10% traveler fee</Text> (
              <Text style={{ fontStyle: "italic" }}>
                {travelerFee.toFixed(2)} TND
              </Text>
              ) and a{" "}
              <Text style={{ fontWeight: "bold" }}>
                fixed and non-refundable service fee
              </Text>{" "}
              (<Text style={{ fontStyle: "italic" }}>1.00 TND</Text>) are
              included in your total.
            </Text>
          </View>

          <Card style={styles.paymentCard}>
            <Text style={styles.sectionTitle}>Payment Method</Text>

            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[styles.paymentOption, styles.selectedPaymentOption]}
              >
                <CreditCard size={24} color="#3b82f6" />
                <Text
                  style={[
                    styles.paymentOptionText,
                    styles.selectedPaymentOptionText,
                  ]}
                >
                  Flouci Payment
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.flouciContainer}>
              <Text style={styles.flouciInstructions}>
                You will be redirected to Flouci to complete your payment
                securely.
                {isProcessing && (
                  <ActivityIndicator
                    size="small"
                    color="#0000ff"
                    style={{ marginTop: 10 }}
                  />
                )}
              </Text>
            </View>
          </Card>

          <View style={styles.securityNote}>
            <Lock size={16} color="#64748b" />
            <Text style={styles.securityText}>
              Your payment information is encrypted and secure
            </Text>
          </View>

          <View style={styles.escrowNote}>
            <CheckCircle size={16} color="#10b981" />
            <Text style={styles.escrowText}>
              Payment will be held in escrow until delivery is confirmed
            </Text>
          </View>

          <BaseButton
            style={styles.payButton}
            onPress={handlePayment}
            size="large"
            variant="primary"
            disabled={isProcessing}
          >
            <Text style={styles.payButtonText}>
              {isProcessing ? "Processing..." : "Pay with Flouci"}
            </Text>
          </BaseButton>
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
    paddingBottom: 40,
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
  summaryCard: {
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#1e293b",
    marginBottom: 16,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#64748b",
  },
  orderValue: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#1e293b",
  },
  travelerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  travelerImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  priceValue: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: "#16a34a",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },
  totalLabel: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#1e293b",
  },
  totalValue: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#16a34a",
  },
  paymentCard: {
    marginTop: 16,
  },
  paymentOptions: {
    flexDirection: "row",
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 12,
    minWidth: 120,
  },
  selectedPaymentOption: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  paymentOptionText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  selectedPaymentOptionText: {
    color: "#3b82f6",
  },
  flouciContainer: {
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  flouciInstructions: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  feeNote: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  feeText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#1e40af",
    marginLeft: 8,
    flexShrink: 1,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  securityText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  escrowNote: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  escrowText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  payButton: {
    padding: 12,
    alignSelf: "center",
  },
  payButtonText: {
    color: "#ffffff",
    fontFamily: "Inter-Bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
});
