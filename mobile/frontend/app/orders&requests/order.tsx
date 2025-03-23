import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import SegmentedControl from "@/components/SegmentedControl";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import axiosInstance from "@/config";
import { useAuth } from "@/hooks/useAuth";
import { Request, RequestStatus, Goods } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { MapPin, DollarSign, Package, Activity, ArrowRight } from "lucide-react-native";
import { BACKEND_URL } from "@/config";
import { useRouter } from "expo-router";
import { decode as atob } from "base-64";
import { GoodsProcess, ProcessStatus, ProcessStatusEnum } from "@/types/GoodsProcess";
import { LinearGradient } from 'expo-linear-gradient';
import { getSocket } from "@/services/Socketservice";
import { Socket } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/index";
import { useProcess } from "@/context/ProcessContext";
import { TabBar } from "@/components/navigation/TabBar";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { store } from "@/store"; // Make sure the path is correct
import { requestCreated } from '@/store/processSlice';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_SPACING = 12;

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
  console.log('🔍 Order page render - Redux processes:', useSelector((state: RootState) => state.process.processes.length));
  
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<"orders" | "requests">("orders");
  const [goodsProcesses, setGoodsProcesses] = useState<GoodsProcess[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const { user, loading: authLoading } = useReliableAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Order");
  const { socketConnected, joinProcessRoom, fetchProcesses } = useProcess();
  const dispatch = useDispatch();
  const { processes } = useSelector((state: RootState) => state.process);
  const reduxRequests = useSelector((state: RootState) => state.process.requests || []);

  // Animation value for the "Make Offer" button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Create pulse animation effect
  useEffect(() => {
    const pulsate = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]);
    
    Animated.loop(pulsate).start();
    
    return () => {
      pulseAnim.stopAnimation();
    };
  }, []);

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
      case ProcessStatusEnum.PREINITIALIZED:
        return "#3b82f6"; // blue
      case ProcessStatusEnum.INITIALIZED:
        return "#3b82f6"; // blue
      case ProcessStatusEnum.CONFIRMED:
        return "#8b5cf6"; // purple
      case ProcessStatusEnum.PAID:
        return "#10b981"; // green
      case ProcessStatusEnum.IN_TRANSIT:
        return "#f97316"; // orange
      case ProcessStatusEnum.PICKUP_MEET:
        return "#eab308"; // yellow
      case ProcessStatusEnum.FINALIZED:
        return "#14b8a6"; // teal
      case ProcessStatusEnum.CANCELLED:
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  const getProcessStatusText = (status: ProcessStatus): string => {
    switch (status) {
      case ProcessStatusEnum.PREINITIALIZED:
        return "Pre-Initialized";
      case ProcessStatusEnum.INITIALIZED:
        return "Initialized";
      case ProcessStatusEnum.CONFIRMED:
        return "Confirmed";
      case ProcessStatusEnum.PAID:
        return "Paid";
      case ProcessStatusEnum.IN_TRANSIT:
        return "In Transit";
      case ProcessStatusEnum.PICKUP_MEET:
        return "Ready for Pickup";
      case ProcessStatusEnum.FINALIZED:
        return "Completed";
      case ProcessStatusEnum.CANCELLED:
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

  // Get processes from Redux state
  const processState = useSelector((state: RootState) => state.process);
  
  // Sync Redux processes to local state whenever Redux state changes
  useEffect(() => {
    console.log(`📋 Syncing ${processState.processes.length} processes from Redux to local state`);
    setGoodsProcesses(processState.processes);
  }, [processState.processes]);

  // Fetch requests and processes when component mounts or user changes
  useEffect(() => {
    if (!authLoading) {
      console.log("User loaded, fetching orders...", user);
      
      // Use the context function instead of local function
      fetchProcesses();
      fetchRequests();
    }
  }, [user, authLoading, fetchProcesses]);

  // FIXED: Use the socket from ProcessContext rather than creating a new one
  useEffect(() => {
    // Get notification when processes are loaded or changed
    if (processes.length > 0) {
      console.log(`📋 Processes loaded: ${processes.length} active processes`);
    }
  }, [processes]);

  // FIXED: Socket event listener setup - use ProcessContext socket
  useEffect(() => {
    // Only proceed if socket is connected
    if (!socketConnected || !user?.id) {
      return;
    }
    
    console.log('🔌 Process socket is connected, component can rely on socket events');
    
    // Join process rooms for all current processes
    const joinAllProcessRooms = async () => {
      console.log(`🔄 Joining rooms for ${processes.length} processes`);
      
      // Join each process room to receive updates
      for (const process of processes) {
        try {
          console.log(`🔄 Joining room for process ID: ${process.id}`);
          await joinProcessRoom(process.id);
        } catch (error) {
          console.error(`❌ Error joining process room ${process.id}:`, error);
        }
      }
    };
    
    joinAllProcessRooms();
  }, [socketConnected, user?.id, processes, joinProcessRoom]);

  // Modify fetchGoodsProcesses to use fetchProcesses from context
  const fetchGoodsProcesses = async () => {
    try {
      setIsLoading(true);
      // Use the fetchProcesses from context to update Redux state
      await fetchProcesses();
      // Local state will be updated by the useEffect that watches processState.processes
    } catch (error: any) {
      console.error("Error details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      // First check if we already have requests in Redux
      if (reduxRequests.length > 0) {
        setRequests(reduxRequests);
      } else {
        // Fall back to API fetch if needed
        const response = await axiosInstance.get("/api/requests");
        
        // Filter the requests to only show those that are in "PENDING" status
        // AND either don't have an associated order OR have a cancelled order
        const filteredRequests = (response.data.data || []).filter((request: Request) => {
          // Check if the request is in PENDING status
          const isPending = request.status === "PENDING";
          
          // Check if the request has no order or a cancelled order
          const hasNoActiveOrder = !request.order || request.order.orderStatus === "CANCELLED";
          
          // Only include requests that meet both conditions
          return isPending && hasNoActiveOrder;
        });
        
        console.log(`Filtered from ${response.data.data?.length || 0} to ${filteredRequests.length} requests`);
        
        setRequests(filteredRequests);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Or add an effect to sync Redux requests to local state
  useEffect(() => {
    // If we have requests in Redux, use those
    if (reduxRequests.length > 0) {
      console.log(`📋 Syncing ${reduxRequests.length} requests from Redux to local state`);
      setRequests(reduxRequests);
    }
  }, [reduxRequests]);

  const renderRequestItem = ({ item }: { item: Request }) => {
    console.log(`🔍 Rendering request item ID: ${item.id}, Redux requests count: ${reduxRequests.length}`);
    
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
    
    // Check if this request has any offers
    const hasOffers = false; // You'll need to replace this with actual logic to check if offers exist

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => !isOwnRequest(item.userId) && router.push({
          pathname: "/processTrack/initializationSP",
          params: parameters,
        })}
      >
        <View style={styles.card}>
          <Image
            source={{ uri: parameters.imageUrl || 'https://via.placeholder.com/400x200' }}
            style={styles.productImage}
            contentFit="cover"
          />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />

          <View style={styles.cardContent}>
            {isOwnRequest(item.userId) && (
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>Your Request</ThemedText>
                </View>
              </View>
            )}
            
            <View style={styles.headerRow}>
              <ThemedText style={styles.title} numberOfLines={1} ellipsizeMode="tail">{parameters.goodsName}</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: getRequestStatusColor(item.status) }]}>
                <ThemedText style={styles.statusText}>{getRequestStatusText(item.status)}</ThemedText>
              </View>
            </View>

            <View style={styles.locationContainer}>
              <View style={styles.fromSection}>
                <ThemedText style={styles.fromToLabel}>From:</ThemedText>
                <ThemedText style={styles.cityText}>{parameters.location}</ThemedText>
              </View>
              
              <View style={styles.routeArrow}>
                <ArrowRight size={22} color="#fff" />
              </View>
              
              <View style={styles.toSection}>
                <ThemedText style={styles.fromToLabel}>To:</ThemedText>
                <ThemedText style={styles.cityText}>{parameters.destination}</ThemedText>
              </View>
            </View>
            
            <View style={styles.priceRow}>
              <ThemedText style={styles.price}>${parameters.price.toFixed(2)}</ThemedText>
              <View style={styles.quantityContainer}>
                <Package size={16} color="#fff" />
                <ThemedText style={styles.quantityText}>{parameters.quantity}x</ThemedText>
              </View>
              <ArrowRight size={20} color="#fff" />
            </View>
            
            {!isOwnRequest(item.userId) && (
              <Animated.View style={[
                styles.makeOfferBtnContainer,
                { transform: [{ scale: pulseAnim }] }
              ]}>
                <TouchableOpacity
                  style={styles.makeOfferBtn}
                  onPress={() => router.push({
                    pathname: "/processTrack/initializationSP",
                    params: parameters,
                  })}
                >
                  <ThemedText style={styles.makeOfferBtnText}>Make Offer</ThemedText>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
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
      // ADDED: Join the process room when navigating to a process screen
      joinProcessRoom(item.id);
      
      if (isOwnRequest(parseInt(parameters.requesterId)) && hasOrder) {
        switch (parameters.status) {
          case ProcessStatusEnum.PREINITIALIZED:
            return router.push({
              pathname: "/processTrack/initializationSO",
              params: parameters,
            });
          case ProcessStatusEnum.INITIALIZED:
            return router.push({
              pathname: "/processTrack/verificationSO",
              params: parameters,
            });
          case ProcessStatusEnum.CONFIRMED:
            return router.push({
              pathname: "/processTrack/paymentSO",
              params: parameters,
            });
          case ProcessStatusEnum.PAID:
            return router.push({
              pathname: "/processTrack/pickupSO",
              params: parameters,
            });
          case ProcessStatusEnum.IN_TRANSIT:
            return router.push({
              pathname: "/home", // TO BE CHANGED
              params: parameters,
            });
          case ProcessStatusEnum.PICKUP_MEET:
            return router.push({
              pathname: "/home", // TO BE CHANGED
              params: parameters,
            });
          case ProcessStatusEnum.FINALIZED:
            return router.push({
              pathname: "/home", // TO BE CHANGED
              params: parameters,
            });
          case ProcessStatusEnum.CANCELLED:
            return router.push({
              pathname: "/home", // TO BE CHANGED
              params: parameters,
            });
          default:
            return parameters.status;
        }
      } else if (!isOwnRequest(parseInt(parameters.requesterId)) && hasOrder) {
        switch (parameters.status) {
          case ProcessStatusEnum.PREINITIALIZED:
            return router.push({
              pathname: "/processTrack/initializationSP",
              params: parameters,
            });
          case ProcessStatusEnum.INITIALIZED:
            return router.push({
              pathname: "/processTrack/verificationSP",
              params: parameters,
            });
          case ProcessStatusEnum.CONFIRMED:
            return router.push({
              pathname: "/processTrack/paymentSP",
              params: parameters,
            });
          case ProcessStatusEnum.PAID:
            return router.push({
              pathname: "/processTrack/pickupSP",
              params: parameters,
            });
          case ProcessStatusEnum.IN_TRANSIT:
            return router.push({
              pathname: "/home", // TO BE CHANGED
              params: parameters,
            });
          case ProcessStatusEnum.PICKUP_MEET:
            return router.push({
              pathname: "/home", // TO BE CHANGED
              params: parameters,
            });
          case ProcessStatusEnum.FINALIZED:
            return router.push({
              pathname: "/home", // TO BE CHANGED
              params: parameters,
            });
          case ProcessStatusEnum.CANCELLED:
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
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={handleNavigation}
      >
        <View style={styles.card}>
          <Image
            source={{ uri: parameters.imageUrl || 'https://via.placeholder.com/400x200' }}
            style={styles.productImage}
            contentFit="cover"
          />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />

          <View style={styles.cardContent}>
            <View style={styles.headerRow}>
              <ThemedText style={styles.title} numberOfLines={1} ellipsizeMode="tail">{parameters.goodsName}</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: getProcessStatusColor(processStatus as ProcessStatus) }]}>
                <ThemedText style={styles.statusText}>{getProcessStatusText(processStatus as ProcessStatus)}</ThemedText>
              </View>
            </View>

            <View style={styles.badgeRow}>
              {isOwnRequest(parseInt(parameters.requesterId)) && (
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>Your Order</ThemedText>
                </View>
              )}
            </View>

            <View style={styles.locationContainer}>
              <View style={styles.fromSection}>
                <ThemedText style={styles.fromToLabel}>From:</ThemedText>
                <ThemedText style={styles.cityText}>{parameters.location}</ThemedText>
              </View>
              
              <View style={styles.routeArrow}>
                <ArrowRight size={22} color="#fff" />
              </View>
              
              <View style={styles.toSection}>
                <ThemedText style={styles.fromToLabel}>To:</ThemedText>
                <ThemedText style={styles.cityText}>{parameters.destination}</ThemedText>
              </View>
            </View>

            <View style={styles.priceRow}>
              <ThemedText style={styles.price}>${parameters.price.toFixed(2)}</ThemedText>
              <View style={styles.quantityContainer}>
                <Package size={16} color="#fff" />
                <ThemedText style={styles.quantityText}>{parameters.quantity}x</ThemedText>
              </View>
              <ArrowRight size={20} color="#fff" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Add this function to handle tab press
  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleNotificationPress = () => {
    router.push("./notifications");
  };
  
  const handleProfilePress = () => {
    router.push("/profile");
  };

  // Add a logging effect to track Redux state changes
  useEffect(() => {
    console.log('🟣 order.tsx: Process Redux state updated:', {
      processCount: processState.processes.length,
      currentProcess: processState.currentProcess?.id,
      socketConnected: processState.socketConnected
    });
  }, [processState]);

  // Near the beginning of your component render (before the return)
  console.log('🟠 order.tsx rendering with:', {
    viewMode: view,
    localGoodsProcessesCount: goodsProcesses.length,
    reduxProcessesCount: processState.processes.length,
    socketConnectedFromStore: processState.socketConnected,
    isLoadingState: isLoading
  });

  return (
    <ThemedView style={styles.container}>
      <TopNavigation 
        title="Orders & Requests" 
        onNotificationPress={handleNotificationPress}
        onProfilePress={handleProfilePress}
      />
      
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
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No orders yet</ThemedText>
          </View>
        ) : (
          <FlatList
            data={goodsProcesses}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.verticalListContainer}
            refreshing={isLoading}
            onRefresh={fetchGoodsProcesses}
          />
        )
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No requests yet</ThemedText>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.verticalListContainer}
          refreshing={isLoading}
          onRefresh={fetchRequests}
        />
      )}
      
      {/* Add TabBar at the bottom of the screen */}
      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingRight: width - CARD_WIDTH + 16,
  },
  verticalListContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  cardContainer: {
    width: '100%',
    marginBottom: 16,
  },
  card: {
    height: 400,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 4,
  },
  
  fromSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  toSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  
  fromToLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },
  
  cityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  
  routeArrow: {
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quantityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: '500',
  },
  makeOfferBtnContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  makeOfferBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  makeOfferBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
