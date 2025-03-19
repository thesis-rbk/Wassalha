import Card from "@/components/cards/ProcessCard";
import ProgressBar from "@/components/ProgressBar";
import axiosInstance from "@/config";
import { useLocalSearchParams } from "expo-router";
import { CheckCircle, Bell, Clock, AlertCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Image,
  Switch,
  TouchableOpacity,
} from "react-native";
import { TimelineEvent } from "../../types/TimelineEvent";

const PaymentScreen = () => {
  const params = useLocalSearchParams();
  const orderId = parseInt(params.idOrder.toString());
  const requesterName = params.requesterName;
  const [timelineData, setTimelineData] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const progressSteps = [
    {
      id: 1,
      title: "Initialization",
      icon: "initialization",
      status: "completed",
    },
    { id: 2, title: "Verification", icon: "verification", status: "completed" },
    { id: 3, title: "Payment", icon: "payment", status: "pending" },
    { id: 4, title: "Pickup", icon: "pickup", status: "pending" },
  ];

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const response = await axiosInstance.get(`api/process/${orderId}`);
        if (response.data.success) {
          setTimelineData(response.data.data.events);
          console.log("Timeline Data:!!!!!!!!!!", response.data.data.events);
        }
      } catch (error) {
        console.error("Error fetching timeline data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, [orderId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(); // Adjust the format as needed
  };

  let dateEvents: string[] = [];
  timelineData.map((event, index) =>
    dateEvents.push(formatDate(event.createdAt))
  );

  const getInitials = (name: string) => {
    if (!name) return "??";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
            The requester{" "}
            <Text style={{ fontFamily: "Inter-SemiBold" }}>
              {getInitials(requesterName.toString())}
            </Text>{" "}
            needs to complete the payment process. We'll notify you immediately
            when the payment is confirmed.
          </Text>

          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.completedDot]} />
              <Text style={styles.timelineText}>
                Offer initialized: {dateEvents[1]}
              </Text>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.completedDot]} />
              <Text style={styles.timelineText}>
                Verification completed: {dateEvents[0]}
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
                Our system will automatically verify the payment within 1 hour
                of receipt
              </Text>
            </View>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Notification Updates</Text>
              <Text style={styles.stepDescription}>
                You'll receive push notifications and email updates about
                Payment confirmation status
              </Text>
            </View>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Pickup Scheduling</Text>
              <Text style={styles.stepDescription}>
                Once confirmed, you'll be directed to the next step to choose
                where you want to deliver the item
              </Text>
            </View>
          </View>

          {/* We will see if there will be a button to contact us or not */}
          {/* <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>
              Need Help? Chat with Support
            </Text>
          </TouchableOpacity> */}
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
