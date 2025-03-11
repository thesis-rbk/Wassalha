import { useRouter } from "expo-router";
import ProgressBar from "../../components/ProgressBar";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import axiosInstance from "../../config";
import Pickups from "../pickup/pickup";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pickup } from "../../types/Pickup";
import { MapPin, CheckCircle, AlertCircle } from "lucide-react-native";
import { BaseButton } from "@/components/ui/buttons/BaseButton";

export default function PickupTraveler() {
  const router = useRouter();

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
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedPickupId, setSelectedPickupId] = useState<number | null>(null);

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get<{ success: boolean; data: Pickup[] }>(
        `/api/pickup/${userId}`
      );
      setPickups(response.data.data);
      console.log("Pickups:", response.data.data);
    } catch (error) {
      console.error("Error fetching pickups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (pickupId: number): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      await axiosInstance.put(
        "/api/pickup/accept",
        { pickupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Pickup accepted!");
      setPickups((prev) =>
        prev.map((pickup) =>
          pickup.id === pickupId
            ? { ...pickup, status: "IN_PROGRESS", travelerconfirmed: true }
            : pickup
        )
      );
      fetchPickups();
    } catch (error) {
      console.error("Error accepting pickup:", error);
      alert("Failed to accept pickup. Please try again.");
    }
  };

  const handleSuggest = async (pickupId: number): Promise<void> => {
    setPickupId(pickupId);
    setShowPickup(true);
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

      alert("Pickup cancelled!");
      setPickups((prev) =>
        prev.map((pickup) =>
          pickup.id === pickupId ? { ...pickup, status: "CANCELLED" } : pickup
        )
      );
      fetchPickups();
    } catch (error) {
      console.error("Error cancelling pickup:", error);
      alert("Failed to cancel pickup. Please try again.");
    }
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

      Alert.alert("Success", `Pickup status updated to ${newStatus} successfully!`);
      setPickups((prev) =>
        prev.map((pickup) =>
          pickup.id === pickupId ? { ...pickup, status: newStatus } : pickup
        )
      );
      fetchPickups();
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

  const isRequester = (pickup: Pickup) => userId !== pickup.order.travelerId;

  const renderItem = ({ item }: { item: Pickup }) => {
    const userIsRequester = isRequester(item);

    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Order #{item.orderId} - {item.pickupType}
        </Text>

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
            <Text style={styles.waitingText}>Waiting for requester to confirm</Text>
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
              onPress={() => openStatusModal(item.id)}
            >
              Update Status
            </BaseButton>
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
                  This pickup was cancelled. Please suggest a new pickup method to proceed.
                </Text>
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
          </View>
        )}
      </View>
    );
  };

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
      <View style={styles.content}>
        <Text style={styles.title}>Pickup Options</Text>
        <Text style={styles.subtitle}>
          Choose how you'd like to receive your item.
        </Text>
        <ProgressBar currentStep={4} steps={progressSteps} />
      </View>

      {showPickup ? (
        <Pickups pickupId={pickupId} />
      ) : isLoading && pickups.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading...</Text>
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
            <Text style={styles.noImageText}>No pickup requests found.</Text>
          }
        />
      )}

      {/* Status Selection Modal */}
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
                    pickups.find((p) => p.id === selectedPickupId)?.status === status &&
                      styles.selectedStatusOption,
                  ]}
                  onPress={() => selectedPickupId && handleUpdateStatus(selectedPickupId, status)}
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
              Cancel
            </BaseButton>
          </View>
        </View>
      </Modal>
    </ScrollView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc", // Matches PaymentScreen
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontFamily: "Poppins-Bold", // Matches PaymentScreen
    fontSize: 24,
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Inter-Regular", // Matches PaymentScreen
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
    fontFamily: "Inter-Medium", // Matches PaymentScreen
    fontSize: 16,
    color: "#64748b",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16, // Matches Card padding in PaymentScreen
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold", // Matches PaymentScreen
    fontSize: 18,
    color: "#1e293b",
    marginBottom: 16,
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
    fontFamily: "Inter-Medium", // Matches PaymentScreen
    fontSize: 14,
    color: "#64748b",
  },
  orderValue: {
    fontFamily: "Inter-Medium", // Matches PaymentScreen
    fontSize: 14,
    color: "#1e293b",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontFamily: "Inter-Medium", // Matches PaymentScreen typography
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
  note: {
    marginTop: 8,
    marginBottom: 16,
  },
  waitingText: {
    fontFamily: "Inter-Regular", // Matches PaymentScreen
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  successText: {
    fontFamily: "Inter-Regular", // Matches PaymentScreen
    fontSize: 14,
    color: "#10b981",
    fontWeight: "600",
    marginBottom: 8,
  },
  cancelledText: {
    fontFamily: "Inter-Regular", // Matches PaymentScreen
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "600",
  },
  warningText: {
    fontFamily: "Inter-Regular", // Matches PaymentScreen
    fontSize: 14,
    color: "#ff9800",
    fontWeight: "600",
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
    fontFamily: "Inter-Regular", // Matches PaymentScreen
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
    borderRadius: 12, // Matches PaymentScreen card
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: "Poppins-SemiBold", // Matches PaymentScreen
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
    borderBottomColor: "#e2e8f0", // Matches PaymentScreen divider
  },
  selectedStatusOption: {
    backgroundColor: "#eff6ff", // Matches PaymentScreen selected option
  },
  statusText: {
    fontFamily: "Inter-Medium", // Matches PaymentScreen
    fontSize: 14,
    color: "#1e293b",
  },
  cancelModalButton: {
    backgroundColor: "#FF4444", // Red for cancel, distinct from primary
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 100,
    marginTop: 10,
  },
});