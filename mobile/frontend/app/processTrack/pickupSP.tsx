import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
} from "react-native";
import axiosInstance, { SOCKET_URL } from "../../config";
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
import { StatusScreen } from "@/app/screens/StatusScreen";

export default function PickupTraveler() {
  const params = useLocalSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;

  const [pickupId, setPickupId] = useState<number>(0);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [showPickup, setShowPickup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedPickupId, setSelectedPickupId] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [statusVisible, setStatusVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    type: "error" as "success" | "error",
    title: "",
    message: "",
  });

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
        pickups.forEach((pickup) => {
          socketRef.current?.emit("joinPickupRoom", pickup.id);
        });
      });

      socketRef.current.on("pickupAccepted", (updatedPickup: Pickup) => {
        setPickups((prev) =>
          prev.map((p) => (p.id === updatedPickup.id ? updatedPickup : p))
        );
      });

      socketRef.current.on("suggestionUpdate", (data: Pickup) => {
        setPickups((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      });

      socketRef.current.on("statusUpdate", (updatedPickup: Pickup) => {
        setPickups((prev) =>
          prev.map((p) => (p.id === updatedPickup.id ? updatedPickup : p))
        );
      });
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [pickups]);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
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
      ])
    ).start();
  }, []);

  useEffect(() => {
    fetchPickups();
  }, []);

  const openChat = async () => {
    if (!user?.id) {
      setStatusMessage({
        type: "error",
        title: "Error",
        message: "You need to be logged in to chat",
      });
      setStatusVisible(true);
      return;
    }

    try {
      if (
        !params.requesterId ||
        !params.travelerId ||
        !params.idGood ||
        !params.idOrder
      ) {
        setStatusMessage({
          type: "error",
          title: "Error",
          message: "Missing required parameters for chat",
        });
        setStatusVisible(true);
        return;
      }

      const requesterId = parseInt(params.requesterId.toString());
      const providerId = parseInt(params.travelerId.toString());
      const goodsId = parseInt(params.idGood.toString());

      await navigateToChat(requesterId, providerId, goodsId, {
        orderId: parseInt(params.idOrder.toString()),
        goodsName: params.goodsName?.toString() || "Item",
      });
    } catch (error) {
      console.error("Error opening chat:", error);
      setStatusMessage({
        type: "error",
        title: "Chat Error",
        message: "Failed to open chat.",
      });
      setStatusVisible(true);
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
        headers: { Authorization: `Bearer ${token}` },
      });
      setPickups(response.data.data);
    } catch (error) {
      console.error("Error fetching pickups (Traveler):", error);
      setStatusMessage({
        type: "error",
        title: "Error",
        message: "Failed to fetch pickups. Please try again.",
      });
      setStatusVisible(true);
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

      setStatusMessage({
        type: "success",
        title: "Success",
        message: `Pickup status updated to ${newStatus} successfully!`,
      });
      setStatusVisible(true);
      setStatusModalVisible(false);
    } catch (error) {
      console.error("Error updating pickup status:", error);
      setStatusMessage({
        type: "error",
        title: "Error",
        message: "Failed to update pickup status. Please try again.",
      });
      setStatusVisible(true);
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuggestions(response.data.data);
        setShowSuggestions(true);
      } else {
        setStatusMessage({
          type: "error",
          title: "Info",
          message: "No suggestions found for this pickup.",
        });
        setStatusVisible(true);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setStatusMessage({
        type: "error",
        title: "Error",
        message: "Failed to fetch suggestions. Please try again.",
      });
      setStatusVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Pickup }) => (
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
              {item.goodsName || "Your Order"}
            </Text>
            <Text style={styles.requesterName}>
              with {item.requesterName || "Requester"}
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
          <View style={styles.detailRow}>
            <MapPin size={18} color="#3b82f6" style={styles.iconWrapper} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Pickup Location</Text>
              <Text style={styles.detailValue}>
                {item.location}, {item.address}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Clock size={18} color="#3b82f6" style={styles.iconWrapper} />
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
          <View style={styles.detailRow}>
            <Calendar size={18} color="#3b82f6" style={styles.iconWrapper} />
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
          <View style={styles.detailRow}>
            <AlertCircle size={18} color="#3b82f6" style={styles.iconWrapper} />
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
                        style={[styles.buttonText, styles.secondaryButtonText]}
                      >
                        Suggest
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={[styles.button, styles.dangerButton]}
                    onPress={() => handleCancel(item.id)}
                  >
                    <XCircle size={18} color="#fff" style={styles.buttonIcon} />
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
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>
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

  const renderSuggestions = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {suggestions.length > 0 && (
        <View style={styles.suggestionContainer}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.suggestionItem}
              onPress={() => handleSuggest(item.id)}
            >
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
            </TouchableOpacity>
          ))}
        </View>
      )}
      <BaseButton
        variant="primary"
        size="small"
        style={styles.backButton}
        onPress={() => setShowSuggestions(false)}
      >
        <Text style={styles.buttonText}>Back</Text>
      </BaseButton>
    </ScrollView>
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
      {showSuggestions ? (
        renderSuggestions()
      ) : showPickup ? (
        <Pickups
          pickupId={pickupId}
          pickups={pickups}
          setPickups={setPickups}
          showPickup={showPickup}
          setShowPickup={setShowPickup}
          paramsData={{
            requesterId: params.requesterId?.toString() || "",
            travelerId: params.travelerId?.toString() || "",
            idOrder: params.idOrder?.toString() || "",
            requesterName: params.requesterName?.toString() || "Requester",
            travelerName: params.travelerName?.toString() || "Traveler",
            goodsName: params.goodsName?.toString() || "Item",
            status: params.status?.toString() || "PENDING",
            reviewLabel: params.reviewLabel?.toString() || "",
            isTraveler: params.isTraveler?.toString() || "true",
          }}
        />
      ) : (
        <FlatList
          data={pickups}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshing={isLoading}
          onRefresh={fetchPickups}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>Your Pickup Requests</Text>
              <Text style={styles.subtitle}>
                Manage your delivery assignments and pickup status
              </Text>
            </View>
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>
                  Loading your assignments...
                </Text>
              </View>
            ) : (
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
            )
          }
        />
      )}

      <QRCodeModal
        visible={showQRCode}
        qrCodeData={qrCodeData}
        onClose={() => setShowQRCode(false)}
        paramsData={params}
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
        paramsData={{
          requesterId: params.requesterId?.toString() || "",
          travelerId: params.travelerId?.toString() || "",
          idOrder: params.idOrder?.toString() || "",
          requesterName: params.requesterName?.toString() || "Requester",
          travelerName: params.travelerName?.toString() || "Traveler",
          goodsName: params.goodsName?.toString() || "Item",
          status: params.status?.toString() || "PENDING",
          reviewLabel: "Rate the delivery",
          isTraveler: "true",
        }}
      />

      <Animated.View
        style={[styles.messageBubble, { transform: [{ scale: pulseAnim }] }]}
      >
        <TouchableOpacity onPress={openChat}>
          <MessageCircle size={24} color="#ffffff" />
        </TouchableOpacity>
      </Animated.View>

      <StatusScreen
        visible={statusVisible}
        type={statusMessage.type}
        title={statusMessage.title}
        message={statusMessage.message}
        primaryAction={{ label: "OK", onPress: () => setStatusVisible(false) }}
        onClose={() => setStatusVisible(false)}
      />
    </View>
  );
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "PENDING":
      return "#f59e0b";
    case "IN_PROGRESS":
      return "#3b82f6";
    case "CANCELLED":
      return "#ef4444";
    case "COMPLETED":
      return "#10b981";
    default:
      return "#6b7280";
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 24, paddingBottom: 16 },
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
  listContainer: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
  },
  cardGradient: { padding: 20 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  orderTitleContainer: { flex: 1 },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#1e293b",
    marginBottom: 4,
  },
  requesterName: { fontFamily: "Inter-Medium", fontSize: 14, color: "#64748b" },
  suggestionsLink: { flexDirection: "row", alignItems: "center", padding: 8 },
  suggestionsText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#007AFF",
    marginRight: 4,
  },
  detailsContainer: { marginBottom: 16 },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconWrapper: { marginRight: 12 },
  detailContent: { flex: 1 },
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
  successMessage: { backgroundColor: "#ecfdf5" },
  errorMessage: { backgroundColor: "#fee2e2" },
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
  actionContainer: { marginTop: 16, width: "100%" },
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
  fullWidthButton: { width: "100%" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  buttonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 15,
    color: "#fff",
    marginLeft: 8,
  },
  secondaryButtonText: { color: "#3b82f6" },
  buttonIcon: { marginRight: 6 },
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
  refreshButton: { paddingHorizontal: 24, paddingVertical: 12 },
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
    elevation: 5,
  },
  modalTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    color: "#1e293b",
    marginBottom: 20,
    textAlign: "center",
  },
  statusList: { maxHeight: 300, marginBottom: 16 },
  statusOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  selectedStatusOption: { backgroundColor: "#eff6ff", borderRadius: 8 },
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
  },
  scrollContent: { padding: 16 },
  suggestionContainer: { padding: 16 },
  suggestionItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
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
    marginVertical: 16,
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: 80,
  },
});
