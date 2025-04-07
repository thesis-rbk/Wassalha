import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  Animated,
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
  ChevronRight,
  Clock,
  Calendar,
} from "lucide-react-native";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { usePickupActions } from "../../hooks/usePickupActions";
import { QRCodeModal } from "../pickup/QRCodeModal";
import { QRCodeScanner } from "../pickup/QRCodeScanner";
import io, { Socket } from "socket.io-client";
import { navigateToChat } from "@/services/chatService";
import { LinearGradient } from "expo-linear-gradient";
import Header from "@/components/navigation/headers";

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
  const [showScanner, setShowScanner] = useState(false);

  const {
    handleAccept,
    showStoredQRCode,
    showQRCode,
    setShowQRCode,
    qrCodeData,
    handleCancel,
  } = usePickupActions(pickups, setPickups, userId);

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
        console.log(
          "✅ Received pickupAccepted (PickupTraveler):",
          updatedPickup
        );
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
        console.log(
          "🔄 Received statusUpdate (PickupTraveler):",
          updatedPickup
        );
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

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

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
    return (
      <View style={styles.card}>
        <LinearGradient
          colors={["#f8fafc", "#ffffff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.orderTitleContainer}>
              <Text style={styles.sectionTitle}>
                {params.goodsName || "Your Order"}
              </Text>
              <Text style={styles.requesterName}>
                with {params.requesterName || "Requester"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.suggestionsLink}
              onPress={() => fetchSuggestions(item.id)}
            >
              <Text style={styles.suggestionsText}>History</Text>
              <ChevronRight size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailsContainer}>
            {/* Location */}
            <View style={styles.detailRow}>
              <View style={styles.iconWrapper}>
                <MapPin size={18} color="#3b82f6" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Pickup Location</Text>
                <Text style={styles.detailValue}>
                  {item.location}, {item.address}
                </Text>
              </View>
            </View>

            {/* Scheduled Time */}
            <View style={styles.detailRow}>
              <View style={styles.iconWrapper}>
                <Clock size={18} color="#3b82f6" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Scheduled Time</Text>
                <Text style={styles.detailValue}>
                  {new Date(item.scheduledTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>

            {/* Scheduled Date */}
            <View style={styles.detailRow}>
              <View style={styles.iconWrapper}>
                <Calendar size={18} color="#3b82f6" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Scheduled Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(item.scheduledTime).toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>

            {/* Status */}
            <View style={styles.detailRow}>
              <View style={styles.iconWrapper}>
                <AlertCircle size={18} color="#3b82f6" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Status</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {item.status.replace("_", " ")}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Status Messages */}
          {item.userconfirmed && !item.travelerconfirmed && (
            <View style={styles.statusMessage}>
              <Text style={styles.waitingText}>
                Waiting for your confirmation as traveler
              </Text>
            </View>
          )}

          {!item.userconfirmed && item.travelerconfirmed && (
            <View style={styles.statusMessage}>
              <Text style={styles.waitingText}>
                Waiting for requester confirmation
              </Text>
            </View>
          )}

          {item.userconfirmed && item.travelerconfirmed && (
            <View style={[styles.statusMessage, styles.successMessage]}>
              <CheckCircle size={16} color="#10b981" />
              <Text style={styles.successText}>
                Pickup confirmed! Ready for delivery.
              </Text>
            </View>
          )}

          {!item.userconfirmed && !item.travelerconfirmed && (
            <View style={styles.statusMessage}>
              <Text style={styles.waitingText}>
                Waiting for requester to suggest pickup
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {!item.userconfirmed && !item.travelerconfirmed && (
              <Text style={styles.infoText}>
                You'll be able to take actions once the requester suggests a
                pickup
              </Text>
            )}

            {item.userconfirmed && !item.travelerconfirmed && (
              <>
                {item.status === "CANCELLED" ? (
                  <>
                    <View style={[styles.statusMessage, styles.errorMessage]}>
                      <XCircle size={16} color="#ef4444" />
                      <Text style={styles.cancelledText}>
                        This pickup was cancelled
                      </Text>
                    </View>
                    <BaseButton
                      variant="primary"
                      size="small"
                      style={[styles.actionButton, styles.fullWidthButton]}
                      onPress={() => handleSuggest(item.id)}
                    >
                      <MapPin size={16} color="#fff" />
                      <Text style={styles.buttonText}>Suggest New Pickup</Text>
                    </BaseButton>
                  </>
                ) : (
                  <>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={() => handleAccept(item.id)}
                      >
                        <CheckCircle
                          size={18}
                          color="#fff"
                          style={styles.buttonIcon}
                        />
                        <Text style={styles.buttonText}>Accept</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={() => handleSuggest(item.id)}
                      >
                        <MapPin
                          size={18}
                          color="#3b82f6"
                          style={styles.buttonIcon}
                        />
                        <Text
                          style={[
                            styles.buttonText,
                            styles.secondaryButtonText,
                          ]}
                        >
                          Suggest
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={[styles.button, styles.dangerButton]}
                      onPress={() => handleCancel(item.id)}
                    >
                      <XCircle
                        size={18}
                        color="#fff"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}

            {item.userconfirmed && item.travelerconfirmed && (
              <>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={() => openStatusModal(item.id)}
                  >
                    <CheckCircle
                      size={18}
                      color="#fff"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>Update Status</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => showStoredQRCode(item)}
                  >
                    <CheckCircle
                      size={18}
                      color="#3b82f6"
                      style={styles.buttonIcon}
                    />
                    <Text
                      style={[styles.buttonText, styles.secondaryButtonText]}
                    >
                      Show QR
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primaryButton,
                    styles.fullWidthButton,
                  ]}
                  onPress={() => setShowScanner(true)}
                >
                  <MapPin size={18} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Scan QR Code</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </LinearGradient>
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
    <View style={styles.container}>
      <Header
        title="Pickups"
        subtitle="Track your order's process"
        showBackButton={true}
      />
      {showSuggestions ? (
        renderSuggestions()
      ) : showPickup ? (
        <Pickups
          pickupId={pickupId}
          pickups={pickups}
          setPickups={setPickups}
          showPickup={showPickup}
          setShowPickup={setShowPickup}
        />
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Your Pickup Requests</Text>
            <Text style={styles.subtitle}>
              Manage your delivery assignments and pickup status
            </Text>
          </View>

          {isLoading && pickups.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>
                Loading your assignments...
              </Text>
            </View>
          ) : (
            <FlatList
              data={pickups}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              refreshing={isLoading}
              onRefresh={fetchPickups}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <MapPin size={48} color="#cbd5e1" />
                  <Text style={styles.emptyTitle}>No Assignments Found</Text>
                  <Text style={styles.emptyText}>
                    You don't have any active pickup assignments yet
                  </Text>
                  <BaseButton
                    variant="primary"
                    size="small"
                    style={styles.refreshButton}
                    onPress={fetchPickups}
                  >
                    <Text style={styles.buttonText}>Refresh</Text>
                  </BaseButton>
                </View>
              }
            />
          )}
        </>
      )}

      <QRCodeModal
        visible={showQRCode}
        qrCodeData={qrCodeData}
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
            <Text style={styles.modalTitle}>Update Delivery Status</Text>
            <FlatList
              data={statusOptions}
              keyExtractor={(item) => item}
              renderItem={({ item: status }) => (
                <TouchableOpacity
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
                  <Text style={styles.statusText}>
                    {status.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.statusList}
            />
            <BaseButton
              size="small"
              style={styles.cancelModalButton}
              onPress={() => setStatusModalVisible(false)}
            >
              <XCircle size={16} color="#fff" />
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

      <Animated.View
        style={[styles.messageBubble, { transform: [{ scale: pulseAnim }] }]}
      >
        <TouchableOpacity onPress={openChat}>
          <MessageCircle size={24} color="#ffffff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
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
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#64748b",
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: "#64748b",
    marginTop: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  orderTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#1e293b",
    marginBottom: 4,
  },
  requesterName: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#64748b",
  },
  pickupType: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#64748b",
  },
  suggestionsLink: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  suggestionsText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#007AFF",
    marginRight: 4,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    color: "#64748b",
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: "Inter-SemiBold",
    fontSize: 15,
    color: "#1e293b",
    lineHeight: 22,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  badgeText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "white",
    textTransform: "capitalize",
  },
  statusMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successMessage: {
    backgroundColor: "#ecfdf5",
  },
  errorMessage: {
    backgroundColor: "#fee2e2",
  },
  waitingText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#3b82f6",
    marginLeft: 8,
  },
  successText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#10b981",
    marginLeft: 8,
  },
  cancelledText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#ef4444",
    marginLeft: 8,
  },
  infoText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  actionContainer: {
    marginTop: 16,
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  acceptButton: {
    backgroundColor: "#10b981",
  },
  suggestButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  updateButton: {
    backgroundColor: "#3b82f6",
  },
  qrButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  cancelButton: {
    backgroundColor: "#ef4444",
  },

  fullWidthButton: {
    width: "100%",
  },
  buttonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 15,
    color: "#fff",
    marginLeft: 8,
  },
  outlineButtonText: {
    color: "#3b82f6",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 300,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "70%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    color: "#1e293b",
    marginBottom: 20,
    textAlign: "center",
  },
  statusList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  statusOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  selectedStatusOption: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
  },
  statusText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: "#1e293b",
    textTransform: "capitalize",
  },
  cancelModalButton: {
    backgroundColor: "#ef4444",
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  messageBubble: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    transform: [{ scale: 1 }],
  },
  content: {
    padding: 16,
    paddingBottom: 40,
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
  note: {
    marginTop: 8,
    marginBottom: 16,
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
  noImageText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    textAlign: "center",
    color: "#666",
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
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 100,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  dangerButton: {
    backgroundColor: "#ef4444",
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  secondaryButtonText: {
    color: "#3b82f6",
  },
  buttonIcon: {
    marginRight: 6,
  },
  modalButton: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 10,
  },
});
