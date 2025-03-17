import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
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
import {
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Bell,
} from "lucide-react-native";

export default function PaymentSponsor() {
  const params = useLocalSearchParams();
  const processId = params.processId;
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const [process, setProcess] = useState<any>(null);
  const [sponsorship, setSponsorship] = useState<any>(null);
  const [buyer, setBuyer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Progress steps
  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization", status: "completed" },
    { id: 2, title: "Verification", icon: "verification", status: "completed" },
    { id: 3, title: "Payment", icon: "payment", status: "current" },
    { id: 4, title: "Delivery", icon: "pickup", status: "pending" },
  ];

  // Fetch process details
  useEffect(() => {
    if (processId) {
      fetchProcessDetails();
    }
  }, [processId]);

  const fetchProcessDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/sponsorship-process/${processId}`);
      setProcess(response.data.data);
      
      // Fetch sponsorship details
      const sponsorshipResponse = await axiosInstance.get(`/api/one/${response.data.data.sponsorshipId}`);
      setSponsorship(sponsorshipResponse.data);
      
      // Fetch buyer details
      const buyerResponse = await axiosInstance.get(`/api/users/${response.data.data.buyerId}`);
      setBuyer(buyerResponse.data.data);
    } catch (error) {
      console.error("Error fetching process details:", error);
      Alert.alert("Error", "Failed to load process details");
    } finally {
      setLoading(false);
    }
  };

  const handlePrepareDelivery = () => {
    router.push({
      pathname: "/sponsorshipTrack/deliverySponsor",
      params: { processId: processId },
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
        <ThemedText style={styles.loadingText}>Loading payment details...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.title}>Payment</ThemedText>
        <ThemedText style={styles.subtitle}>
          Payment has been completed by the buyer
        </ThemedText>

        <ProgressBar currentStep={3} steps={progressSteps} />

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <CheckCircle size={24} color="#16a34a" />
            <ThemedText style={styles.statusTitle}>Payment Received</ThemedText>
          </View>
          <ThemedText style={styles.statusText}>
            {buyer?.name} has completed the payment for your {sponsorship?.platform} sponsorship.
            You can now prepare the account for delivery.
          </ThemedText>
        </View>

        <View style={styles.notificationCard}>
          <View style={styles.notificationHeader}>
            <Bell size={20} color={Colors[colorScheme].primary} />
            <ThemedText style={styles.notificationTitle}>Notifications</ThemedText>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#e2e8f0", true: "#bfdbfe" }}
              thumbColor={notificationsEnabled ? "#3b82f6" : "#cbd5e1"}
            />
          </View>
          <ThemedText style={styles.notificationText}>
            Receive notifications about this transaction
          </ThemedText>
        </View>

        <View style={styles.paymentSummary}>
          <ThemedText style={styles.summaryTitle}>Payment Summary</ThemedText>
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Sponsorship Price</ThemedText>
            <ThemedText style={styles.summaryValue}>${sponsorship?.price.toFixed(2)}</ThemedText>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Service Fee (5%)</ThemedText>
            <ThemedText style={styles.summaryValue}>-${(sponsorship?.price * 0.05).toFixed(2)}</ThemedText>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.totalLabel}>Your Earnings</ThemedText>
            <ThemedText style={styles.totalValue}>${(sponsorship?.price * 0.95).toFixed(2)}</ThemedText>
          </View>
        </View>

        <View style={styles.infoCard}>
          <ThemedText style={styles.infoTitle}>Next Steps</ThemedText>
          <ThemedText style={styles.infoText}>
            You need to prepare and deliver the {sponsorship?.platform} account to the buyer.
            You'll need to provide proof of delivery which the buyer will need to confirm.
          </ThemedText>

          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>1</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Prepare Account</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Set up the {sponsorship?.platform} account with the agreed details
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>2</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Upload Proof</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Take a screenshot or photo showing the account details
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>3</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Wait for Confirmation</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  The buyer will verify and confirm receipt of the account
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <BaseButton
          variant="primary"
          onPress={handlePrepareDelivery}
          style={styles.button}
        >
          <ThemedText style={styles.buttonText}>Prepare Delivery</ThemedText>
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
  statusCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#16a34a",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#166534",
    marginLeft: 12,
  },
  statusText: {
    fontSize: 14,
    color: "#1e293b",
    lineHeight: 20,
  },
  notificationCard: {
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
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginLeft: 8,
  },
  notificationText: {
    fontSize: 14,
    color: "#64748b",
  },
  paymentSummary: {
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
    color: "#16a34a",
  },
  infoCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 20,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#64748b",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
}); 