
import { useLocalSearchParams } from "expo-router"
import { useState, useEffect, useRef } from "react"
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  Image,
  Dimensions,
} from "react-native"
import { ThemedView } from "@/components/ThemedView"
import axiosInstance from "../../config"
import Pickups from "../pickup/pickup"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
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
  Info,
} from "lucide-react-native"
import { usePickupActions } from "../../hooks/usePickupActions"
import { QRCodeModal } from "../pickup/QRCodeModal"
import io, { type Socket } from "socket.io-client"
import { navigateToChat } from "@/services/chatService"
import { LinearGradient } from "expo-linear-gradient"

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL
const { width } = Dimensions.get("window")

export default function PickupOwner() {
  const params = useLocalSearchParams()
  const { user } = useSelector((state: RootState) => state.auth)
  const userId = user?.id

  const [pickupId, setPickupId] = useState<number>(0)
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [showPickup, setShowPickup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const { handleAccept, showStoredQRCode, showQRCode, setShowQRCode, qrCodeData, handleCancel } = usePickupActions(
    pickups,
    setPickups,
    userId,
  )

  const socketRef = useRef<Socket | null>(null)
  const pulseAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(0)).current

  // Animation for cards
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()
  }, [pickups])

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

  // Socket connection
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${SOCKET_URL}/pickup`, {
        transports: ["websocket"],
      })

      socketRef.current.on("connect", () => {
        console.log("✅ Connected to Socket.IO server (PickupOwner)")
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
        console.log("✅ Received pickupAccepted (PickupOwner):", updatedPickup)
        setPickups((prev) => prev.map((p) => (p.id === updatedPickup.id ? updatedPickup : p)))
      })

      socketRef.current.on("suggestionUpdate", (data: Pickup) => {
        console.log("📩 Received suggestionUpdate (PickupOwner):", data)
        setPickups((prev) => prev.map((p) => (p.id === data.id ? data : p)))
      })

      socketRef.current.on("statusUpdate", (updatedPickup: Pickup) => {
        console.log("🔄 Received statusUpdate (PickupOwner):", updatedPickup)
        setPickups((prev) => prev.map((p) => (p.id === updatedPickup.id ? updatedPickup : p)))
      })

      socketRef.current.on("disconnect", () => {
        console.log("❌ Disconnected from Socket.IO server (PickupOwner)")
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
      Alert.alert("Error", "You need to be logged in to chat")
      return
    }

    try {
      const requesterId = Number.parseInt(params.requesterId.toString())
      const providerId = Number.parseInt(params.travelerId.toString())
      const goodsId = Number.parseInt(params.idGood.toString())

      console.log("Opening chat with:", {
        requesterId: user?.id,
        providerId: Number.parseInt(params.travelerId.toString()),
        goodsId: Number.parseInt(params.idGood.toString()),
      })

      await navigateToChat(requesterId, providerId, goodsId, {
        orderId: Number.parseInt(params.idOrder.toString()),
        goodsName: params.goodsName?.toString() || "Item",
      })
    } catch (error) {
      console.error("Error opening chat:", error)
      Alert.alert(
        "Chat Error",
        "Failed to open chat. Error: " + (error instanceof Error ? error.message : String(error)),
      )
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
      }>(`/api/pickup/requester`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setPickups(response.data.data)
      console.log("Pickups fetched:", response.data.data)
    } catch (error) {
      console.error("Error fetching pickups:", error)
      Alert.alert("Error", "Failed to fetch pickups. Please try again.")
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
        Alert.alert("Info", "No suggestions found for this pickup.")
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      Alert.alert("Error", "Failed to fetch suggestions. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock size={16} color="#fff" />
      case "IN_PROGRESS":
        return <RefreshCw size={16} color="#fff" />
      case "CANCELLED":
        return <XCircle size={16} color="#fff" />
      case "COMPLETED":
        return <CheckCircle size={16} color="#fff" />
      default:
        return <Info size={16} color="#fff" />
    }
  }

  const renderItem = ({ item, index }: { item: Pickup; index: number }) => {
    const isConfirmed = item.userconfirmed && item.travelerconfirmed
    const needsAction = !item.userconfirmed && item.travelerconfirmed && item.status !== "CANCELLED"
    const isCancelled = item.status === "CANCELLED"
    const isWaiting = item.userconfirmed && !item.travelerconfirmed

    // Calculate gradient colors based on status
    let gradientColors: [string, string, ...string[]]
    if (isConfirmed) {
      gradientColors = ["#ecfdf5", "#d1fae5"] as [string, string] // Green gradient for confirmed
    } else if (isCancelled) {
      gradientColors = ["#fef2f2", "#fee2e2"] as [string, string] // Red gradient for cancelled
    } else if (needsAction) {
      gradientColors = ["#eff6ff", "#dbeafe"] as [string, string] // Blue gradient for action needed
    } else {
      gradientColors = ["#f8fafc", "#f1f5f9"] as [string, string] // Default light gradient
    }

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: slideAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardGradient}>
          {/* Status Badge */}
          <View style={[styles.statusBadgeContainer, { backgroundColor: getStatusColor(item.status) }]}>
            {getStatusIcon(item.status)}
            <Text style={styles.statusBadgeText}>{item.status.replace("_", " ")}</Text>
          </View>

          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderTitle}>{params.goodsName || "Your Order"}</Text>

              <View style={styles.travelerContainer}>
                <User size={14} color="#64748b" style={{ marginRight: 6 }} />
                <Text style={styles.travelerName}>{params.travelerName || "Traveler"}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.historyButton} onPress={() => fetchSuggestions(item.id)}>
              <History size={16} color="#3b82f6" />
              <Text style={styles.historyButtonText}>History</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Details Section */}
          <View style={styles.detailsContainer}>
            {/* Location */}
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MapPin size={18} color="#3b82f6" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Pickup Location</Text>
                <Text style={styles.detailValue}>
                  {item.location || "Not specified"}
                  {item.address ? `, ${item.address}` : ""}
                </Text>
              </View>
            </View>

            {/* Time and Date */}
            <View style={styles.timeContainer}>
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <Clock size={18} color="#3b82f6" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>
                    {new Date(item.scheduledTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <Calendar size={18} color="#3b82f6" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>
                    {new Date(item.scheduledTime).toLocaleDateString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Status Messages */}
          {isWaiting && (
            <View style={styles.statusMessage}>
              <Clock size={18} color="#3b82f6" />
              <Text style={styles.waitingText}>Waiting for traveler confirmation</Text>
            </View>
          )}

          {isConfirmed && (
            <View style={styles.statusMessage}>
              <CheckCircle size={18} color="#10b981" />
              <Text style={styles.successText}>Pickup confirmed! Your package is on the way.</Text>
            </View>
          )}

          {needsAction && (
            <View style={styles.statusMessage}>
              <AlertCircle size={18} color="#3b82f6" />
              <Text style={styles.actionText}>Traveler has confirmed. Your action is required.</Text>
            </View>
          )}

          {isCancelled && (
            <View style={styles.statusMessage}>
              <XCircle size={18} color="#ef4444" />
              <Text style={styles.cancelledText}>This pickup was cancelled</Text>
            </View>
          )}

          {/* Action Buttons */}
          {needsAction && (
            <View style={styles.actionContainer}>
              <View style={styles.buttonRow}>
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
                  <MapPin size={18} color="#3b82f6" style={styles.buttonIcon} />
                  <Text style={styles.suggestButtonText}>Suggest Alternative</Text>
                </TouchableOpacity>
              </View>

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
            <TouchableOpacity style={styles.newSuggestionButton} onPress={() => handleSuggest(item.id)}>
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <MapPin size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Suggest New Pickup</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {isConfirmed && (
            <TouchableOpacity style={styles.qrButton} onPress={() => showStoredQRCode(item)}>
              <LinearGradient
                colors={["#10b981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {/* <Image source={require("../../assets/images/qr-code.png")} style={styles.qrIcon} /> */}
                <Text style={styles.buttonText}>Show QR Code</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </Animated.View>
    )
  }

  const renderSuggestions = () => (
    <ThemedView style={styles.suggestionsContainer}>
      <View style={styles.suggestionsHeader}>
        <Text style={styles.suggestionsTitle}>Pickup History</Text>
        <Text style={styles.suggestionsSubtitle}>Previous pickup suggestions and arrangements</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : suggestions.length === 0 ? (
        <View style={styles.emptyHistoryContainer}>
          <History size={48} color="#cbd5e1" />
          <Text style={styles.emptyHistoryTitle}>No History Found</Text>
          <Text style={styles.emptyHistoryText}>There are no previous pickup suggestions for this order</Text>
        </View>
      ) : (
        <FlatList
          data={suggestions}
          renderItem={({ item, index }) => (
            <Animated.View
              style={[
                styles.historyItem,
                {
                  opacity: slideAnim,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30 * index, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={["#f8fafc", "#f1f5f9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.historyItemGradient}
              >
                <View style={styles.historyItemHeader}>
                  <View style={styles.historyTypeContainer}>
                    <View style={[styles.historyTypeIcon, { backgroundColor: getPickupTypeColor(item.pickupType) }]}>
                      {getPickupTypeIcon(item.pickupType)}
                    </View>
                    <Text style={styles.historyType}>{formatPickupType(item.pickupType)}</Text>
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
            </Animated.View>
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
        />
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Your Pickups</Text>
            <Text style={styles.subtitle}>Manage your delivery requests and pickup options</Text>
          </View>

          {isLoading && pickups.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading your pickups...</Text>
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
                  <Package size={64} color="#cbd5e1" />
                  <Text style={styles.emptyTitle}>No Pickups Found</Text>
                  <Text style={styles.emptyText}>You don't have any active pickup requests yet</Text>
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

      <QRCodeModal visible={showQRCode} qrCodeData={qrCodeData} onClose={() => setShowQRCode(false)} />

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
      return "#f59e0b" // orange
    case "IN_PROGRESS":
      return "#3b82f6" // blue
    case "CANCELLED":
      return "#ef4444" // red
    case "COMPLETED":
      return "#10b981" // green
    default:
      return "#6b7280" // gray
  }
}

const getPickupTypeColor = (type: string): string => {
  switch (type) {
    case "AIRPORT":
      return "#8b5cf6" // purple
    case "DELIVERY":
      return "#10b981" // green
    case "IN_PERSON":
      return "#3b82f6" // blue
    case "PICKUPPOINT":
      return "#f59e0b" // orange
    default:
      return "#6b7280" // gray
  }
}

const getPickupTypeIcon = (type: string) => {
  switch (type) {
    case "AIRPORT":
      return <MapPin size={14} color="#fff" />
    case "DELIVERY":
      return <Package size={14} color="#fff" />
    case "IN_PERSON":
      return <User size={14} color="#fff" />
    case "PICKUPPOINT":
      return <MapPin size={14} color="#fff" />
    default:
      return <Package size={14} color="#fff" />
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
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    color: "#1e293b",
    marginBottom: 8,
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
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardGradient: {
    padding: 20,
    position: "relative",
  },
  statusBadgeContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  statusBadgeText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "white",
    textTransform: "capitalize",
    marginLeft: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingRight: 80, // Make room for the status badge
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#1e293b",
    marginBottom: 6,
  },
  travelerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  travelerName: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#64748b",
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  historyButtonText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#3b82f6",
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(203, 213, 225, 0.5)",
    marginVertical: 16,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
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
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: "Inter-SemiBold",
    fontSize: 15,
    color: "#1e293b",
    lineHeight: 22,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statusMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(241, 245, 249, 0.8)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  waitingText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#3b82f6",
    marginLeft: 10,
  },
  successText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#10b981",
    marginLeft: 10,
  },
  actionText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#3b82f6",
    marginLeft: 10,
  },
  cancelledText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#ef4444",
    marginLeft: 10,
  },
  actionContainer: {
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    width: "100%",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  cancelButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newSuggestionButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrButton: {
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
  suggestButtonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 15,
    color: "#3b82f6",
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    color: "#1e293b",
    marginTop: 20,
    marginBottom: 8,
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
  suggestionsContainer: {
    flex: 1,
    padding: 20,
  },
  suggestionsHeader: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "#1e293b",
    marginBottom: 8,
  },
  suggestionsSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#64748b",
  },
  historyList: {
    paddingBottom: 100,
  },
  historyItem: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
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
  historyTypeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  historyType: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#1e293b",
  },
  historyDate: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#64748b",
  },
  historyDetails: {
    marginTop: 8,
  },
  historyDetailRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  historyDetailLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#64748b",
    width: 80,
  },
  historyDetailValue: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#1e293b",
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
    fontSize: 20,
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
})

