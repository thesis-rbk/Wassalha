import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Text,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  MapPin,
  Calendar,
  Package,
  DollarSign,
  Box,
  Info,
  User,
  Star,
  Shield,
  MessageCircle,
  Award,
  Users,
  Bell,
  Wallet,
  Clock,
} from "lucide-react-native";
import { BACKEND_URL } from "@/config";
import axiosInstance from "@/config";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { TitleLarge, BodyMedium } from "@/components/Typography";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import ProgressBar from "../../components/ProgressBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as atob } from "base-64";
import { Picker } from "@react-native-picker/picker";
// import { useRoleDetection } from "@/hooks/useRoleDetection";
import Card from "@/components/cards/ProcessCard";
import { useNotification } from "@/context/NotificationContext";
import { io } from "socket.io-client";

const AIRLINE_CODES: { [key: string]: string } = {
  "Turkish Airlines": "TK",
  "Air France": "AF",
  "British Airways": "BA",
  Lufthansa: "LH",
  Emirates: "EK",
  "Qatar Airways": "QR",
  "Royal Air Maroc": "AT",
  Tunisair: "TU",
  "Air Algérie": "AH",
  "Egypt Air": "MS",
};

const FLIGHT_NUMBERS = Array.from({ length: 100 }, (_, i) =>
  (i + 100).toString()
);

const COUNTRIES = {
  USA: "US",
  FRANCE: "FR",
  SPAIN: "ES",
  GERMANY: "DE",
  ITALY: "IT",
  UK: "GB",
  CANADA: "CA",
  AUSTRALIA: "AU",
  JAPAN: "JP",
  CHINA: "CN",
  BRAZIL: "BR",
  INDIA: "IN",
  RUSSIA: "RU",
  MEXICO: "MX",
  BOLIVIA: "BO",
  MOROCCO: "MA",
  TUNISIA: "TN",
  ALGERIA: "DZ",
  TURKEY: "TR",
  PORTUGAL: "PT",
};

export default function InitializationSP() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const { sendNotification } = useNotification();

  console.log("kjslkdsldslsd", params);

  // Progress steps
  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization" },
    { id: 2, title: "Verification", icon: "verification" },
    { id: 3, title: "Payment", icon: "payment" },
    { id: 4, title: "Pickup", icon: "pickup" },
  ];

  const [requestDetails, setRequestDetails] = React.useState<any>({
    goods: {
      name: params.goodsName,
      price: Number(params.price),
      description: params.description,
      category: params.category,
      image: {
        filename:
          typeof params.imageUrl === "string"
            ? params.imageUrl.split("/").pop()
            : null,
      },
    },
    quantity: Number(params.quantity),
    goodsLocation: params.location,
    goodsDestination: params.destination,
    withBox: params.withBox === "true",
    user: {
      name: params.requesterName || "Anonymous",
      profile: {
        isVerified: params.requesterVerified === "true",
      },
      reputation: {
        score: Number(params.requesterRating),
      },
    },
  });
  const [loading, setLoading] = React.useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerDetails, setOfferDetails] = useState({
    deliveryDate: new Date(),
    departureFlightCode: "",
    arrivalFlightCode: "",
    airline: Object.keys(AIRLINE_CODES)[0],
    flightNumber: FLIGHT_NUMBERS[0],
    departureAirport: "",
    arrivalAirport: "",
  });
  const [departureAirportSuggestions, setDepartureAirportSuggestions] =
    useState([]);
  const [arrivalAirportSuggestions, setArrivalAirportSuggestions] = useState(
    []
  );
  const [isFetchingAirports, setIsFetchingAirports] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    fetchRequestDetails();
  }, [params.id]);

  useEffect(() => {
    loadUserFromToken();
  }, []);

  const fetchRequestDetails = async () => {
    try {
      // Get the request ID from params, with fallbacks
      const requestId = params.idRequest || params.id;
      console.log("Fetching details for request:", requestId);

      if (!requestId) {
        console.error("No request ID found in params:", params);
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get(`/api/requests/${requestId}`);
      setRequestDetails((prev: typeof requestDetails) => ({
        ...response.data.data,
        goods: {
          ...response.data.data.goods,
          image: response.data.data.goods.image || prev.goods.image,
        },
      }));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching request details:", error);
      Alert.alert("Error", "Failed to load request details");
      setLoading(false);
    }
  };

  async function loadUserFromToken() {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (token) {
        const tokenParts = token.split(".");
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]));
            if (payload.id) {
              setCurrentUser({
                id: payload.id.toString(),
                name: payload.name || "User from token",
                email: payload.email || "",
              });
            }
          } catch (e) {
            console.error("Error decoding token:", e);
          }
        }
      }
    } catch (e) {
      console.error("Error loading user from token:", e);
    }
  }

  const handleMakeOffer = () => {
    setShowOfferForm(true);
  };

  const handleSubmitOffer = async () => {
    try {
      setIsSubmitting(true);

      const requestId = params.idRequest || params.id || params.requestId;
      console.log("Using request ID for offer:", requestId);

      const checkResponse = await axiosInstance.get(
        `/api/requests/${requestId}`
      );
      const request = checkResponse.data.data;

      if (request.status !== "PENDING" || request.order) {
        Alert.alert(
          "Request Not Available",
          "This request already has an active order or is not accepting offers.",
          [{ text: "Back to Requests", onPress: () => router.back() }]
        );
        return;
      }

      const airlineCode = AIRLINE_CODES[offerDetails.airline];
      const flightNumber = offerDetails.flightNumber;
      const trackingNumber = `${airlineCode}${flightNumber}`;

      const orderData = {
        requestId: parseInt(
          Array.isArray(requestId) ? requestId[0] : requestId
        ),
        travelerId: currentUser?.id,
        departureDate: offerDetails.deliveryDate,
        arrivalDate: offerDetails.deliveryDate,
        trackingNumber: trackingNumber,
        orderStatus: "PENDING",
        paymentStatus: "ON_HOLD",
        departureAirport: offerDetails.departureAirport, // New field
        arrivalAirport: offerDetails.arrivalAirport, // New field
      };

      const response = await axiosInstance.post("/api/orders", orderData);

      if (response.status === 201) {
        const socket = io(`${BACKEND_URL}/processTrack`);
        socket.emit("offerMade", {
          processId: response.data.data.id,
          requestId: requestId
        });
        socket.disconnect();

        sendNotification("offer_made", {
          requesterId: params.requesterId,
          travelerId: currentUser?.id,
          requestDetails: {
            goodsName: requestDetails.goods.name,
            requestId: params.idRequest || params.id,
          },
        });

        setTimeout(() => {
          router.replace({
            pathname: "/screens/OrderSuccessScreen",
            params: {
              orderId: response.data.data.id,
              goodsName: requestDetails.goods.name,
              destination: requestDetails.goodsDestination,
            },
          });
        }, 500);
      }
    } catch (error: any) {
      console.error("Error submitting offer:", error);
      Alert.alert(
        "Error",
        "This request is not available for offers at the moment. Please try another request."
      );
    } finally {
      setIsSubmitting(false);
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

  const UserAvatar = ({ user }: { user: any }) => {
    return (
      <View style={styles.avatarContainer}>
        {user?.profile?.imageId ? (
          <Image
            source={{
              uri: `${BACKEND_URL}/api/uploads/${user.profile.imageId}`,
            }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <LinearGradient colors={["#007AFF", "#00C6FF"]} style={styles.avatar}>
            <BodyMedium style={styles.initials}>
              {getInitials(user?.name)}
            </BodyMedium>
          </LinearGradient>
        )}
        {user?.profile?.isVerified && <View style={styles.verifiedBadge} />}
      </View>
    );
  };

  const ReputationDisplay = ({
    reputation,
    isVerified,
  }: {
    reputation: any;
    isVerified: boolean;
  }) => {
    return (
      <View style={styles.reputationContainer}>
        <View style={styles.reputationItem}>
          <View style={styles.ratingHeader}>
            <Star size={16} color="#f59e0b" fill="#f59e0b" />
            <BodyMedium style={styles.ratingScore}>
              {Number(reputation.score).toFixed(1)}
            </BodyMedium>
          </View>
          <BodyMedium style={styles.ratingCount}>
            {reputation.totalRatings} ratings
          </BodyMedium>
        </View>

        <View style={styles.reputationItem}>
          <View style={styles.levelBadge}>
            <Award size={16} color="#7c3aed" />
            <BodyMedium style={styles.levelText}>
              Level {reputation.level}
            </BodyMedium>
          </View>
        </View>

        {isVerified && (
          <View style={styles.reputationItem}>
            <View style={styles.verifiedBadgeInline}>
              <Shield size={16} color="#22c55e" />
              <BodyMedium style={styles.verifiedText}>Verified</BodyMedium>
            </View>
          </View>
        )}
      </View>
    );
  };

  const fetchAirportSuggestions = async (
    query: string,
    setSuggestions: Function
  ) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsFetchingAirports(true);
    try {
      const requestBody = {
        textQuery: `${query} airport`,
        includedType: "airport",
        languageCode: "en",
      };
      const requestHeaders = {
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "Content-Type": "application/json",
        "X-Goog-FieldMask":
          "places.displayName,places.types,places.formattedAddress",
      };

      const response = await axiosInstance.post(
        "https://places.googleapis.com/v1/places:searchText",
        requestBody,
        { headers: requestHeaders }
      );

      const results = response.data.places
        .filter((place: any) => place.types.includes("airport"))
        .map((place: any) => place.displayName.text || place.formattedAddress);
      setSuggestions(results);
    } catch (error) {
      console.error("Error fetching airports from Google Places:", error);
      Alert.alert("Error", "Failed to fetch airport suggestions");
    } finally {
      setIsFetchingAirports(false);
    }
  };

  const isValidFlightCode = (code: string) => {
    const pattern = /^[A-Z]{2,3}\d{3,4}$/;
    return pattern.test(code);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <BodyMedium>Loading...</BodyMedium>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Initialization</Text>
        <Text style={styles.subtitle}>
          This is the first step of the process, check the product details below
          and you can submit an offer if you want
        </Text>

        <ProgressBar currentStep={1} steps={progressSteps} />

        {!showOfferForm && params.idOrder && (
          <Card style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Clock size={20} color="#eab308" />
              <Text style={styles.statusTitle}>
                Awaiting Requester Confirmation
              </Text>
            </View>
            <Text style={styles.statusText}>
              Your offer has been submitted successfully and the requester has
              been notified. Once he confirms your offer you will be passing to
              the verification step.
            </Text>
          </Card>
        )}

        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: `${BACKEND_URL}/api/uploads/${requestDetails.goods.image?.filename}`,
            }}
            style={styles.productImage}
            contentFit="cover"
          />
        </View>

        <View style={styles.detailsContainer}>
          <TitleLarge style={styles.title}>
            {requestDetails.goods.name}
          </TitleLarge>

          <View style={styles.priceCategory}>
            <View style={styles.priceContainer}>
              <Wallet size={20} color={Colors[colorScheme].primary} />
              <BodyMedium style={styles.price}>
                ${requestDetails.goods.price.toFixed(2)}
              </BodyMedium>
            </View>
            <BodyMedium style={styles.category}>
              {requestDetails.goods.category.name}
            </BodyMedium>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MapPin size={20} color={Colors[colorScheme].primary} />
              <View style={styles.infoContent}>
                <BodyMedium style={styles.infoLabel}>Route</BodyMedium>
                <BodyMedium style={styles.infoValue}>
                  {requestDetails.goodsLocation} →{" "}
                  {requestDetails.goodsDestination}
                </BodyMedium>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Package size={20} color={Colors[colorScheme].primary} />
              <View style={styles.infoContent}>
                <BodyMedium style={styles.infoLabel}>Quantity</BodyMedium>
                <BodyMedium style={styles.infoValue}>
                  {requestDetails.quantity}
                </BodyMedium>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Box size={20} color={Colors[colorScheme].primary} />
              <View style={styles.infoContent}>
                <BodyMedium style={styles.infoLabel}>Original Box</BodyMedium>
                <BodyMedium style={styles.infoValue}>
                  {requestDetails.withBox ? "Required" : "Not Required"}
                </BodyMedium>
              </View>
            </View>
          </View>

          {requestDetails.goods.description && (
            <View style={styles.descriptionCard}>
              <View style={styles.sectionHeader}>
                <Info size={20} color={Colors[colorScheme].primary} />
                <BodyMedium style={styles.sectionTitle}>Description</BodyMedium>
              </View>
              <BodyMedium style={styles.description}>
                {requestDetails.goods.description}
              </BodyMedium>
            </View>
          )}

          <View style={styles.requesterSection}>
            <TitleLarge style={styles.sectionTitle}>Request by</TitleLarge>

            <View style={styles.requesterCard}>
              <View style={styles.requesterHeader}>
                <UserAvatar user={requestDetails.user} />
                <View style={styles.requesterInfo}>
                  <BodyMedium style={styles.requesterName}>
                    {getInitials(requestDetails.user.name)}
                  </BodyMedium>
                  <ReputationDisplay
                    reputation={{
                      score: Number(params.requesterRating),
                      level: Number(params.requesterLevel),
                      totalRatings: Number(params.requesterTotalRatings),
                    }}
                    isVerified={params.requesterVerified === "true"}
                  />
                </View>
              </View>

              <BlurView
                intensity={85}
                tint="light"
                style={styles.blurredSection}
              >
                <View style={styles.securityNote}>
                  <BodyMedium style={styles.securityText}>
                    🔒 Contact information will be available after offer
                    acceptance
                  </BodyMedium>
                </View>
              </BlurView>
            </View>
          </View>

          {showOfferForm ? (
            <View style={styles.offerFormContainer}>
              <TitleLarge style={styles.formTitle}>Make an Offer</TitleLarge>

              <View style={styles.formField}>
                <BodyMedium style={styles.label}>Departure Airport</BodyMedium>
                <TextInput
                  style={styles.input}
                  placeholder="Enter departure airport"
                  value={offerDetails.departureAirport}
                  onChangeText={(text) => {
                    setOfferDetails((prev) => ({
                      ...prev,
                      departureAirport: text,
                    }));
                    fetchAirportSuggestions(
                      text,
                      setDepartureAirportSuggestions
                    );
                  }}
                />
                {departureAirportSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {departureAirportSuggestions.map((airport, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setOfferDetails((prev) => ({
                            ...prev,
                            departureAirport: airport,
                          }));
                          setDepartureAirportSuggestions([]);
                        }}
                      >
                        <Text style={styles.suggestionText}>{airport}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.formField}>
                <BodyMedium style={styles.label}>Arrival Airport</BodyMedium>
                <TextInput
                  style={styles.input}
                  placeholder="Enter arrival airport"
                  value={offerDetails.arrivalAirport}
                  onChangeText={(text) => {
                    setOfferDetails((prev) => ({
                      ...prev,
                      arrivalAirport: text,
                    }));
                    fetchAirportSuggestions(text, setArrivalAirportSuggestions);
                  }}
                />
                {arrivalAirportSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {arrivalAirportSuggestions.map((airport, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setOfferDetails((prev) => ({
                            ...prev,
                            arrivalAirport: airport,
                          }));
                          setArrivalAirportSuggestions([]);
                        }}
                      >
                        <Text style={styles.suggestionText}>{airport}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.formField}>
                <BodyMedium style={styles.label}>Flight Details</BodyMedium>
                <View style={styles.flightCodeContainer}>
                  <View style={[styles.pickerContainer, { flex: 1 }]}>
                    <Picker
                      selectedValue={offerDetails.airline}
                      style={styles.picker}
                      onValueChange={(value) => {
                        setOfferDetails((prev) => ({
                          ...prev,
                          airline: value,
                          departureFlightCode: `${AIRLINE_CODES[value]}${offerDetails.flightNumber}`,
                        }));
                      }}
                    >
                      {Object.keys(AIRLINE_CODES).map((airline) => (
                        <Picker.Item
                          key={airline}
                          label={airline}
                          value={airline}
                        />
                      ))}
                    </Picker>
                  </View>

                  <View style={[styles.pickerContainer, { flex: 1 }]}>
                    <Picker
                      selectedValue={offerDetails.flightNumber}
                      style={styles.picker}
                      onValueChange={(value) => {
                        setOfferDetails((prev) => ({
                          ...prev,
                          flightNumber: value,
                          departureFlightCode: `${
                            AIRLINE_CODES[prev.airline]
                          }${value}`,
                        }));
                      }}
                    >
                      {FLIGHT_NUMBERS.map((num) => (
                        <Picker.Item key={num} label={num} value={num} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>

              <View style={styles.formField}>
                <BodyMedium style={styles.label}>
                  Estimated Delivery Date
                </BodyMedium>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <BodyMedium>
                    {offerDetails.deliveryDate.toLocaleDateString()}
                  </BodyMedium>
                </TouchableOpacity>

                <DateTimePickerModal
                  isVisible={showDatePicker}
                  mode="date"
                  onConfirm={(date) => {
                    setShowDatePicker(false);
                    setOfferDetails((prev) => ({
                      ...prev,
                      deliveryDate: date,
                    }));
                  }}
                  onCancel={() => setShowDatePicker(false)}
                  minimumDate={new Date()}
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowOfferForm(false)}
                >
                  <BodyMedium style={styles.cancelButtonText}>
                    Cancel
                  </BodyMedium>
                </TouchableOpacity>

                <BaseButton
                  size="large"
                  onPress={handleSubmitOffer}
                  style={styles.submitButton}
                  disabled={
                    !isValidFlightCode(offerDetails.departureFlightCode)
                  }
                >
                  <BodyMedium style={styles.submitButtonText}>
                    Submit Offer
                  </BodyMedium>
                </BaseButton>
              </View>
            </View>
          ) : !params.idOrder ? (
            <BaseButton
              size="large"
              onPress={handleMakeOffer}
              style={styles.makeOfferButton}
            >
              <BodyMedium style={styles.makeOfferButtonText}>
                Make an Offer
              </BodyMedium>
            </BaseButton>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    color: Colors.light.primary,
    marginBottom: 19,
    marginTop: 12,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  imageContainer: {
    width: "100%",
    height: 300,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
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
  priceCategory: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    marginLeft: 4,
  },
  category: {
    fontSize: 16,
    color: Colors.light.text,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
  },
  descriptionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
  },
  requesterSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  requesterCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  requesterHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "white",
  },
  blurredSection: {
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 16,
  },
  securityNote: {
    padding: 12,
    alignItems: "center",
  },
  securityText: {
    fontSize: 13,
    color: "#64748b",
  },
  contactButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
  },
  contactButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  offerFormContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: Colors.light.text,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "white",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  flightCodeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e2e8f0",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    flex: 1,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  makeOfferButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    marginTop: 24,
    width: "100%",
  },
  makeOfferButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  requesterInfo: {
    marginLeft: 12,
  },
  requesterName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  requestCount: {
    fontSize: 14,
    color: Colors.light.text,
    marginTop: 2,
  },
  reputationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 12,
  },
  reputationItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingScore: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f59e0b",
  },
  ratingCount: {
    fontSize: 12,
    color: Colors.light.text,
    marginLeft: 4,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#7c3aed",
  },
  verifiedBadgeInline: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#22c55e",
  },
  statusCard: {
    marginTop: 16,
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#c2410c",
    marginLeft: 8,
  },
  statusText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#431407",
    lineHeight: 20,
    marginBottom: 16,
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
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#64748b",
    marginLeft: 8,
  },
  // For the suggestions of the airports
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    maxHeight: 150,
    overflow: "hidden",
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  suggestionText: {
    fontSize: 14,
    color: "#1e293b",
  },
});
