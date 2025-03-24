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

interface DeliveryData {
  verificationImage?: string;
  status: string;
  // add other fields as needed
}

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
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);

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

      if (response.data?.data) {
        setDeliveryData(response.data.data);
      } else {
        setDeliveryData({
          status: 'PENDING',
          verificationImage: undefined
        });
      }
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
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Loading delivery details...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Delivery Status</ThemedText>
      
      {/* Show different content based on delivery status */}
      {deliveryData?.status === 'PENDING' && (
        <View style={styles.statusContainer}>
          <ThemedText style={styles.statusText}>
            Waiting for sponsor to deliver the sponsorship...
          </ThemedText>
        </View>
      )}

      {deliveryData?.verificationImage && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: deliveryData.verificationImage }}
            style={styles.verificationImage}
          />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusContainer: {
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    color: '#0369a1',
  },
  imageContainer: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  verificationImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
}); 