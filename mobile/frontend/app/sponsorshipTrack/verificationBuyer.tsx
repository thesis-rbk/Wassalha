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
import { Image } from "expo-image";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react-native";

export default function VerificationBuyer() {
  const params = useLocalSearchParams();
  const processId = params.processId;
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const [process, setProcess] = useState<any>(null);
  const [sponsorship, setSponsorship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { updateSponsorshipStatus } = useSponsorshipProcess();

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
    } catch (error) {
      console.error("Error fetching process details:", error);
      Alert.alert("Error", "Failed to load process details");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    router.push({
      pathname: "/sponsorshipTrack/paymentBuyer",
      params: {
        processId: processId,
        sponsorshipId: process.sponsorshipId,
        price: sponsorship.price,
      },
    });
  };

  // if (loading) {
  //   return (
  //     <ThemedView style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
  //       <ThemedText style={styles.loadingText}>Loading verification details...</ThemedText>
  //     </ThemedView>
  //   );
  // }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.title}>Verification</ThemedText>
        <ThemedText style={styles.subtitle}>
          Your sponsorship request has been accepted
        </ThemedText>

        <ProgressBar currentStep={2} steps={progressSteps} />

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <CheckCircle size={24} color="#16a34a" />
            <ThemedText style={styles.statusTitle}>Request Accepted</ThemedText>
          </View>
          <ThemedText style={styles.statusText}>
            Good news! The sponsor has accepted your request for {sponsorship?.platform} sponsorship. 
            You can now proceed to payment to secure your purchase.
          </ThemedText>

          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.completedDot]} />
              <ThemedText style={styles.timelineText}>
                Request submitted
              </ThemedText>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.completedDot]} />
              <ThemedText style={styles.timelineText}>
                Request accepted by sponsor
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
            After you complete the payment, the sponsor will be notified and will prepare your 
            {sponsorship?.platform} account. They will provide proof of delivery which you'll need to confirm.
          </ThemedText>

          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>1</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Complete Payment</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Pay securely through our platform to protect your transaction
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>2</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Wait for Delivery</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  The sponsor will prepare and deliver your account
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>3</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Confirm Receipt</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Verify the account details and confirm successful delivery
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <BaseButton
          variant="primary"
          onPress={handleProceedToPayment}
          style={styles.button}
        >
          <ThemedText style={styles.buttonText}>Proceed to Payment</ThemedText>
          <ArrowRight size={20} color="white" />
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
    color: "#16a34a",
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