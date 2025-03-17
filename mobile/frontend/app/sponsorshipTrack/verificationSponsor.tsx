import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
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
import { Clock, CheckCircle, AlertCircle } from "lucide-react-native";

export default function VerificationSponsor() {
  const params = useLocalSearchParams();
  const processId = params.processId;
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const [process, setProcess] = useState<any>(null);
  const [sponsorship, setSponsorship] = useState<any>(null);
  const [buyer, setBuyer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Progress steps
  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization", status: "completed" },
    { id: 2, title: "Verification", icon: "verification", status: "current" },
    { id: 3, title: "Payment", icon: "payment", status: "pending" },
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

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
        <ThemedText style={styles.loadingText}>Loading verification details...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.title}>Verification</ThemedText>
        <ThemedText style={styles.subtitle}>
          Waiting for buyer to complete payment
        </ThemedText>

        <ProgressBar currentStep={2} steps={progressSteps} />

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Clock size={24} color="#eab308" />
            <ThemedText style={styles.statusTitle}>Awaiting Payment</ThemedText>
          </View>
          <ThemedText style={styles.statusText}>
            {buyer?.name} needs to complete the payment for your {sponsorship?.platform} sponsorship. 
            You'll be notified once the payment is made.
          </ThemedText>

          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.completedDot]} />
              <ThemedText style={styles.timelineText}>
                Request received
              </ThemedText>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.completedDot]} />
              <ThemedText style={styles.timelineText}>
                Request accepted by you
              </ThemedText>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.pendingDot]} />
              <ThemedText style={styles.timelineText}>
                Payment pending
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <ThemedText style={styles.infoTitle}>What happens next?</ThemedText>
          <ThemedText style={styles.infoText}>
            After the buyer completes the payment, you'll need to prepare and deliver the {sponsorship?.platform} account.
            You'll need to provide proof of delivery which the buyer will need to confirm.
          </ThemedText>

          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>1</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Wait for Payment</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  The buyer needs to complete payment through our platform
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>2</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Prepare Account</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Once payment is confirmed, prepare the account for delivery
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>3</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Provide Proof</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Upload proof of the account details for the buyer to verify
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#eab308",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#b45309",
    marginLeft: 12,
  },
  statusText: {
    fontSize: 14,
    color: "#1e293b",
    marginBottom: 16,
    lineHeight: 20,
  },
  timeline: {
    borderLeftWidth: 2,
    borderLeftColor: "#e2e8f0",
    marginLeft: 7,
    paddingLeft: 20,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: "absolute",
    left: -24,
    top: 3,
  },
  completedDot: {
    backgroundColor: "#16a34a",
  },
  pendingDot: {
    backgroundColor: "#eab308",
    borderWidth: 2,
    borderColor: "#fef9c3",
  },
  timelineText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
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