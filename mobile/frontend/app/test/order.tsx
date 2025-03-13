import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import SegmentedControl from "@/components/SegmentedControl";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import axiosInstance from "@/config";
import { useAuth } from "@/hooks/useAuth";
import { Request, RequestStatus, Goods } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { MapPin, DollarSign, Package, Activity } from "lucide-react-native";
import { BACKEND_URL } from "@/config";
import { useRouter } from "expo-router";
import { decode as atob } from "base-64";
import { GoodsProcess, ProcessStatus } from "@/types/GoodsProcess";

// Custom hook to ensure we have user data
const useReliableAuth = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [tokenUser, setTokenUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First, check if useAuth provided a user
        if (authUser) {
          console.log("User found from useAuth:", authUser);
          setLoading(false);
          return;
        }

        // Second, try to load from AsyncStorage 'user'
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log("User found from AsyncStorage:", parsedUser);
          setTokenUser(parsedUser);
          setLoading(false);
          return;
        }

        // Third, try to decode the JWT token
        const token = await AsyncStorage.getItem("jwtToken");
        if (token) {
          try {
            const tokenParts = token.split(".");
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log("User found from JWT token:", payload);

              if (payload.id) {
                setTokenUser({
                  id: payload.id.toString(),
                  name: payload.name || "User",
                  email: payload.email || "",
                });
              }
            }
          } catch (e) {
            console.error("Error decoding JWT token:", e);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [authUser, authLoading]);

  return {
    user: authUser || tokenUser,
    loading,
  };
};

export default function OrderPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<"orders" | "requests">("orders");
  const [goodsProcesses, setGoodsProcesses] = useState<GoodsProcess[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const { user, loading: authLoading } = useReliableAuth();
  const router = useRouter();

  // Add a function to check if the current user is the owner of a request
  const isOwnRequest = (requestUserId: number): boolean => {
    if (!user || !user.id) return false;

    // Convert both IDs to strings for comparison
    const userIdStr = user.id.toString();
    const requestUserIdStr = requestUserId.toString();

    return userIdStr === requestUserIdStr;
  };

  const getProcessStatusColor = (status: ProcessStatus): string => {
    switch (status) {
      case "PREINITIALIZED":
        return "#3b82f6"; // blue
      case "INITIALIZED":
        return "#3b82f6"; // blue
      case "CONFIRMED":
        return "#8b5cf6"; // purple
      case "PAID":
        return "#10b981"; // green
      case "IN_TRANSIT":
        return "#f97316"; // orange
      case "PICKUP_MEET":
        return "#eab308"; // yellow
      case "FINALIZED":
        return "#14b8a6"; // teal
      case "CANCELLED":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  const getProcessStatusText = (status: ProcessStatus): string => {
    switch (status) {
      case "PREINITIALIZED":
        return "Pre-Initialized";
      case "INITIALIZED":
        return "Initialized";
      case "CONFIRMED":
        return "Confirmed";
      case "PAID":
        return "Paid";
      case "IN_TRANSIT":
        return "In Transit";
      case "PICKUP_MEET":
        return "Ready for Pickup";
      case "FINALIZED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getRequestStatusColor = (status: RequestStatus): string => {
    switch (status) {
      case "PENDING":
        return "#3b82f6"; // blue
      case "ACCEPTED":
        return "#10b981"; // green
      case "CANCELLED":
        return "#f97316"; // orange
      case "REJECTED":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  const getRequestStatusText = (status: RequestStatus): string => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "ACCEPTED":
        return "Accepted";
      case "CANCELLED":
        return "Cancelled";
      case "REJECTED":
        return "Rejected";
      default:
        return status;
    }
  };

  // Fetch requests when component mounts or user changes
  useEffect(() => {
    if (!authLoading) {
      console.log("User loaded, fetching orders...", user);
      fetchGoodsProcesses();
      fetchRequests();
    }
  }, [user, authLoading]);

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/requests");
      setRequests(response.data.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRequestItem = ({ item }: { item: Request }) => {
    const parameters = {
      id: item?.id?.toString(),
      goodsName: item.goods?.name || "Unknown",
      price: item.goods?.price || 0,
      location: item.goodsLocation || "Unknown",
      destination: item.goodsDestination || "Unknown",
      quantity: item.quantity.toString() || "0",
      description: item.goods?.description || "",
      category: item?.goods?.category?.name || "Uncategorized",
      withBox: item.withBox?.toString() || "false",
      requesterId: item.userId.toString(),
      requesterName: item.user?.name || "Anonymous",
      requesterRating: item.user?.reputation?.score?.toString() || "0",
      requesterLevel: item.user?.reputation?.level?.toString() || "1",
      requesterTotalRatings:
        item.user?.reputation?.totalRatings?.toString() || "0",
      requesterVerified: item.user?.profile?.isVerified?.toString() || "false",
      status: item.status,
      imageUrl: item.goods?.goodsUrl
        ? `${BACKEND_URL}${item.goods.goodsUrl}`
        : null,
    };

    return (
      <View style={styles.card}>
        <View style={styles.imageSection}>
          {parameters.imageUrl ? (
            <Image
              source={{ uri: parameters.imageUrl }}
              style={styles.productImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <ThemedText style={styles.noImageText}>
                No Image Available
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <ThemedText style={styles.productTitle}>
                {parameters.goodsName}
              </ThemedText>

              <View style={styles.badgeContainer}>
                {isOwnRequest(item.userId) && (
                  <View style={styles.ownRequestBadge}>
                    <ThemedText style={styles.badgeText}>
                      Your Request
                    </ThemedText>
                  </View>
                )}

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getRequestStatusColor(item.status),
                    },
                  ]}
                >
                  <ThemedText style={styles.badgeText}>
                    {item.status}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <MapPin size={20} color="#64748b" />
                <ThemedText style={styles.detailValue}>
                  {parameters.location} → {parameters.destination}
                </ThemedText>
              </View>

              <View style={styles.detailRow}>
                <DollarSign size={20} color="#64748b" />
                <ThemedText style={styles.priceValue}>
                  ${parameters.price.toFixed(2)}
                </ThemedText>
              </View>

              <View style={styles.detailRow}>
                <Package size={20} color="#64748b" />
                <ThemedText style={styles.detailValue}>
                  {parameters.quantity}
                </ThemedText>
              </View>
            </View>
          </View>

          {parameters.description && (
            <View style={styles.descriptionCard}>
              <ThemedText style={styles.sectionTitle}>Description</ThemedText>
              <ThemedText style={styles.description}>
                {parameters.description}
              </ThemedText>
            </View>
          )}

          {/* Add "View Request" button for requests not owned by the current user */}
          {!isOwnRequest(item.userId) && (
            <TouchableOpacity
              style={styles.viewRequestButton}
              onPress={() =>
                router.push({
                  pathname: "/processTrack/initializationSP",
                  params: parameters,
                })
              }
            >
              <ThemedText style={styles.viewRequestButtonText}>
                View Request
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const fetchGoodsProcesses = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/process");
      console.log("Current user ID:", user?.id);
      // Set goodsProcesses to an empty array if no data is returned
      setGoodsProcesses(response.data.data || []);
    } catch (error: any) {
      console.error("Error details:", error);
      // Optionally set to empty array on error too, depending on your needs
      setGoodsProcesses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderOrderItem = ({ item }: { item: GoodsProcess }) => {
    // Helper function to get the correct image URL
    const getImageUrl = (goods: Goods) => {
      // If no image data at all, return null
      if (!goods) return null;

      // If goodsUrl has the full path
      if (goods.goodsUrl?.startsWith("/api/uploads/")) {
        return `${BACKEND_URL}${goods.goodsUrl}`;
      }

      // If goodsUrl is just the filename
      if (goods.goodsUrl) {
        return `${BACKEND_URL}/api/uploads/${goods.goodsUrl}`;
      }

      // If we have imageId but no direct access to filename
      if (goods.imageId) {
        // Use the imageId to construct the URL
        return `${BACKEND_URL}/api/uploads/${goods.imageId}`;
      }

      return null;
    };

    const parameters = {
      idProcess: item?.id?.toString(),
      idOrder: item?.orderId?.toString(),
      idRequest: item?.order?.requestId?.toString(),
      idGood: item?.order?.request?.goodsId?.toString(),
      imageUrl: getImageUrl(item.order.request.goods),
      goodsName: item?.order?.request?.goods?.name || "Unknown",
      price: item?.order?.request?.goods?.price || 0,
      location: item?.order?.request?.goodsLocation || "Unknown",
      destination: item?.order?.request?.goodsDestination || "Unknown",
      quantity: item?.order?.request?.quantity.toString() || "0",
      description: item?.order?.request?.goods?.description || "",
      withBox: item?.order?.request?.withBox?.toString() || "false",
      requesterId: item?.order?.request?.userId.toString(),
      requesterName: item?.order?.request?.user?.name || "Anonymous",
      requesterRating:
        item?.order?.request?.user?.reputation?.score?.toString() || "0",
      requesterLevel:
        item?.order?.request?.user?.reputation?.level?.toString() || "1",
      requesterTotalRatings:
        item?.order?.request?.user?.reputation?.totalRatings?.toString() || "0",
      requesterVerified:
        item?.order?.request?.user?.profile?.isVerified?.toString() || "false",
      totalOrders:
        item?.order?.request?.user?.requests?.length?.toString() || "0",
      travelerId: item.order?.travelerId?.toString(),
      travelerName: item.order?.traveler?.name || "Anonymous",
      travelerRating:
        item.order?.traveler?.reputation?.score?.toString() || "0",
      travelerLevel: item.order?.traveler?.reputation?.level?.toString() || "1",
      travelerTotalRatings:
        item.order?.traveler?.reputation?.totalRatings?.toString() || "0",
      travelerVerified:
        item.order?.traveler?.profile?.isVerified?.toString() || "false",
      status: item?.status,
      category: item?.order?.request?.goods?.category?.name || "Uncategorized",
    };

    // Check if this request has an associated order
    const hasOrder = item.order !== null && item.order !== undefined;
    const processStatus = hasOrder && item.status ? item.status : undefined;

    const handleNavigation = () => {
      if (isOwnRequest(parseInt(parameters.requesterId)) && hasOrder) {
        switch (parameters.status) {
          case "PREINITIALIZED":
            return router.push({
              pathname: "/processTrack/initializationSO",
              params: parameters,
            });
          case "INITIALIZED":
            return router.push({
              pathname: "/processTrack/verificationSO",
              params: parameters,
            });
          case "CONFIRMED":
            return router.push({
              pathname: "/processTrack/paymentSO",
              params: parameters,
            });
          case "PAID":
            return router.push({
              pathname: "/processTrack/pickupSO",
              params: parameters,
            });
          case "IN_TRANSIT":
            return router.push({
              pathname: "/home", // TO BE CHANGED
              params: parameters,
            });
          case "PICKUP_MEET":
            return router.push({
              pathname: "/home", // TO BE CHANGED
              params: parameters,
            });
          case "FINALIZED":
            return router.push({
              pathname: "/home", // TO BE CHANGED
              params: parameters,
            });
          case "CANCELLED":
            return router.push({
              pathname: "/home", // TO BE CHANGED
              params: parameters,
            });
          default:
            return parameters.status;
        }
      } else if (!isOwnRequest(parseInt(parameters.requesterId)) && hasOrder) {
        switch (parameters.status) {
          case "PREINITIALIZED":
            return router.push({
              pathname: "/processTrack/initializationSP",
              params: parameters,
            });
          case "INITIALIZED":
            return router.push({
              pathname: "/processTrack/verificationSP",
              params: parameters,
            });
          case "CONFIRMED":
            return router.push({
              pathname: "/processTrack/paymentSP",
              params: parameters,
            });
          case "PAID":
            return router.push({
              pathname: "/processTrack/pickupSP",
              params: parameters,
            });
          case "IN_TRANSIT":
            return router.push({
              pathname: "/home", // TO BE CHANGED
              params: parameters,
            });
          case "PICKUP_MEET":
            return router.push({
              pathname: "/home", // TO BE CHANGED
              params: parameters,
            });
          case "FINALIZED":
            return router.push({
              pathname: "/home", // TO BE CHANGED
              params: parameters,
            });
          case "CANCELLED":
            return router.push({
              pathname: "/home", // TO BE CHANGED
              params: parameters,
            });
          default:
            return parameters.status;
        }
      }
    };

    return (
      <View style={styles.card}>
        <View style={styles.imageSection}>
          {parameters.imageUrl ? (
            <Image
              source={{ uri: parameters.imageUrl }}
              style={styles.productImage}
              contentFit="cover"
              onError={(error) => {
                console.error("Image error:", error, {
                  url: parameters.imageUrl,
                  goods: parameters.goodsName,
                });
              }}
            />
          ) : (
            <View style={styles.noImageContainer}>
              <ThemedText style={styles.noImageText}>
                No Image Available
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <ThemedText style={styles.productTitle}>
                {parameters.goodsName}
              </ThemedText>

              <View style={styles.badgeContainer}>
                {/* Show "Your Request" badge if it's the user's own request */}
                {isOwnRequest(parseInt(parameters.requesterId)) && (
                  <View style={styles.ownRequestBadge}>
                    <ThemedText style={styles.badgeText}>
                      Your Request
                    </ThemedText>
                  </View>
                )}

                {/* Show status badge if it has an order */}
                {hasOrder && (
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getProcessStatusColor(
                          processStatus as ProcessStatus
                        ),
                      },
                    ]}
                  >
                    <ThemedText style={styles.badgeText}>
                      {getProcessStatusText(processStatus as ProcessStatus)}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <MapPin size={20} color="#64748b" />
                </View>
                <View style={styles.detailContent}>
                  <ThemedText style={styles.detailLabel}>Route</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {parameters.location} → {parameters.destination}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <DollarSign size={20} color="#64748b" />
                </View>
                <View style={styles.detailContent}>
                  <ThemedText style={styles.detailLabel}>Price</ThemedText>
                  <ThemedText style={styles.priceValue}>
                    ${parameters.price.toFixed(2)}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <Package size={20} color="#64748b" />
                </View>
                <View style={styles.detailContent}>
                  <ThemedText style={styles.detailLabel}>Quantity</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {parameters.quantity}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <Activity size={20} color="#64748b" />
                </View>
                <View style={styles.detailContent}>
                  <ThemedText style={styles.detailLabel}>Status</ThemedText>
                  <View
                    style={[
                      styles.statusBadge,
                      styles[
                        parameters.status.toLowerCase() as Lowercase<RequestStatus>
                      ],
                    ]}
                  >
                    <ThemedText style={styles.statusText}>
                      {parameters.status}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {parameters.description && (
            <View style={styles.descriptionCard}>
              <ThemedText style={styles.sectionTitle}>Description</ThemedText>
              <ThemedText style={styles.description}>
                {parameters.description}
              </ThemedText>
            </View>
          )}

          <View style={styles.actionRow}>
            <ThemedText style={styles.priceText}>
              ${parameters.price} × {parameters.quantity}
            </ThemedText>

            {!isOwnRequest(parseInt(parameters.requesterId)) && hasOrder && (
              <View style={styles.takenContainer}>
                <ThemedText style={styles.takenText}>Already Taken</ThemedText>
              </View>
            )}

            {/* Show View Order button for any order for SO */}
            {isOwnRequest(parseInt(parameters.requesterId)) && hasOrder && (
              <TouchableOpacity
                style={styles.viewOrderButton}
                onPress={handleNavigation}
              >
                <ThemedText style={styles.viewOrderButtonText}>
                  View Order
                </ThemedText>
              </TouchableOpacity>
            )}

            {/* Show View Order button for any order for SO */}
            {!isOwnRequest(parseInt(parameters.requesterId)) && hasOrder && (
              <TouchableOpacity
                style={styles.viewOrderButton}
                onPress={handleNavigation}
              >
                <ThemedText style={styles.viewOrderButtonText}>
                  View Order
                </ThemedText>
              </TouchableOpacity>
            )}

            {/* {isOwnRequest(parseInt(parameters.requesterId)) && !item.order && (
              <TouchableOpacity
                style={styles.viewOfferButton}
                onPress={() => fetchOffersForRequest(item.id)}
              >
                <ThemedText style={styles.viewOfferButtonText}>
                  Check for Offers
                </ThemedText>
              </TouchableOpacity>
            )} */}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SegmentedControl
        values={["Requests", "Orders"]}
        selectedIndex={view === "requests" ? 0 : 1}
        onChange={(index) => setView(index === 0 ? "requests" : "orders")}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : view === "orders" ? (
        goodsProcesses.length === 0 ? (
          <View style={styles.noOrdersContainer}>
            <ThemedText style={styles.noOrdersText}>
              No orders yet...
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={goodsProcesses}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id.toString()}
            refreshing={isLoading}
            onRefresh={fetchGoodsProcesses}
            contentContainerStyle={styles.listContainer}
          />
        )
      ) : requests.length === 0 ? (
        <View style={styles.noOrdersContainer}>
          <ThemedText style={styles.noOrdersText}>
            No requests yet...
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id.toString()}
          refreshing={isLoading}
          onRefresh={fetchRequests}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageSection: {
    width: "100%",
    height: 200,
    backgroundColor: "#f8fafc",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  noImageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  content: {
    padding: 16,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1e293b",
  },
  detailsCard: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconContainer: {
    width: 24,
    alignItems: "center",
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16a34a",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pending: {
    backgroundColor: "#f59e0b",
  },
  accepted: {
    backgroundColor: "#3b82f6",
  },
  cancelled: {
    backgroundColor: "#ef4444",
  },
  rejected: {
    backgroundColor: "#ef4444",
  },
  statusText: {
    color: "orange",
    fontSize: 12,
    fontWeight: "500",
  },
  descriptionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#334155",
    lineHeight: 24,
  },
  offerButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  offerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  noImageText: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
  },
  ownRequestBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  ownRequestText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  takenContainer: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  takenText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
  },
  headerContent: {
    // Add any necessary styles for the header content
  },
  titleRow: {
    // Add any necessary styles for the title row
  },
  badgeContainer: {
    // Add any necessary styles for the badge container
  },
  badgeText: {
    // Add any necessary styles for the badge text
  },
  actionRow: {
    // Add any necessary styles for the action row
  },
  priceText: {
    // Add any necessary styles for the price text
  },
  viewOrderButton: {
    backgroundColor: "#3b82f6", // blue
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  viewOrderButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  viewOfferButton: {
    backgroundColor: "#3b82f6", // blue
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  viewOfferButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#8b5cf6", // purple
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noOrdersText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#64748b", // A muted color for better UX
  },
  toggleMenu: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  toggleButtonActive: {
    backgroundColor: "#3b82f6",
  },
  toggleButtonText: {
    color: "#1e293b",
  },
  toggleButtonTextActive: {
    color: "white",
  },
  viewRequestButton: {
    backgroundColor: "#3b82f6", // blue
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  viewRequestButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
