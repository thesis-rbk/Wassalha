
import { useLocalSearchParams } from "expo-router"
import { useState, useEffect, useRef } from "react"
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
  Image,
  Dimensions,
} from "react-native"
import axiosInstance from "../../config"
import Pickups from "../pickup/pickup"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Pickup } from "../../types/Pickup"
import {
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
  Clock,
  Calendar,
  Package,
  User,
  ArrowRight,
  RefreshCw,
  History,
  Truck,
  Plane,
  Navigation,
  Send,
  Scan,
} from "lucide-react-native"

import { MotiView } from "moti"
import { ThemedView } from "@/components/ThemedView"
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { usePickupActions } from "../../hooks/usePickupActions";
import { QRCodeModal } from "../pickup/QRCodeModal";
import { QRCodeScanner } from "../pickup/QRCodeScanner";
import io, { Socket } from "socket.io-client";
import { navigateToChat } from "@/services/chatService";
import { LinearGradient } from "expo-linear-gradient";
import Header from "@/components/navigation/headers";
import { StatusScreen } from '@/app/screens/StatusScreen';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL
const { width } = Dimensions.get("window")

export default function PickupTraveler() {
  const params = useLocalSearchParams()
  const { user } = useSelector((state: RootState) => state.auth)
  const userId = user?.id

  console.log("params from pickup sp", params)

 
  const [refreshing, setRefreshing] = useState(false)
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
    type: 'error' as 'success' | 'error',
    title: '',
    message: ''
  });

  const { handleAccept, showStoredQRCode, showQRCode, setShowQRCode, qrCodeData, handleCancel } = usePickupActions(
    pickups,
    setPickups,
    userId,
  )

  const socketRef = useRef<Socket | null>(null)
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Pulse animation for chat button
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => pulse())
    }
    pulse()
  }, [])

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${SOCKET_URL}/pickup`, {
        transports: ["websocket"],
      })

      socketRef.current.on("connect", () => {
        console.log("✅ Connected to Socket.IO server (PickupTraveler)")
        pickups.forEach((pickup) => {
          const room = `pickup:${pickup.id}`
          socketRef.current?.emit("joinPickupRoom", pickup.id)
          console.log(`Joined room: ${room}`)
        })
      })

      socketRef.current.on("connect_error", (error) => {
        console.error("❌ Socket.IO connection error:", error.message)
      })

      socketRef.current.on("pickupAccepted", (updatedPickup: Pickup) => {
        console.log("✅ Received pickupAccepted (PickupTraveler):", updatedPickup)
        setPickups((prev) => prev.map((p) => (p.id === updatedPickup.id ? updatedPickup : p)))
      })

      socketRef.current.on("suggestionUpdate", (data: Pickup) => {
        console.log("📩 Received suggestionUpdate (PickupTraveler):", data)
        setPickups((prev) => {
          const updatedPickups = prev.map((p) => (p.id === data.id ? data : p))
          console.log("Updated pickups in PickupTraveler:", updatedPickups)
          return updatedPickups
        })
      })

      socketRef.current.on("statusUpdate", (updatedPickup: Pickup) => {
        console.log("🔄 Received statusUpdate (PickupTraveler):", updatedPickup)
        setPickups((prev) => prev.map((p) => (p.id === updatedPickup.id ? updatedPickup : p)))
      })

      socketRef.current.on("disconnect", () => {
        console.log("❌ Disconnected from Socket.IO server (PickupTraveler)")
      })
    }

    if (socketRef.current?.connected) {
      pickups.forEach((pickup) => {
        const room = `pickup:${pickup.id}`
        socketRef.current?.emit("joinPickupRoom", pickup.id)
        console.log(`Joined room: ${room}`)
      })
    }

    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [pickups])

  useEffect(() => {
    fetchPickups()
  }, [])

  const openChat = async () => {
    if (!user?.id) {
      setStatusMessage({
        type: 'error',
        title: 'Error',
        message: 'You need to be logged in to chat'
      });
      setStatusVisible(true);
      return;
    }

    try {
      const requesterId = Number.parseInt(params.requesterId.toString())
      const providerId = Number.parseInt(params.travelerId.toString())
      const goodsId = Number.parseInt(params.idGood.toString())

      console.log("Opening chat with:", {
        requesterId: Number.parseInt(params.travelerId.toString()),
        providerId: user?.id,
        goodsId: Number.parseInt(params.idGood.toString()),
      })

      await navigateToChat(requesterId, providerId, goodsId, {
        orderId: Number.parseInt(params.idOrder.toString()),
        goodsName: params.goodsName?.toString() || "Item",
      })
    } catch (error) {
      console.error("Error opening chat:", error);
      setStatusMessage({
        type: 'error',
        title: 'Chat Error',
        message: 'Failed to open chat. Error: ' + (error instanceof Error ? error.message : String(error))
      });
      setStatusVisible(true);
    }
  }

  const fetchPickups = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const token = await AsyncStorage.getItem("jwtToken")
      if (!token) throw new Error("No authentication token found")

      const response = await axiosInstance.get<{
        success: boolean
        data: Pickup[]
      }>(`/api/pickup/traveler`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setPickups(response.data.data)
      console.log("Pickups (Traveler):", response.data.data)
    } catch (error) {
      console.error("Error fetching pickups (Traveler):", error);
      setStatusMessage({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch pickups. Please try again.'
      });
      setStatusVisible(true);
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchPickups()
  }

  const handleSuggest = async (pickupId: number): Promise<void> => {
    setPickupId(pickupId)
    setShowPickup(true)
  }

  const handleUpdateStatus = async (pickupId: number, newStatus: Pickup["status"]): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("jwtToken")
      if (!token) throw new Error("No authentication token found")

      const validStatuses: Pickup["status"][] = [
        "SCHEDULED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "DELAYED",
        "DELIVERED",
      ]

      if (!validStatuses.includes(newStatus)) {
        throw new Error("Invalid status selected")
      }

      await axiosInstance.put(
        "/api/pickup/status",
        { pickupId, newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setStatusMessage({
        type: 'success',
        title: 'Success',
        message: `Pickup status updated to ${newStatus} successfully!`
      });
      setStatusVisible(true);
      setStatusModalVisible(false);
    } catch (error) {
      console.error("Error updating pickup status:", error);
      setStatusMessage({
        type: 'error',
        title: 'Error',
        message: 'Failed to update pickup status. Please try again.'
      });
      setStatusVisible(true);
    }
  }

  const openStatusModal = (pickupId: number) => {
    setSelectedPickupId(pickupId)
    setStatusModalVisible(true)
  }

  const fetchSuggestions = async (pickupId: number) => {
    try {
      setIsLoading(true)
      const token = await AsyncStorage.getItem("jwtToken")
      if (!token) throw new Error("No authentication token found")

      const response = await axiosInstance.get(`/api/pickup/history/${pickupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setSuggestions(response.data.data)
        setShowSuggestions(true)
      } else {
        setStatusMessage({
          type: 'error',
          title: 'Info',
          message: 'No suggestions found for this pickup.'
        });
        setStatusVisible(true);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setStatusMessage({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch suggestions. Please try again.'
      });
      setStatusVisible(true);
    } finally {
      setIsLoading(false)
    }
  }

  // Get pickup type icon
  const getPickupTypeIcon = (type: string) => {
    switch (type) {
      case "AIRPORT":
        return <Plane size={24} color="#fff" />
      case "DELIVERY":
        return <Truck size={24} color="#fff" />
      case "IN_PERSON":
        return <User size={24} color="#fff" />
      case "PICKUPPOINT":
        return <MapPin size={24} color="#fff" />
      default:
        return <Package size={24} color="#fff" />
    }
  }

  // Get pickup type text
  const getPickupTypeText = (type: string) => {
    switch (type) {
      case "AIRPORT":
        return "Airport"
      case "DELIVERY":
        return "Delivery"
      case "IN_PERSON":
        return "In-Person"
      case "PICKUPPOINT":
        return "Pickup Point"
      default:
        return "Pickup"
    }
  }

  // Get pickup type gradient colors
  const getPickupTypeGradient = (type: string): [string, string] => {
    switch (type) {
      case "AIRPORT":
        return ["#8b5cf6", "#7c3aed"] // Purple
      case "DELIVERY":
        return ["#10b981", "#059669"] // Green
      case "IN_PERSON":
        return ["#3b82f6", "#2563eb"] // Blue
      case "PICKUPPOINT":
        return ["#f59e0b", "#d97706"] // Orange
      default:
        return ["#6b7280", "#4b5563"] // Gray
    }
  }

  const renderItem = ({ item, index }: { item: Pickup; index: number }) => {
    const isConfirmed = item.userconfirmed && item.travelerconfirmed
    const needsAction = item.userconfirmed && !item.travelerconfirmed && item.status !== "CANCELLED"
    const isCancelled = item.status === "CANCELLED"
    const isWaiting = !item.userconfirmed && item.travelerconfirmed

    // Get card style based on status
    const getCardStyle = () => {
      if (isConfirmed) return styles.confirmedCard
      if (needsAction) return styles.actionCard
      if (isCancelled) return styles.cancelledCard
      return styles.waitingCard
    }

    // Get status icon based on status
    const getStatusIcon = () => {
      if (isConfirmed) return <CheckCircle size={20} color="#10b981" />
      if (needsAction) return <AlertCircle size={20} color="#3b82f6" />
      if (isCancelled) return <XCircle size={20} color="#ef4444" />
      return <Clock size={20} color="#f59e0b" />
    }

    // Get status text based on status
    const getStatusText = () => {
      if (isConfirmed) return "Confirmed"
      if (needsAction) return "Action Needed"
      if (isCancelled) return "Cancelled"
      return "Waiting"
    }

    return (
      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500, delay: index * 100 }}
        style={[styles.cardContainer, getCardStyle()]}
      >
        {/* Top Section with Pickup Type */}
        <LinearGradient
          colors={getPickupTypeGradient(item.pickupType)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardHeader}
        >
          <View style={styles.pickupTypeContainer}>
            <View style={styles.pickupTypeIconContainer}>{getPickupTypeIcon(item.pickupType)}</View>
            <View>
              <Text style={styles.pickupTypeText}>{getPickupTypeText(item.pickupType)}</Text>
              <Text style={styles.pickupTypeDescription}>{item.location || "Location not specified"}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.historyButton} onPress={() => fetchSuggestions(item.id)}>
            <History size={16} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Main Card Content */}
        <View style={styles.cardContent}>
          {/* Order Info */}
          <View style={styles.orderInfoContainer}>
            <Text style={styles.orderTitle}>{params.goodsName || "Your Order"}</Text>
            <View style={styles.requesterRow}>
              <User size={14} color="#64748b" />
              <Text style={styles.requesterName}>with {params.requesterName || "Requester"}</Text>
            </View>
          </View>

          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View style={styles.statusIconContainer}>{getStatusIcon()}</View>
            <Text
              style={[
                styles.statusText,
                isConfirmed && styles.confirmedText,
                needsAction && styles.actionText,
                isCancelled && styles.cancelledText,
                isWaiting && styles.waitingText,
              ]}
            >
              {getStatusText()}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            {/* Location */}
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <MapPin size={18} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {item.address || "Not specified"}
                </Text>
              </View>
            </View>

            {/* Time */}
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Clock size={18} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>
                  {new Date(item.scheduledTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>

            {/* Date */}
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Calendar size={18} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(item.scheduledTime).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>

            {/* Status */}
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <AlertCircle size={18} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusBadgeText}>{item.status.replace("_", " ")}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Status Message */}
          {(isWaiting || isConfirmed || needsAction) && (
            <View
              style={[
                styles.messageContainer,
                isConfirmed && styles.confirmedMessage,
                needsAction && styles.actionMessage,
                isWaiting && styles.waitingMessage,
              ]}
            >
              {isWaiting && <Text style={styles.messageText}>Waiting for requester confirmation</Text>}
              {isConfirmed && <Text style={styles.messageText}>Pickup confirmed! Ready for delivery.</Text>}
              {needsAction && (
                <Text style={styles.messageText}>Requester has suggested a pickup. Your action is required.</Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          {!item.userconfirmed && !item.travelerconfirmed && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>You'll be able to take actions once the requester suggests a pickup</Text>
            </View>
          )}

          {needsAction && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item.id)}>
                <LinearGradient
                  colors={["#3b82f6", "#2563eb"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <CheckCircle size={18} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Accept</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.suggestButton} onPress={() => handleSuggest(item.id)}>
                <LinearGradient
                  colors={["#f59e0b", "#d97706"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Navigation size={18} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Suggest</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(item.id)}>
                <LinearGradient
                  colors={["#ef4444", "#dc2626"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <XCircle size={18} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Cancel</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {isCancelled && (
            <TouchableOpacity style={styles.fullWidthButton} onPress={() => handleSuggest(item.id)}>
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Send size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Suggest New Pickup</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {isConfirmed && (
            <>
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.acceptButton} onPress={() => openStatusModal(item.id)}>
                  <LinearGradient
                    colors={["#3b82f6", "#2563eb"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <RefreshCw size={18} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Update Status</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.suggestButton} onPress={() => showStoredQRCode(item)}>
                  <LinearGradient
                    colors={["#10b981", "#059669"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {/* <Image source={require("../../assets/images/qr-code.png")} style={styles.qrIcon} /> */}
                    <Text style={styles.buttonText}>Show QR</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.fullWidthButton} onPress={() => setShowScanner(true)}>
                <LinearGradient
                  colors={["#8b5cf6", "#7c3aed"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Scan size={18} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Scan QR Code</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </MotiView>
    )
  }

  const renderSuggestions = () => (
    <ThemedView style={styles.suggestionsContainer}>
      <LinearGradient colors={["#1e293b", "#0f172a"]} style={styles.suggestionsHeader}>
        <Text style={styles.suggestionsTitle}>Pickup History</Text>
        <Text style={styles.suggestionsSubtitle}>Previous pickup suggestions and arrangements</Text>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : suggestions.length === 0 ? (
        <View style={styles.emptyHistoryContainer}>
          <History size={64} color="#cbd5e1" />
          <Text style={styles.emptyHistoryTitle}>No History Found</Text>
          <Text style={styles.emptyHistoryText}>There are no previous pickup suggestions for this order</Text>
        </View>
      ) : (
        <FlatList
          data={suggestions}
          renderItem={({ item, index }) => (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 300, delay: index * 100 }}
              style={styles.historyItem}
            >
              <LinearGradient
                colors={getHistoryGradient(item.pickupType)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.historyItemGradient}
              >
                <View style={styles.historyItemHeader}>
                  <View style={styles.historyTypeContainer}>
                    <View style={styles.historyTypeIconContainer}>{getHistoryTypeIcon(item.pickupType)}</View>
                    <Text style={styles.historyTypeText}>{formatPickupType(item.pickupType)}</Text>
                  </View>
                  <Text style={styles.historyDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>

                <View style={styles.historyDetails}>
                  <View style={styles.historyDetailRow}>
                    <Text style={styles.historyDetailLabel}>By:</Text>
                    <Text style={styles.historyDetailValue}>{item.user?.name || "Unknown"}</Text>
                  </View>

                  <View style={styles.historyDetailRow}>
                    <Text style={styles.historyDetailLabel}>Location:</Text>
                    <Text style={styles.historyDetailValue}>
                      {item.location || "N/A"}
                      {item.address ? `, ${item.address}` : ""}
                    </Text>
                  </View>

                  <View style={styles.historyDetailRow}>
                    <Text style={styles.historyDetailLabel}>Scheduled:</Text>
                    <Text style={styles.historyDetailValue}>
                      {item.scheduledTime
                        ? new Date(item.scheduledTime).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </MotiView>
          )}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.historyList}
        />
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => setShowSuggestions(false)}>
        <LinearGradient
          colors={["#3b82f6", "#2563eb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <ArrowRight size={18} color="#fff" style={[styles.buttonIcon, { transform: [{ rotate: "180deg" }] }]} />
          <Text style={styles.buttonText}>Back to Pickups</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ThemedView>
  )

  return (
    <ThemedView style={styles.container}>
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
            requesterId: params.requesterId as string,
            travelerId: params.travelerId as string,
            idOrder: params.idOrder as string,
            requesterName: params.requesterName as string,
            travelerName: params.travelerName as string,
            goodsName: params.goodsName as string,
            status: params.status as string,
            reviewLabel: params.reviewLabel as string,
            isTraveler: params.isTraveler as string
          }}
        />
      ) : (
        <>
          <LinearGradient colors={["#1e293b", "#0f172a"]} style={styles.header}>
            <Text style={styles.title}>Your Pickup Requests</Text>
            <Text style={styles.subtitle}>Manage your delivery assignments and pickup status</Text>
          </LinearGradient>

          {isLoading && pickups.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading your assignments...</Text>
            </View>
          ) : (
            <FlatList
              data={pickups}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Package size={80} color="#cbd5e1" />
                  <Text style={styles.emptyTitle}>No Assignments Found</Text>
                  <Text style={styles.emptyText}>You don't have any active pickup assignments yet</Text>
                  <TouchableOpacity style={styles.refreshButton} onPress={fetchPickups}>
                    <LinearGradient
                      colors={["#3b82f6", "#2563eb"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.buttonGradient}
                    >
                      <RefreshCw size={18} color="#fff" style={styles.buttonIcon} />
                      <Text style={styles.buttonText}>Refresh</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              }
            />
          )}
        </>
      )}

      <QRCodeModal visible={showQRCode} qrCodeData={qrCodeData} onClose={() => setShowQRCode(false)} paramsData={params} />

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
              data={["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DELAYED", "DELIVERED"]}
              keyExtractor={(item) => item}
              renderItem={({ item: status }) => (
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    pickups.find((p) => p.id === selectedPickupId)?.status === status && styles.selectedStatusOption,
                  ]}
                  onPress={() => selectedPickupId && handleUpdateStatus(selectedPickupId, status as Pickup["status"])}
                >
                  <View style={styles.statusOptionContent}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
                    <Text style={styles.statusOptionText}>{status.replace("_", " ")}</Text>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.statusList}
            />
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setStatusModalVisible(false)}>
              <LinearGradient
                colors={["#ef4444", "#dc2626"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <XCircle size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <QRCodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        pickups={pickups}
        setPickups={setPickups}
        paramsData={{
          requesterId: params.requesterId.toString(),
          travelerId: params.travelerId.toString(),
          idOrder: params.idOrder.toString(),
          requesterName: params.requesterName?.toString() || "Requester",
          travelerName: params.travelerName?.toString() || "Traveler",
          goodsName: params.goodsName?.toString() || "Item",
          status: params.status?.toString() || "PENDING",
          reviewLabel: "Rate the delivery",
          isTraveler: "true"
        }}
      />

      <Animated.View style={[styles.chatButton, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity style={styles.chatButtonTouchable} onPress={openChat}>
          <LinearGradient colors={["#3b82f6", "#2563eb"]} style={styles.chatButtonGradient}>
            <MessageCircle size={24} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </ThemedView>
  )
}

// Helper functions
const getStatusColor = (status: string): string => {
  switch (status) {
    case "PENDING":
    case "SCHEDULED":
      return "#f59e0b" // orange
    case "IN_PROGRESS":
      return "#3b82f6" // blue
    case "CANCELLED":
      return "#ef4444" // red
    case "COMPLETED":
    case "DELIVERED":
      return "#10b981" // green
    case "DELAYED":
      return "#8b5cf6" // purple
    default:
      return "#6b7280" // gray
  }
}

const getHistoryGradient = (type: string): [string, string] => {
  switch (type) {
    case "AIRPORT":
      return ["#4c1d95", "#5b21b6"] // Deep purple
    case "DELIVERY":
      return ["#065f46", "#047857"] // Deep green
    case "IN_PERSON":
      return ["#1e40af", "#1d4ed8"] // Deep blue
    case "PICKUPPOINT":
      return ["#92400e", "#b45309"] // Deep orange
    default:
      return ["#374151", "#4b5563"] // Deep gray
  }
}

const getHistoryTypeIcon = (type: string) => {
  switch (type) {
    case "AIRPORT":
      return <Plane size={18} color="#fff" />
    case "DELIVERY":
      return <Truck size={18} color="#fff" />
    case "IN_PERSON":
      return <User size={18} color="#fff" />
    case "PICKUPPOINT":
      return <MapPin size={18} color="#fff" />
    default:
      return <Package size={18} color="#fff" />
  }
}

const formatPickupType = (type: string): string => {
  switch (type) {
    case "AIRPORT":
      return "Airport Pickup"
    case "DELIVERY":
      return "Home Delivery"
    case "IN_PERSON":
      return "In-Person Pickup"
    case "PICKUPPOINT":
      return "Pickup Point"
    default:
      return type.replace("_", " ")
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#cbd5e1",
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
    padding: 16,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    backgroundColor: "#ffffff",
  },
  confirmedCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  actionCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  cancelledCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  waitingCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  pickupTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pickupTypeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  pickupTypeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#ffffff",
  },
  pickupTypeDescription: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: 20,
  },
  orderInfoContainer: {
    marginBottom: 16,
  },
  orderTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    color: "#1e293b",
    marginBottom: 4,
  },
  requesterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  requesterName: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#64748b",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIconContainer: {
    marginRight: 8,
  },
  statusText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
  },
  confirmedText: {
    color: "#10b981",
  },
  actionText: {
    color: "#3b82f6",
  },
  cancelledText: {
    color: "#ef4444",
  },
  waitingText: {
    color: "#f59e0b",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  detailLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: "#1e293b",
    maxWidth: 120,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusBadgeText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#ffffff",
    textTransform: "capitalize",
  },
  messageContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  confirmedMessage: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  actionMessage: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  waitingMessage: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
  messageText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    textAlign: "center",
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    fontStyle: "italic",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  acceptButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullWidthButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 15,
    color: "#fff",
  },
  buttonIcon: {
    marginRight: 8,
  },
  qrIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: "#fff",
  },
  chatButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    zIndex: 100,
  },
  chatButtonTouchable: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  chatButtonGradient: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 24,
    color: "#1e293b",
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 32,
    maxWidth: 300,
  },
  refreshButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsContainer: {
    flex: 1,
  },
  suggestionsHeader: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  suggestionsTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    color: "#ffffff",
    marginBottom: 8,
  },
  suggestionsSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#cbd5e1",
  },
  historyList: {
    padding: 16,
    paddingBottom: 100,
  },
  historyItem: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  historyItemGradient: {
    padding: 16,
  },
  historyItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyTypeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  historyTypeText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#ffffff",
  },
  historyDate: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  historyDetails: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  historyDetailRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  historyDetailLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    width: 80,
  },
  historyDetailValue: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#ffffff",
    flex: 1,
  },
  backButton: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyHistoryContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyHistoryTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 24,
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyHistoryText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    maxWidth: 300,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
  },
  statusList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  statusOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  statusOptionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  selectedStatusOption: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
  },
  statusOptionText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: "#1e293b",
    textTransform: "capitalize",
  },
  closeModalButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
})

