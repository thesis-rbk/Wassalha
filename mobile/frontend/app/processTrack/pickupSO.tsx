import { useRouter } from "expo-router";
import ProgressBar from "../../components/ProgressBar";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity, Alert } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import axiosInstance from "../../config";
import Pickups from "../pickup/pickup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Pickup } from "../../types/Pickup";
import { MapPin, CheckCircle, XCircle, AlertCircle, MessageCircle } from "lucide-react-native";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { usePickupActions } from "../../hooks/usePickupActions";
import { QRCodeModal } from "../pickup/QRCodeModal";
import io from "socket.io-client";
const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL;

export default function PickupOwner() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;

  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization" },
    { id: 2, title: "Verification", icon: "verification" },
    { id: 3, title: "Payment", icon: "payment" },
    { id: 4, title: "Pickup", icon: "pickup" },
  ];

  const [pickupId, setPickupId] = useState<number>(0);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [showPickup, setShowPickup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { handleAccept, showStoredQRCode, showQRCode, setShowQRCode, qrCodeData } = usePickupActions(
    pickups,
    setPickups,
    userId
  );
  useEffect(() => {
    const socket = io(`${SOCKET_URL}/pickup`, { // Fixed namespace
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server (PickupOwner)");
      pickups.forEach((pickup) => {
        const room = `pickup:${pickup.id}`;
        socket.emit("joinPickupRoom", pickup.id); // Backend expects pickupId
        console.log(`Joined room: ${room}`);
      });
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket.IO connection error:", error.message);
    });

    socket.on("pickupAccepted", (updatedPickup: Pickup) => {
      console.log("✅ Received pickupAccepted (PickupTraveler):", updatedPickup);
      setPickups((prev) =>
        prev.map((p) => (p.id === updatedPickup.id ? updatedPickup : p))
      );
    });
    socket.on("suggestionUpdate", (data: Pickup) => {
      console.log("📩 Received suggestionUpdate (Pickup):", data);
      setPickups((prev) =>
        prev.map((p) => (p.id === data.id ? data : p))
      );
      Alert.alert("Update", `Pickup #${data.id} has been updated.`);
    });
    socket.on("statusUpdate", (updatedPickup: Pickup) => {
      console.log("🔄 Received statusUpdate (PickupTraveler):", updatedPickup);
      setPickups((prev) =>
        prev.map((p) => (p.id === updatedPickup.id ? updatedPickup : p))
      );
      Alert.alert("Status Updated", `Pickup #${updatedPickup.id} status: ${updatedPickup.status}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from Socket.IO server (PickupTraveler)");
    });

    return () => {
      socket.disconnect();
    };
  }, [pickups]);

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axiosInstance.get<{ success: boolean; data: Pickup[] }>(
        `/api/pickup/requester`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPickups(response.data.data);
      console.log("Pickups fetched:", response.data.data);
    } catch (error) {
      console.error("Error fetching pickups:", error);
      Alert.alert("Error", "Failed to fetch pickups. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (pickupId: number): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      await axiosInstance.put(
        "/api/pickup/status",
        { pickupId, newStatus: "CANCELLED" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Pickup cancelled!");
      setPickups((prev) =>
        prev.map((pickup) =>
          pickup.id === pickupId ? { ...pickup, status: "CANCELLED" } : pickup
        )
      );
    } catch (error) {
      console.error("Error cancelling pickup:", error);
      Alert.alert("Error", "Failed to cancel pickup. Please try again.");
    }
  };

  const handleSuggest = async (pickupId: number): Promise<void> => {
    setPickupId(pickupId);
    setShowPickup(true);
  };

  const fetchSuggestions = async (pickupId: number) => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axiosInstance.get(
        `/api/pickup/history/${pickupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuggestions(response.data.data);
        setShowSuggestions(true);
      } else {
        Alert.alert("Info", "No suggestions found for this pickup.");
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      Alert.alert("Error", "Failed to fetch suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isTraveler = (pickup: Pickup) => {
    console.log("pickup", pickup);
    return false; // Placeholder logic; replace with actual check if needed
  };

  const renderItem = ({ item }: { item: Pickup }) => {
    const userIsTraveler = isTraveler(item);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>
            Order #{item.orderId} - {item.pickupType}
          </Text>
          <TouchableOpacity
            style={styles.suggestionsLink}
            onPress={() => fetchSuggestions(item.id)}
          >
            <Text style={styles.suggestionsText}>See Previous</Text>
            <Text style={styles.suggestionsText}>Suggestions</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orderRow}>
          <View style={styles.iconContainer}>
            <MapPin size={20} color="#64748b" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.orderLabel}>Location</Text>
            <Text style={styles.orderValue}>
              {item.location}, {item.address}
            </Text>
          </View>
        </View>

        <View style={styles.orderRow}>
          <View style={styles.iconContainer}>
            <CheckCircle size={20} color="#64748b" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.orderLabel}>Scheduled</Text>
            <Text style={styles.orderValue}>
              {new Date(item.scheduledTime).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.orderRow}>
          <View style={styles.iconContainer}>
            <AlertCircle size={20} color="#64748b" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.orderLabel}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
        </View>

        {item.userconfirmed && !item.travelerconfirmed && (
          <View style={styles.note}>
            <Text style={styles.waitingText}>Waiting for traveler to confirm</Text>
          </View>
        )}

        {item.userconfirmed && item.travelerconfirmed && (
          <View style={styles.note}>
            <Text style={styles.successText}>
              Pickup Accepted! Package on the way.
            </Text>
            <BaseButton
              variant="primary"
              size="small"
              style={styles.actionButton}
              onPress={() => showStoredQRCode(item)}
            >
              Show QR Code
            </BaseButton>
          </View>
        )}

        {!item.userconfirmed && item.travelerconfirmed && (
          <View style={styles.note}>
            {item.status === "CANCELLED" ? (
              <>
                <Text style={styles.cancelledText}>Pickup Cancelled</Text>
                <Text style={styles.warningText}>
                  This pickup was cancelled. Please suggest a new pickup method to proceed.
                </Text>
              </>
            ) : (
              <Text style={styles.orderValue}>
                Traveler has confirmed. Your action is required.
              </Text>
            )}
          </View>
        )}

        <View style={styles.actionRow}>
          {!item.userconfirmed && item.travelerconfirmed && item.status !== "CANCELLED" && (
            <View style={styles.buttonContainer}>
              <View style={styles.topRow}>
                <BaseButton
                  variant="primary"
                  size="small"
                  style={styles.actionButton}
                  onPress={() => handleAccept(item.id)}
                >
                  Accept
                </BaseButton>
                <BaseButton
                  variant="primary"
                  size="small"
                  style={styles.actionButton}
                  onPress={() => handleSuggest(item.id)}
                >
                  Suggest Another
                </BaseButton>
              </View>
              <BaseButton
                variant="primary"
                size="small"
                style={styles.actionButton}
                onPress={() => handleCancel(item.id)}
              >
                Cancel
              </BaseButton>
            </View>
          )}
          {item.status === "CANCELLED" && (
            <View style={styles.buttonContainer}>
              <BaseButton
                variant="primary"
                size="small"
                style={styles.actionButton}
                onPress={() => handleSuggest(item.id)}
              >
                Suggest Another
              </BaseButton>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSuggestions = () => (
    <ThemedView style={styles.suggestionsContainer}>
      <Text style={styles.suggestionsTitle}>Previous Suggestions</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#64748b" />
      ) : suggestions.length === 0 ? (
        <Text style={styles.noSuggestionsText}>No previous suggestions found.</Text>
      ) : (
        <FlatList
          data={suggestions}
          renderItem={({ item }) => (
            <View style={styles.suggestionItem}>
              <Text style={styles.suggestionText}>
                {item.pickupType} by {item.user?.name || "Unknown"}
              </Text>
              <Text style={styles.suggestionDetail}>
                Location: {item.location || "N/A"}, {item.address || "N/A"}
              </Text>
              <Text style={styles.suggestionDetail}>
                Scheduled: {item.scheduledTime ? new Date(item.scheduledTime).toLocaleString() : "N/A"}
              </Text>
              <Text style={styles.suggestionDetail}>
                Created: {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()} // Ensure string key
          contentContainerStyle={styles.suggestionsList}
        />
      )}
      <BaseButton
        variant="primary"
        size="small"
        style={styles.backButton}
        onPress={() => setShowSuggestions(false)}
      >
        Back to Pickups
      </BaseButton>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      {showSuggestions ? (
        renderSuggestions()
      ) : showPickup ? (
        <Pickups pickupId={pickupId} pickups={pickups} setPickups={setPickups}/>
      ) : (
        <>
          <View style={styles.content}>
            <Text style={styles.title}>Pickup Options</Text>
            <Text style={styles.subtitle}>
              Choose how you'd like to receive your item.
            </Text>
            <ProgressBar currentStep={4} steps={progressSteps} />
          </View>

          {isLoading && pickups.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <FlatList
              data={pickups}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()} // Ensure string key
              refreshing={isLoading}
              onRefresh={fetchPickups}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <Text style={styles.noImageText}>No pickup requests found.</Text>
              }
            />
          )}
        </>
      )}
      <QRCodeModal visible={showQRCode} qrCodeData={qrCodeData} onClose={() => setShowQRCode(false)} />
    </ThemedView>
  );
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "PENDING": return "#f59e0b"; // orange
    case "IN_PROGRESS": return "#3b82f6"; // blue
    case "CANCELLED": return "#ef4444"; // red
    case "COMPLETED": return "#10b981"; // green
    default: return "#6b7280"; // gray
  }
};

// Styles remain unchanged
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: "#64748b",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#1e293b",
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatIconButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#e0f2fe", // Light blue background
  },
  suggestionsLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  suggestionsText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 24,
    alignItems: "center",
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
  note: {
    marginTop: 8,
    marginBottom: 16,
  },
  waitingText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  successText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#10b981",
    fontWeight: "600",
  },
  cancelledText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "600",
  },
  warningText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#ff9800",
    fontWeight: "600",
  },
  actionRow: {
    paddingBottom: 16,
    alignItems: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  topRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    justifyContent: "center",
  },
  actionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 100,
  },
  noImageText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    textAlign: "center",
    color: "#666",
  },
  suggestionsContainer: {
    flex: 1,
    padding: 16,
  },
  suggestionsTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    color: "#1e293b",
    marginBottom: 16,
  },
  suggestionsList: {
    paddingBottom: 20,
  },
  suggestionItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 4,
  },
  suggestionDetail: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
  },
  backButton: {
    marginTop: 16,
    alignSelf: "center",
  },
  noSuggestionsText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 20,
  },
});