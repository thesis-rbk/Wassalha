import Card from "@/components/cards/ProcessCard";
import ProgressBar from "@/components/ProgressBar";
import { CheckCircle, Bell, Clock, AlertCircle } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Image,
  Switch,
  TouchableOpacity,
  RefreshControl
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axiosInstance from "@/config";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as atob } from "base-64";
import { useIsFocused } from "@react-navigation/native";
import { useNotification } from '@/context/NotificationContext';
import { io } from "socket.io-client";
import { BACKEND_URL } from "@/config";

const PaymentScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processData, setProcessData] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const params = useLocalSearchParams();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { sendNotification } = useNotification();
    const socket = io(`${BACKEND_URL}/processTrack`);
  
  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization" },
    { id: 2, title: "Verification", icon: "verification" },
    { id: 3, title: "Payment", icon: "payment" },
    { id: 4, title: "Pickup", icon: "pickup" },
  ];

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
          return;
        }

        const token = await AsyncStorage.getItem("jwtToken");
        if (token) {
          const tokenParts = token.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            if (payload.id) {
              setUser({
                id: payload.id,
                email: payload.email,
                name: payload.name,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  // Fetch process data
  const fetchProcessData = async () => {
    try {
      setLoading(true);
      const processId = params.idProcess;
      const orderId = params.idOrder;
      
      if (!processId && !orderId) {
        console.error("No process ID or order ID provided");
        show({
          type: 'error',
          title: 'Missing Information',
          message: 'Process or order information is missing.',
          primaryAction: {
            label: 'Go Back',
            onPress: () => {
              hide();
              router.back();
            }
          }
        });
        return;
      }
      
      let response;
      if (processId) {
        response = await axiosInstance.get(`/api/process/${processId}`);
      } else {
        response = await axiosInstance.get(`/api/process/order/${orderId}`);
      }
      
      setProcessData(response.data.data);
      
      // Also fetch order details
      if (response.data.data?.orderId) {
        const orderResponse = await axiosInstance.get(`/api/orders/${response.data.data.orderId}`);
        setOrderData(orderResponse.data.data);
      }
      
    } catch (error) {
      console.error("Error fetching process data:", error);
      show({
        type: 'error',
        title: 'Loading Error',
        message: 'Failed to load payment information. Please try again.',
        primaryAction: {
          label: 'Retry',
          onPress: () => {
            hide();
            fetchProcessData();
          }
        },
        secondaryAction: {
          label: 'Go Back',
          onPress: () => {
            hide();
            router.back();
          }
        }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on component mount and when focused
  useEffect(() => {
    if (isFocused) {
      fetchProcessData();
    }
  }, [isFocused, params.idProcess, params.idOrder]);

  // Add notification subscription when payment status changes
  useEffect(() => {
    if (processData?.status === 'PAYMENT_COMPLETED') {
      sendNotification('payment_completed', {
        type: 'payment_completed',
        title: 'Payment Confirmed',
        message: `Payment has been confirmed for order #${orderData?.orderNumber}`,
        data: {
          processId: processData.id,
          orderId: orderData?.id,
          amount: orderData?.totalAmount,
          travelerId: user?.id,
          requesterId: orderData?.request?.userId
        }
        
      });
    } else if (processData?.status === 'PAYMENT_FAILED') {
      sendNotification('payment_failed', {
        type: 'payment_failed',
        title: 'Payment Failed',
        message: `Payment failed for order #${orderData?.orderNumber}`,
        data: {
          processId: processData.id,
          orderId: orderData?.id,
          travelerId: user?.id,
          requesterId: orderData?.request?.userId
        }
        
      });
    }
  }, [processData?.status]);

  // Add notification toggle handler
  const toggleNotifications = async () => {
    try {
      setNotificationsEnabled(!notificationsEnabled);
      await AsyncStorage.setItem('notificationsEnabled', String(!notificationsEnabled));
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  // Load notification preferences
  useEffect(() => {
    const loadNotificationPreferences = async () => {
      try {
        const enabled = await AsyncStorage.getItem('notificationsEnabled');
        if (enabled !== null) {
          setNotificationsEnabled(enabled === 'true');
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      }
    };

    loadNotificationPreferences();
    socket.on("connect", () => {
      console.log("🔌 Orders page socket connected");
      const room = params.idProcess; // Example; get this from props, context, or params
      socket.emit("joinProcessRoom", room);
      console.log("🔌 Ophoto socket connected, ",room);
   
    })
    socket.on("confirmProduct", (data) => {
      // alert("hi");
      console.log("🔄 photo updated to:", data);
      router.push({
                pathname: "/processTrack/pickupSP",
                params: params,
              });
    });
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProcessData();
  };

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, h:mm a');
    } catch (e) {
      return "Date unknown";
    }
  };

  // Function to get user name
  const getRequesterName = () => {
    if (orderData?.request?.user?.name) {
      return orderData.request.user.name;
    }
    return params.requesterName || "the requester";
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Order Processing</Text>
        <Text style={styles.subtitle}>
          We're waiting for requester's payment confirmation
        </Text>

        <ProgressBar currentStep={3} steps={progressSteps} />

        {/* Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Clock size={20} color="#eab308" />
            <Text style={styles.statusTitle}>
              Awaiting Payment Confirmation
            </Text>
          </View>

          <Text style={styles.statusText}>
            <Text style={{ fontFamily: "Inter-SemiBold" }}>{getRequesterName()}</Text>{" "}
            needs to complete the payment for this order. You'll be notified immediately when the payment is confirmed.
          </Text>

          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.completedDot]} />
              <Text style={styles.timelineText}>
                Order initialized {processData?.createdAt && `(${formatDate(processData.createdAt)})`}
              </Text>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.completedDot]} />
              <Text style={styles.timelineText}>
                Verification completed {processData?.events?.find((e: any) => e.toStatus === 'CONFIRMED')?.createdAt && 
                  `(${formatDate(processData.events.find((e: any) => e.toStatus === 'CONFIRMED').createdAt)})`}
              </Text>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.pendingDot]} />
              <Text style={styles.timelineText}>
                Payment confirmation pending
              </Text>
            </View>
          </View>
        </Card>

        {/* Add this Notification Card */}
        <Card style={styles.notificationCard}>
          <View style={styles.notificationHeader}>
            <Bell size={20} color="#1e40af" />
            <Text style={styles.notificationTitle}>Notification Settings</Text>
          </View>
          <View style={styles.notificationRow}>
            <Text style={styles.notificationText}>Payment Updates</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: "#e2e8f0", true: "#93c5fd" }}
              thumbColor={notificationsEnabled ? "#2563eb" : "#94a3b8"}
            />
          </View>
          <Text style={styles.notificationHint}>
            You'll receive notifications for:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Payment confirmation</Text>
            <Text style={styles.bulletItem}>• Payment failures</Text>
            <Text style={styles.bulletItem}>• Process status updates</Text>
          </View>
        </Card>

        {/* Next Steps */}
        <Card style={styles.nextStepsCard}>
          <View style={styles.stepsHeader}>
            <AlertCircle size={20} color="#16a34a" />
            <Text style={styles.stepsTitle}>What Happens Next?</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Payment Verification</Text>
              <Text style={styles.stepDescription}>
                Our system will automatically verify the payment when it's processed
              </Text>
            </View>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Notification Updates</Text>
              <Text style={styles.stepDescription}>
                You'll receive notifications about payment confirmation status
              </Text>
            </View>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Pickup Scheduling</Text>
              <Text style={styles.stepDescription}>
                Once payment is confirmed, you'll be directed to the next step to arrange pickup
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

// Add these new styles to your existing StyleSheet
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
  notificationCard: {
    marginTop: 16,
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  notificationTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#1e40af",
    marginLeft: 8,
  },
  notificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  notificationText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#1e3a8a",
  },
  notificationHint: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#475569",
    marginTop: 8,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 8,
  },
  bulletItem: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#475569",
    marginBottom: 4,
  },
  nextStepsCard: {
    marginTop: 16,
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  stepsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stepsTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#166534",
    marginLeft: 8,
  },
  step: {
    flexDirection: "row",
    marginBottom: 20,
  },
  stepNumber: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#fff",
    backgroundColor: "#16a34a",
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 24,
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: "#166534",
    marginBottom: 4,
  },
  stepDescription: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },
  helpButton: {
    marginTop: 16,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  helpButtonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: "#fff",
  },
});

export default PaymentScreen;
