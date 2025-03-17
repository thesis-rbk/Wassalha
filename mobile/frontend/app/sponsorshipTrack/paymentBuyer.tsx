import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import ProgressBar from "@/components/ProgressBar";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { useSponsorshipProcess } from "@/context/SponsorshipProcessContext";
import axiosInstance from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";
import {
  CreditCard,
  Lock,
  CheckCircle,
  Shield,
  DollarSign,
} from "lucide-react-native";

export default function PaymentBuyer() {
  const params = useLocalSearchParams();
  const processId = params.processId;
  const sponsorshipId = params.sponsorshipId;
  const price = parseFloat(params.price as string);
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState(null);
  const { confirmPayment, loading: paymentLoading } = useConfirmPayment();
  const { updateSponsorshipStatus } = useSponsorshipProcess();

  // Progress steps
  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization", status: "completed" },
    { id: 2, title: "Verification", icon: "verification", status: "completed" },
    { id: 3, title: "Payment", icon: "payment", status: "current" },
    { id: 4, title: "Delivery", icon: "pickup", status: "pending" },
  ];

  // Calculate fees and total
  const serviceFee = price * 0.05; // 5% service fee
  const totalAmount = price + serviceFee;

  const handlePayment = async () => {
    if (!cardDetails?.complete) {
      Alert.alert("Error", "Please complete card details");
      return;
    }

    try {
      setLoading(true);
      
      // Create payment intent on the server
      const response = await axiosInstance.post("/api/sponsorship-process/payment", {
        processId: processId,
        amount: totalAmount * 100, // Convert to cents for Stripe
      });

      if (!response.data.success || !response.data.clientSecret) {
        throw new Error("Failed to create payment intent");
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await confirmPayment(response.data.clientSecret, {
        type: "Card",
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === "Succeeded") {
        // Update process status
        await updateSponsorshipStatus(Number(processId), "PAID");
        
        // Navigate to success screen
        router.push({
          pathname: "/sponsorshipTrack/deliveryBuyer",
          params: { processId: processId },
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Payment Failed", error.message || "There was an error processing your payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.title}>Payment</ThemedText>
        <ThemedText style={styles.subtitle}>
          Complete your payment to secure your sponsorship
        </ThemedText>

        <ProgressBar currentStep={3} steps={progressSteps} />

        <View style={styles.paymentSummary}>
          <ThemedText style={styles.summaryTitle}>Payment Summary</ThemedText>
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Sponsorship Price</ThemedText>
            <ThemedText style={styles.summaryValue}>${price.toFixed(2)}</ThemedText>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Service Fee (5%)</ThemedText>
            <ThemedText style={styles.summaryValue}>${serviceFee.toFixed(2)}</ThemedText>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.totalLabel}>Total</ThemedText>
            <ThemedText style={styles.totalValue}>${totalAmount.toFixed(2)}</ThemedText>
          </View>
        </View>

        <View style={styles.paymentMethodSection}>
          <ThemedText style={styles.sectionTitle}>Payment Method</ThemedText>
          
          <View style={styles.cardContainer}>
            <CardField
              postalCodeEnabled={false}
              placeholder={{
                number: "4242 4242 4242 4242",
              }}
              cardStyle={styles.cardStyle}
              style={styles.cardField}
              onCardChange={setCardDetails}
            />
          </View>
          
          <View style={styles.securityNote}>
            <Shield size={16} color="#64748b" />
            <ThemedText style={styles.securityText}>
              Your payment information is secure and encrypted
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Lock size={20} color="#3b82f6" />
            <ThemedText style={styles.infoTitle}>Secure Transaction</ThemedText>
          </View>
          <ThemedText style={styles.infoText}>
            Your payment will be held securely until you confirm successful delivery of your sponsorship.
            This protects both you and the sponsor during the transaction.
          </ThemedText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <BaseButton
          variant="primary"
          onPress={handlePayment}
          style={styles.button}
          disabled={loading || !cardDetails?.complete}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <ThemedText style={styles.buttonText}>Pay ${totalAmount.toFixed(2)}</ThemedText>
              <DollarSign size={20} color="white" />
            </>
          )}
        </BaseButton>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
  },
  paymentSummary: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  summaryValue: {
    fontSize: 14,
    color: "#1e293b",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  paymentMethodSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardStyle: {
    backgroundColor: "#FFFFFF",
    textColor: "#1A1A1A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cardField: {
    width: "100%",
    height: 50,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  securityText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0369a1",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1e293b",
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "white",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
}); 