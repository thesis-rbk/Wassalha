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
import { Image } from "expo-image";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react-native";

export default function DeliveryBuyer() {
  const params = useLocalSearchParams();
  const processId = params.processId;
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const [process, setProcess] = useState<any>(null);
  const [sponsorship, setSponsorship] = useState<any>(null);
  const [sponsor, setSponsor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const { confirmSponsorshipDelivery, requestNewVerificationPhoto } = useSponsorshipProcess();

  // Progress steps
  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization", status: "completed" },
    { id: 2, title: "Verification", icon: "verification", status: "completed" },
    { id: 3, title: "Payment", icon: "payment", status: "completed" },
    { id: 4, title: "Delivery", icon: "pickup", status: "current" },
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
      
      // Fetch sponsor details
      const sponsorResponse = await axiosInstance.get(`/api/users/${response.data.data.sponsorId}`);
      setSponsor(sponsorResponse.data.data);
    } catch (error) {
      console.error("Error fetching process details:", error);
      Alert.alert("Error", "Failed to load process details");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      setConfirming(true);
      await confirmSponsorshipDelivery(Number(processId));
      Alert.alert(
        "Success",
        "You have confirmed receipt of the account. The transaction is now complete.",
        [
          {
            text: "OK",
            onPress: () => {
              router.push("/screens/SponsorshipScreen");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error confirming delivery:", error);
      Alert.alert("Error", "Failed to confirm delivery");
    } finally {
      setConfirming(false);
    }
  };

  const handleRequestNewPhoto = async () => {
    try {
      setRejecting(true);
      await requestNewVerificationPhoto(Number(processId));
      Alert.alert(
        "Request Sent",
        "You have requested new verification from the sponsor. They will be notified to provide new details.",
        [
          {
            text: "OK",
            onPress: () => {
              fetchProcessDetails();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error requesting new photo:", error);
      Alert.alert("Error", "Failed to request new verification");
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
        <ThemedText style={styles.loadingText}>Loading delivery details...</ThemedText>
      </ThemedView>
    );
  }

  // If delivery is not yet provided
  if (!process.verificationImage) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <ThemedText style={styles.title}>Delivery</ThemedText>
          <ThemedText style={styles.subtitle}>
            Waiting for sponsor to provide account details
          </ThemedText>

          <ProgressBar currentStep={4} steps={progressSteps} />

          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Clock size={24} color="#eab308" />
              <ThemedText style={styles.statusTitle}>Awaiting Delivery</ThemedText>
            </View>
            <ThemedText style={styles.statusText}>
              {sponsor?.name} is preparing your {sponsorship?.platform} account.
              You'll be notified once they provide the account details.
            </ThemedText>
          </View>

          <View style={styles.infoCard}>
            <ThemedText style={styles.infoTitle}>What to Expect</ThemedText>
            <ThemedText style={styles.infoText}>
              The sponsor will provide:
            </ThemedText>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <View style={styles.infoBullet} />
                <ThemedText style={styles.infoItemText}>
                  Account login details (username/email and password)
                </ThemedText>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.infoBullet} />
                <ThemedText style={styles.infoItemText}>
                  Screenshot or photo showing the account is active
                </ThemedText>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.infoBullet} />
                <ThemedText style={styles.infoItemText}>
                  Any additional instructions for using the account
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.title}>Delivery</ThemedText>
        <ThemedText style={styles.subtitle}>
          Verify and confirm account details
        </ThemedText>

        <ProgressBar currentStep={4} steps={progressSteps} />

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <CheckCircle size={24} color="#16a34a" />
            <ThemedText style={styles.statusTitle}>Account Delivered</ThemedText>
          </View>
          <ThemedText style={styles.statusText}>
            {sponsor?.name} has provided your {sponsorship?.platform} account details.
            Please verify the information and confirm receipt.
          </ThemedText>
        </View>

        <View style={styles.detailsCard}>
          <ThemedText style={styles.detailsTitle}>Account Details</ThemedText>
          
          <View style={styles.detailsRow}>
            <ThemedText style={styles.detailsLabel}>Username/Email:</ThemedText>
            <ThemedText style={styles.detailsValue}>{process.accountDetails}</ThemedText>
          </View>
          
          <View style={styles.detailsRow}>
            <ThemedText style={styles.detailsLabel}>Password:</ThemedText>
            <ThemedText style={styles.detailsValue}>{process.accountPassword}</ThemedText>
          </View>
        </View>

        <View style={styles.imageCard}>
          <ThemedText style={styles.imageTitle}>Verification Image</ThemedText>
          <Image
            source={{ uri: process.verificationImage }}
            style={styles.verificationImage}
            contentFit="cover"
          />
        </View>

        <View style={styles.actionCard}>
          <ThemedText style={styles.actionTitle}>Confirm Receipt</ThemedText>
          <ThemedText style={styles.actionText}>
            Please verify that the account details are correct and you can access the account.
            If everything is in order, confirm receipt to complete the transaction.
          </ThemedText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          <BaseButton
            variant="secondary"
            onPress={handleRequestNewPhoto}
            style={[styles.button, styles.rejectButton]}
            disabled={rejecting || confirming}
          >
            {rejecting ? (
              <ActivityIndicator color="#ef4444" size="small" />
            ) : (
              <>
                <ThumbsDown size={20} color="#ef4444" />
                <ThemedText style={styles.rejectButtonText}>Request New Details</ThemedText>
              </>
            )}
          </BaseButton>
          
          <BaseButton
            variant="primary"
            onPress={handleConfirmDelivery}
            style={styles.button}
            disabled={confirming || rejecting}
          >
            {confirming ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <ThumbsUp size={20} color="white" />
                <ThemedText style={styles.buttonText}>Confirm Receipt</ThemedText>
              </>
            )}
          </BaseButton>
        </View>
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
    paddingBottom: 80,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
  },
  statusCard: {
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
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  statusText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
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
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3b82f6",
    marginTop: 6,
    marginRight: 8,
  },
  infoItemText: {
    fontSize: 14,
    color: "#1e293b",
    flex: 1,
  },
  detailsCard: {
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
  detailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  detailsLabel: {
    fontSize: 14,
    color: "#64748b",
    width: 120,
  },
  detailsValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
    flex: 1,
  },
  imageCard: {
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
  imageTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  verificationImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  actionCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0369a1",
    marginBottom: 8,
  },
  actionText: {
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
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  rejectButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  rejectButtonText: {
    color: "#ef4444",
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