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
import { BodyMedium, TitleLarge } from "@/components/StyledTextProps";
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
import { useRoute, type RouteProp, useNavigation } from "@react-navigation/native"
import { RouteParams } from "@/types/Sponsorship";
import NavigationProp from "@/types/navigation.d";
export default function InitializationBuyer() {
  const route = useRoute<RouteProp<RouteParams, "SponsorshipDetails">>()
  const navigation = useNavigation<NavigationProp>();
  const params = useLocalSearchParams();
  // const sponsorshipId = params.sponsorshipId;
  const processId = params.id;
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const [sponsorship, setSponsorship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { sendNotification } = useNotification();
  const { initiateSponsorshipProcess } = useSponsorshipProcess();


  // Progress steps
  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization" },
    { id: 2, title: "Verification", icon: "verification" },
    { id: 3, title: "Payment", icon: "payment" },
    { id: 4, title: "Delivery", icon: "pickup" },
  ];
  const fetchSponsorshipDetails = async () => {
    try {
      const response = await axiosInstance.get(`/api/one/${processId}`)
      setSponsorship(response.data.sponsorship)
      console.log("ressssssssssssss .dataaaa", response.data.sponsorship)
    } catch (error) {
      console.error("Error fetching sponsorship details:", error)
    } finally {
      setLoading(false)
    }
  }

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

  // Fetch sponsorship details
  useEffect(() => {
    fetchSponsorshipDetails();
  }, [processId]);


  const handleInitiateProcess = async () => {
    try {
      setProcessing(true);

      if (!user?.id) {
        Alert.alert("Error", "User information not found. Please log in again.");
        return;
      }

      const response = await axiosInstance.post('/api/sponsorship-process/initiate', {
        sponsorshipId: Number(sponsorship.id),
        recipientId: Number(user.id)
      });
      if (response.data.success) {
        Alert.alert(
          "Success",
          "Sponsorship process initiated successfully!",
          [
            {
              text: "Continue",
              onPress: () => {
                router.push({
                  pathname: "/sponsorshipTrack/verificationBuyer",
                  params: {
                    orderId: processId,
                    sponsorshipId: sponsorship.id,
                    price: sponsorship?.price
                  }
                });
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", response.data.message || "Failed to initiate process");
      }
    } catch (error: any) {
      console.error('Error initiating process:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to initiate sponsorship process');
    } finally {
      setProcessing(false);
    }
  };

  // if (loading) {
  //   return (
  //     <ThemedView style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
  //       <ThemedText style={styles.loadingText}>Loading sponsorship details...</ThemedText>
  //     </ThemedView>
  //   );
  // }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TitleLarge style={styles.title}>Sponsorship Details</TitleLarge>
        <BodyMedium style={styles.subtitle}>
          Review the details before proceeding
        </BodyMedium>

        <ProgressBar currentStep={1} steps={progressSteps} />

        <View style={styles.detailsContainer}>
          <TitleLarge style={styles.sponsorshipTitle}>
            {sponsorship?.platform} Sponsorship
          </TitleLarge>

          <View style={styles.priceCategory}>
            <View style={styles.priceContainer}>
              <Wallet size={20} color={Colors[colorScheme].primary} />
              <BodyMedium style={styles.price}>
                ${sponsorship?.price.toFixed(2)}
              </BodyMedium>
            </View>
            <BodyMedium style={styles.category}>
              {sponsorship?.category?.name}
            </BodyMedium>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Package size={20} color={Colors[colorScheme].primary} />
              <View style={styles.infoContent}>
                <BodyMedium style={styles.infoLabel}>Platform</BodyMedium>
                <BodyMedium style={styles.infoValue}>
                  {sponsorship?.platform}
                </BodyMedium>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Info size={20} color={Colors[colorScheme].primary} />
              <View style={styles.infoContent}>
                <BodyMedium style={styles.infoLabel}>Description</BodyMedium>
                <BodyMedium style={styles.infoValue}>
                  {sponsorship?.description}
                </BodyMedium>
              </View>
            </View>
          </View>

          <View style={styles.sponsorSection}>
            <TitleLarge style={styles.sectionTitle}>Offered by</TitleLarge>

            <View style={styles.sponsorCard}>
              <View style={styles.sponsorHeader}>
                <View style={styles.avatarContainer}>
                  <ThemedText style={styles.avatarText}>
                    {getInitials(sponsorship?.sponsor?.name)}
                  </ThemedText>
                </View>
                <View style={styles.sponsorInfo}>
                  <BodyMedium style={styles.sponsorName}>
                    {getObfuscatedName(sponsorship?.sponsor?.name)}
                  </BodyMedium>
                  <View style={styles.verificationBadge}>
                    <CheckCircle size={14} color="#16a34a" />
                    <ThemedText style={styles.verificationText}>Verified Sponsor</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.termsCard}>
            <TitleLarge style={styles.termsTitle}>Terms & Conditions</TitleLarge>
            <BodyMedium style={styles.termsText}>
              By proceeding with this sponsorship, you agree to the following:
            </BodyMedium>
            <View style={styles.termsList}>
              <View style={styles.termItem}>
                <CheckCircle size={16} color="#16a34a" />
                <BodyMedium style={styles.termText}>
                  The sponsor will provide access to the specified platform
                </BodyMedium>
              </View>
              <View style={styles.termItem}>
                <CheckCircle size={16} color="#16a34a" />
                <BodyMedium style={styles.termText}>
                  Payment will be held in escrow until delivery is confirmed
                </BodyMedium>
              </View>
              <View style={styles.termItem}>
                <CheckCircle size={16} color="#16a34a" />
                <BodyMedium style={styles.termText}>
                  You must verify receipt of the sponsorship
                </BodyMedium>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <BaseButton
          variant="primary"
          size="large"
          onPress={handleInitiateProcess}
          disabled={processing}
          style={styles.button}
        >
          {processing ? "Processing..." : "Continue to Payment"}
        </BaseButton>
      </View>
    </ThemedView>
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

const getObfuscatedName = (name?: string) => {
  if (!name) return "Anonymous";
  const names = name.split(" ");
  if (names.length >= 2) {
    return `${names[0]} ${names[names.length - 1][0]}.`;
  }
  return name;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
  detailsContainer: {
    flex: 1,
    marginTop: 20,
  },
  sponsorshipTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  priceCategory: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.primary,
    marginLeft: 8,
  },
  category: {
    fontSize: 14,
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
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
  sponsorSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  sponsorCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sponsorHeader: {
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
  sponsorInfo: {
    flex: 1,
  },
  sponsorName: {
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
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "white",
  },
  button: {
    width: "100%",
  },
});