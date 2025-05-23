import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { CreditCard, Lock, CheckCircle } from "lucide-react-native";
import ProgressBar from "../../components/ProgressBar";
import Card from "../../components/cards/ProcessCard";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { router, useLocalSearchParams } from "expo-router";
import { BACKEND_URL } from "@/config";
import { useNotification } from "@/context/NotificationContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as atob } from "base-64";
import { io } from "socket.io-client";
import Header from "@/components/navigation/headers";
import { useStatus } from "@/context/StatusContext";

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { confirmPayment, loading } = useConfirmPayment();
  const [userData, setUserData] = useState<any>(null);
  const { sendNotification } = useNotification();
  const socket = io(`${BACKEND_URL}/processTrack`);
  const { show, hide } = useStatus();

  const totalPrice =
    parseInt(params.quantity.toString()) * parseInt(params.price.toString());
  const travelerFee = totalPrice * 0.1;
  const serviceFee = 1;
  const totalAmount = totalPrice + travelerFee + serviceFee;

  console.log(params, "paraaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaamss");

  // Add user data loading effect
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

  // Handle payment submission
  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Send payment initiated notification
      if (userData?.id) {
        sendNotification("payment_initiated", {
          travelerId: params.travelerId,
          requesterId: userData.id,
          requestDetails: {
            goodsName: params.goodsName || "your ordered item",
            requestId: params.idRequest,
            orderId: params.idOrder,
            processId: params.idProcess,
          },
        });
      }

      // Step 1: Create a payment intent
      const response = await fetch(
        `${BACKEND_URL}/api/payment-process/create-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: totalAmount * 100, // Convert to cents
            currency: "usd",
            orderId: parseInt(params.idOrder.toString()),
            requesterId: userData?.id,
            travelerId: params.travelerId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { clientSecret, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Step 2: Confirm the payment
      const { paymentIntent, error: confirmError } = await confirmPayment(
        clientSecret,
        {
          paymentMethodType: "Card",
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent) {
        // Send payment completed notification
        if (userData?.id) {
          sendNotification("payment_completed", {
            travelerId: params.travelerId,
            requesterId: userData.id,
            requestDetails: {
              goodsName: params.goodsName || "your ordered item",
              requestId: params.idRequest,
              orderId: params.idOrder,
              processId: params.idProcess,
              amount: totalAmount.toFixed(2),
            },
          });
        }
        socket.emit("confirmPayment", {
          processId: params.idProcess,
        });
        show({
          type: "success",
          title: "Success",
          message: "Payment successful!",
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
        console.log("Payment successful:", paymentIntent);
      }
    } catch (error: Error | any) {
      console.error("Payment error:", error);

      // Send payment failed notification
      if (userData?.id) {
        sendNotification("payment_failed", {
          travelerId: params.travelerId,
          requesterId: userData.id,
          requestDetails: {
            goodsName: params.goodsName || "your ordered item",
            requestId: params.idRequest,
            orderId: params.idOrder,
            processId: params.idProcess,
            errorMessage: error.message || "Payment processing failed",
          },
        });
      }

      show({
        type: "error",
        title: "Error",
        message: error.message || "Something went wrong",
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
                style={[
                  styles.paymentOption,
                  paymentMethod === "card" && styles.selectedPaymentOption,
                ]}
                onPress={() => setPaymentMethod("card")}
              >
                <CreditCard
                  size={24}
                  color={paymentMethod === "card" ? "#3b82f6" : "#64748b"}
                />
                <Text
                  style={[
                    styles.paymentOptionText,
                    paymentMethod === "card" &&
                      styles.selectedPaymentOptionText,
                  ]}
                >
                  Credit Card
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === "paypal" && styles.selectedPaymentOption,
                ]}
                onPress={() => setPaymentMethod("paypal")}
              >
                <Text
                  style={[
                    styles.paypalText,
                    paymentMethod === "paypal" &&
                      styles.selectedPaymentOptionText,
                  ]}
                >
                  PayPal
                </Text>
              </TouchableOpacity>
            </View>

            {paymentMethod === "card" && (
              <View style={styles.cardForm}>
                <CardField
                  postalCodeEnabled={false}
                  placeholders={{
                    number: "4242 4242 4242 4242",
                  }}
                  cardStyle={styles.card}
                  style={styles.cardContainer}
                />
              </View>
            )}

            {paymentMethod === "paypal" && (
              <View style={styles.paypalContainer}>
                <Text style={styles.paypalInstructions}>
                  {/* You will be redirected to PayPal to complete your payment
                securely. */}
                  Sorry but this feature is not available yet. Hope to add it
                  soon...
                </Text>
              </View>
            )}
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
            disabled={isProcessing || loading}
          >
            <Text style={styles.payButtonText}>
              {isProcessing || loading ? "Processing..." : "Complete Payment"}
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
  paypalText: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#64748b",
  },
  selectedPaymentOptionText: {
    color: "#3b82f6",
  },
  cardForm: {
    marginTop: 8,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
  cardContainer: {
    height: 50,
    marginVertical: 10,
  },
  paypalContainer: {
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  paypalInstructions: {
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
