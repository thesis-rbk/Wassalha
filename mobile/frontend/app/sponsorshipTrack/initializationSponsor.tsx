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
import { useNotification } from "@/context/NotificationContext";
import axiosInstance from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import {
  User,
  Package,
  MapPin,
  Box,
  Info,
  Wallet,
  CheckCircle,
  XCircle,
} from "lucide-react-native";

export default function InitializationSponsor() {
  const params = useLocalSearchParams();
  const processId = params.processId;
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const [process, setProcess] = useState<any>(null);
  const [sponsorship, setSponsorship] = useState<any>(null);
  const [buyer, setBuyer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { sendNotification } = useNotification();
  const { updateSponsorshipStatus } = useSponsorshipProcess();

  // Progress steps
  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization" },
    { id: 2, title: "Verification", icon: "verification" },
    { id: 3, title: "Payment", icon: "payment" },
    { id: 4, title: "Delivery", icon: "pickup" },
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
      console.log("tryyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",response.data.data.buyerId)
      setBuyer(buyerResponse.data.data);
    } catch (error) {
      console.error("Error fetching process details:", error);
      Alert.alert("Error", "Failed to load process details");
    } finally {
      setLoading(false);
    }
  };
  const handleAccept = async () => {
    try {
      setProcessing(true);
      const result = await updateSponsorshipStatus(Number(processId), "ACCEPTED");
      
      if (result.success) {
        // Send notification to buyer
        sendNotification('sponsorship_accepted', {
          buyerId: process.buyerId,
          sponsorId: user?.id,
          processId: processId,
          sponsorshipId: process.sponsorshipId
        });
        
        Alert.alert(
          "Success", 
          "You've accepted the sponsorship request. The buyer will now proceed to payment.",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/sponsorshipTrack/verificationSponsor");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", result.message || "Failed to accept process");
      }
    } catch (error) {
      console.error("Error accepting sponsorship process:", error);
      Alert.alert("Error", "Failed to accept sponsorship process");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setProcessing(true);
      const result = await updateSponsorshipStatus(Number(processId), "REJECTED");
      
      if (result.success) {
        // Send notification to buyer
        sendNotification('sponsorship_rejected', {
          buyerId: process.buyerId,
          sponsorId: user?.id,
          processId: processId,
          sponsorshipId: process.sponsorshipId
        });
        
        Alert.alert(
          "Success", 
          "You've rejected the sponsorship request.",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", result.message || "Failed to reject process");
      }
    } catch (error) {
      console.error("Error rejecting sponsorship process:", error);
      Alert.alert("Error", "Failed to reject sponsorship process");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
        <ThemedText style={styles.loadingText}>Loading process details...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.title}>New Sponsorship Request</ThemedText>
        <ThemedText style={styles.subtitle}>
          Someone wants to purchase your sponsorship
        </ThemedText>

        <ProgressBar currentStep={1} steps={progressSteps} />

        <View style={styles.detailsContainer}>
          <ThemedText style={styles.sponsorshipTitle}>
            {sponsorship?.platform} Sponsorship
          </ThemedText>

          <View style={styles.priceCategory}>
            <View style={styles.priceContainer}>
              <Wallet size={20} color={Colors[colorScheme].primary} />
              <ThemedText style={styles.price}>
                ${sponsorship?.price.toFixed(2)}
              </ThemedText>
            </View>
            <ThemedText style={styles.category}>
              {sponsorship?.category?.name}
            </ThemedText>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Package size={20} color={Colors[colorScheme].primary} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Platform</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {sponsorship?.platform}
                </ThemedText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Info size={20} color={Colors[colorScheme].primary} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Description</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {sponsorship?.description}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.buyerSection}>
            <ThemedText style={styles.sectionTitle}>Requested by</ThemedText>

            <View style={styles.buyerCard}>
              <View style={styles.buyerHeader}>
                <View style={styles.avatarContainer}>
                  <ThemedText style={styles.avatarText}>
                    {buyer?.name?.charAt(0) || "U"}
                  </ThemedText>
                </View>
                <View style={styles.buyerInfo}>
                  <ThemedText style={styles.buyerName}>{buyer?.name}</ThemedText>
                  <View style={styles.verificationBadge}>
                    <CheckCircle size={12} color="#16a34a" />
                    <ThemedText style={styles.verificationText}>Verified User</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.termsCard}>
            <ThemedText style={styles.termsTitle}>Terms & Conditions</ThemedText>
            <ThemedText style={styles.termsText}>
              By accepting this request, you agree to:
            </ThemedText>
            <View style={styles.termsList}>
              <View style={styles.termItem}>
                <CheckCircle size={16} color="#16a34a" />
                <ThemedText style={styles.termText}>
                  Provide the digital service as described
                </ThemedText>
              </View>
              <View style={styles.termItem}>
                <CheckCircle size={16} color="#16a34a" />
                <ThemedText style={styles.termText}>
                  Deliver within 24 hours of payment
                </ThemedText>
              </View>
              <View style={styles.termItem}>
                <CheckCircle size={16} color="#16a34a" />
                <ThemedText style={styles.termText}>
                  Provide proof of delivery
                </ThemedText>
              </View>
              <View style={styles.termItem}>
                <CheckCircle size={16} color="#16a34a" />
                <ThemedText style={styles.termText}>
                  Comply with our community guidelines
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          <BaseButton
            variant="secondary"
            onPress={handleReject}
            style={[styles.button, styles.rejectButton]}
            disabled={processing}
          >
            <XCircle size={20} color="#ef4444" />
            <ThemedText style={styles.rejectButtonText}>Reject</ThemedText>
          </BaseButton>
          <BaseButton
            variant="primary"
            onPress={handleAccept}
            style={styles.button}
            disabled={processing}
          >
            <CheckCircle size={20} color="white" />
            <ThemedText style={styles.acceptButtonText}>Accept</ThemedText>
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
  detailsContainer: {
    marginTop: 24,
  },
  sponsorshipTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  priceCategory: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0284c7",
    marginLeft: 6,
  },
  category: {
    fontSize: 14,
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  infoCard: {
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  infoContent: {
    flex: 1,
    marginLeft: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#1e293b",
  },
  buyerSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  buyerCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  buyerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#64748b",
  },
  buyerInfo: {
    flex: 1,
  },
  buyerName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  verificationText: {
    fontSize: 12,
    color: "#16a34a",
    marginLeft: 4,
  },
  termsCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
  },
  termsList: {
    gap: 8,
  },
  termItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  termText: {
    fontSize: 14,
    color: "#1e293b",
    flex: 1,
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
  acceptButtonText: {
    color: "white",
    fontWeight: "600",
  },
  rejectButtonText: {
    color: "#ef4444",
    fontWeight: "600",
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