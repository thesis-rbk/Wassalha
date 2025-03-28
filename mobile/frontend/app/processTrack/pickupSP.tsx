// PickupTraveler.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import axiosInstance from "../../config";
import Pickups from "../pickup/pickup";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pickup } from "../../types/Pickup";
import {
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
} from "lucide-react-native";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { usePickupActions } from "../../hooks/usePickupActions";
import { QRCodeModal } from "../pickup/QRCodeModal";
import { QRCodeScanner } from "../pickup/QRCodeScanner"; // Import the new component
import io, { Socket } from "socket.io-client";
import { navigateToChat } from "@/services/chatService";

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL;

export default function PickupTraveler() {
  const params = useLocalSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;

  console.log("params from pickup sp", params);

  const [pickupId, setPickupId] = useState<number>(0);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [showPickup, setShowPickup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedPickupId, setSelectedPickupId] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showScanner, setShowScanner] = useState(false); // Only controls visibility now

  const { handleAccept, showStoredQRCode, showQRCode, setShowQRCode, qrCodeData, handleCancel } = usePickupActions(
    pickups,
    setPickups,
    userId
  );

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${SOCKET_URL}/pickup`, {
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Connected to Socket.IO server (PickupTraveler)");
        pickups.forEach((pickup) => {
          const room = `pickup:${pickup.id}`;
          socketRef.current?.emit("joinPickupRoom", pickup.id);
          console.log(`Joined room: ${room}`);
        });
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("❌ Socket.IO connection error:", error.message);
      });

      socketRef.current.on("pickupAccepted", (updatedPickup: Pickup) => {
        console.log("✅ Received pickupAccepted (PickupTraveler):", updatedPickup);
        setPickups((prev) =>
          prev.map((p) => (p.id === updatedPickup.id ? updatedPickup : p))
        );
      });

      socketRef.current.on("suggestionUpdate", (data: Pickup) => {
        console.log("📩 Received suggestionUpdate (PickupTraveler):", data);
        setPickups((prev) => {
          const updatedPickups = prev.map((p) => (p.id === data.id ? data : p));
          console.log("Updated pickups in PickupTraveler:", updatedPickups);
          return updatedPickups;
        });
      });

      socketRef.current.on("statusUpdate", (updatedPickup: Pickup) => {
        console.log("🔄 Received statusUpdate (PickupTraveler):", updatedPickup);
        setPickups((prev) =>
          prev.map((p) => (p.id === updatedPickup.id ? updatedPickup : p))
        );
      });

      socketRef.current.on("disconnect", () => {
        console.log("❌ Disconnected from Socket.IO server (PickupTraveler)");
      });
    }

    if (socketRef.current?.connected) {
      pickups.forEach((pickup) => {
        const room = `pickup:${pickup.id}`;
        socketRef.current?.emit("joinPickupRoom", pickup.id);
        console.log(`Joined room: ${room}`);
      });
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [pickups]);

  useEffect(() => {
    fetchPickups();
  }, []);

  const openChat = async () => {
    if (!user?.id) {
      Alert.alert("Error", "You need to be logged in to chat");
      return;
    }

    try {
      const requesterId = parseInt(params.requesterId.toString());
      const providerId = parseInt(params.travelerId.toString());
      const goodsId = parseInt(params.idGood.toString());

      console.log("Opening chat with:", {
        requesterId: parseInt(params.travelerId.toString()),
        providerId: user?.id,
        goodsId: parseInt(params.idGood.toString()),
      });

      await navigateToChat(requesterId, providerId, goodsId, {
        orderId: parseInt(params.idOrder.toString()),
        goodsName: params.goodsName?.toString() || "Item",
      });
    } catch (error) {
      console.error("Error opening chat:", error);
      Alert.alert(
        "Chat Error",
        "Failed to open chat. Error: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  const fetchPickups = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axiosInstance.get<{
        success: boolean;
        data: Pickup[];
      }>(`/api/pickup/traveler`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPickups(response.data.data);
      console.log("Pickups (Traveler):", response.data.data);
    } catch (error) {
      console.error("Error fetching pickups (Traveler):", error);
      Alert.alert("Error", "Failed to fetch pickups. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggest = async (pickupId: number): Promise<void> => {
    setPickupId(pickupId);
    setShowPickup(true);
  };

  const handleUpdateStatus = async (
    pickupId: number,
    newStatus: Pickup["status"]
  ): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const validStatuses: Pickup["status"][] = [
        "SCHEDULED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "DELAYED",
        "DELIVERED",
      ];

      if (!validStatuses.includes(newStatus)) {
        throw new Error("Invalid status selected");
      }

      await axiosInstance.put(
        "/api/pickup/status",
        { pickupId, newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert(
        "Success",
        `Pickup status updated to ${newStatus} successfully!`
      );
      setStatusModalVisible(false);
    } catch (error) {
      console.error("Error updating pickup status:", error);
      Alert.alert("Error", "Failed to update pickup status. Please try again.");
    }
  };

  const openStatusModal = (pickupId: number) => {
    setSelectedPickupId(pickupId);
    setStatusModalVisible(true);
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

  const isRequester = (pickup: Pickup) => console.log("pickup", pickup);

  const renderItem = ({ item }: { item: Pickup }) => {
    const userIsRequester = isRequester(item);

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
            <Text style={styles.waitingText}>
              Waiting for your confirmation as traveler
            </Text>
          </View>
        )}

        {!item.userconfirmed && item.travelerconfirmed && (
          <View style={styles.note}>
            <Text style={styles.waitingText}>
              Waiting for requester to confirm
            </Text>
          </View>
        )}

        {item.userconfirmed && item.travelerconfirmed && (
          <View style={styles.note}>
            <Text style={styles.successText}>
              Pickup Accepted! Package on the way.
            </Text>
            <View style={styles.buttonContainer}>
              <View style={styles.topRow}>
                <BaseButton
                  variant="primary"
                  size="small"
                  style={styles.actionButton}
                  onPress={() => openStatusModal(item.id)}
                >
                  <CheckCircle size={14} color="#fff" />
                  <Text style={styles.buttonText}>Update</Text>
                </BaseButton>
                <BaseButton
                  variant="primary"
                  size="small"
                  style={styles.actionButton}
                  onPress={() => showStoredQRCode(item)}
                >
                  <CheckCircle size={14} color="#fff" />
                  <Text style={styles.buttonText}>Show QR</Text>
                </BaseButton>
              </View>
              <BaseButton
                variant="primary"
                size="small"
                style={styles.actionButton}
                onPress={() => setShowScanner(true)} // Simply open the scanner
              >
                <MapPin size={14} color="#fff" />
                <Text style={styles.buttonText}>Scan QR</Text>
              </BaseButton>
            </View>
          </View>
        )}

        {!item.userconfirmed && !item.travelerconfirmed && (
          <View style={styles.note}>
            <Text style={styles.waitingText}>
              Waiting for requester to suggest a pickup
            </Text>
          </View>
        )}

        {item.userconfirmed && !item.travelerconfirmed && (
          <View style={styles.note}>
            {item.status === "CANCELLED" ? (
              <>
                <Text style={styles.cancelledText}>Pickup Cancelled</Text>
                <Text style={styles.warningText}>
                  This pickup was cancelled. Please suggest a new pickup method
                  to proceed.
                </Text>
                <View style={styles.buttonContainer}>
                  <BaseButton
                    variant="primary"
                    size="small"
                    style={styles.actionButton}
                    onPress={() => handleSuggest(item.id)}
                  >
                    <MapPin size={14} color="#fff" />
                    <Text style={styles.buttonText}>Suggest</Text>
                  </BaseButton>
                </View>
              </>
            ) : (
              <View style={styles.buttonContainer}>
                <View style={styles.topRow}>
                  <BaseButton
                    variant="primary"
                    size="small"
                    style={styles.actionButton}
                    onPress={() => handleAccept(item.id)}
                  >
                    <CheckCircle size={14} color="#fff" />
                    <Text style={styles.buttonText}>Accept</Text>
                  </BaseButton>
                  <BaseButton
                    variant="primary"
                    size="small"
                    style={styles.actionButton}
                    onPress={() => handleSuggest(item.id)}
                  >
                    <MapPin size={14} color="#fff" />
                    <Text style={styles.buttonText}>Suggest</Text>
                  </BaseButton>
                </View>
                <BaseButton
                  variant="primary"
                  size="small"
                  style={styles.actionButton}
                  onPress={() => handleCancel(item.id)}
                >
                  <XCircle size={14} color="#fff" />
                  <Text style={styles.buttonText}>Cancel</Text>
                </BaseButton>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderSuggestions = () => (
    <View style={styles.suggestionsContainer}>
      <Text style={styles.suggestionsTitle}>Previous Suggestions</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#64748b" />
      ) : suggestions.length === 0 ? (
        <Text style={styles.noSuggestionsText}>
          No previous suggestions found.
        </Text>
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
                Scheduled:{" "}
                {item.scheduledTime
                  ? new Date(item.scheduledTime).toLocaleString()
                  : "N/A"}
              </Text>
              <Text style={styles.suggestionDetail}>
                Created: {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.suggestionsList}
        />
      )}
      <BaseButton
        variant="primary"
        size="small"
        style={styles.backButton}
        onPress={() => setShowSuggestions(false)}
      >
        <Text style={styles.buttonText}>Back</Text>
      </BaseButton>
    </View>
  );

  const statusOptions: Pickup["status"][] = [
    "SCHEDULED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "DELAYED",
    "DELIVERED",
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {showSuggestions ? (
        renderSuggestions()
      ) : showPickup ? (
        <Pickups pickupId={pickupId} pickups={pickups} setPickups={setPickups} />
      ) : (
        <>
          <View style={styles.content}>
            <Text style={styles.title}>Pickup Options</Text>
            <Text style={styles.subtitle}>
              Choose how you'd like to receive your item.
            </Text>
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
              keyExtractor={(item: any) => item.id.toString()}
              refreshing={isLoading}
              onRefresh={fetchPickups}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <Text style={styles.noImageText}>
                  No pickup requests found.
                </Text>
              }
            />
          )}
        </>
      )}

      <QRCodeModal
        visible={showQRCode}
        qrCodeData={qrCodeData || ""}
        onClose={() => setShowQRCode(false)}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={statusModalVisible}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select New Status</Text>
            <ScrollView style={styles.statusList}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    pickups.find((p) => p.id === selectedPickupId)?.status ===
                      status && styles.selectedStatusOption,
                  ]}
                  onPress={() =>
                    selectedPickupId &&
                    handleUpdateStatus(selectedPickupId, status)
                  }
                >
                  <Text style={styles.statusText}>{status}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <BaseButton
              variant="primary"
              size="small"
              style={styles.cancelModalButton}
              onPress={() => setStatusModalVisible(false)}
            >
              <XCircle size={14} color="#fff" />
              <Text style={styles.buttonText}>Cancel</Text>
            </BaseButton>
          </View>
        </View>
      </Modal>

      <QRCodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        pickups={pickups}
        setPickups={setPickups}
      />

      <TouchableOpacity style={styles.messageBubble} onPress={openChat}>
        <MessageCircle size={24} color="#ffffff" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "PENDING":
      return "#f59e0b"; // orange
    case "IN_PROGRESS":
      return "#3b82f6"; // blue
    case "CANCELLED":
      return "#ef4444"; // red
    case "COMPLETED":
      return "#10b981"; // green
    default:
      return "#6b7280"; // gray
  }
};

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
    alignItems: "flex-start",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#1e293b",
    flexShrink: 1,
  },
  suggestionsLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: "flex-end",
  },
  suggestionsText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    color: "#007AFF",
    textDecorationLine: "underline",
    lineHeight: 14,
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
    marginBottom: 8,
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
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    minWidth: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  buttonText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#fff",
  },
  noImageText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    textAlign: "center",
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "60%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#1e293b",
    marginBottom: 15,
    textAlign: "center",
  },
  statusList: {
    maxHeight: 200,
  },
  statusOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  selectedStatusOption: {
    backgroundColor: "#eff6ff",
  },
  statusText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#1e293b",
  },
  cancelModalButton: {
    backgroundColor: "#FF4444",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    minWidth: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 10,
  },
  suggestionsContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafc",
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
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    minWidth: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  noSuggestionsText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 20,
  },
  messageBubble: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});