import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { MapPin, Clock, DollarSign, User } from "lucide-react-native";
import ProgressBar from "../../components/ProgressBar";
import Card from "../../components/cards/ProcessCard";

export default function OrderDetailsScreen() {
  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization" },
    { id: 2, title: "Verification", icon: "verification" },
    { id: 3, title: "Payment", icon: "payment" },
    { id: 4, title: "Pickup", icon: "pickup" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
        }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.title}>MacBook Pro Laptop</Text>

        <ProgressBar currentStep={1} steps={progressSteps} />

        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>

          <View style={styles.detailRow}>
            <MapPin size={20} color="#64748b" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Route</Text>
              <Text style={styles.detailValue}>New York → Tunis</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Clock size={20} color="#64748b" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Posted On</Text>
              <Text style={styles.detailValue}>
                {new Date("2025-05-10T10:30:00Z").toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <DollarSign size={20} color="#64748b" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Offered Price</Text>
              <Text style={styles.priceValue}>$150</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <User size={20} color="#64748b" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={[styles.statusBadge, getStatusStyle("pending")]}>
                <Text style={styles.statusText}>{formatStatus("pending")}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            Looking for someone to deliver my handmade jewelry collection from
            Miami to Chicago. Careful handling required.
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case "pending":
      return styles.pendingStatus;
    case "accepted":
      return styles.acceptedStatus;
    case "in-progress":
      return styles.inProgressStatus;
    case "completed":
      return styles.completedStatus;
    default:
      return styles.pendingStatus;
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Accepted";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
  image: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "#1e293b",
    marginBottom: 16,
  },
  detailsCard: {
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#1e293b",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: "#1e293b",
  },
  priceValue: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#16a34a",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#ffffff",
  },
  pendingStatus: {
    backgroundColor: "#f59e0b",
  },
  acceptedStatus: {
    backgroundColor: "#3b82f6",
  },
  inProgressStatus: {
    backgroundColor: "#8b5cf6",
  },
  completedStatus: {
    backgroundColor: "#10b981",
  },
  descriptionCard: {
    marginTop: 16,
  },
  description: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#334155",
    lineHeight: 24,
  },
  offersCard: {
    marginTop: 16,
  },
  offersCount: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#334155",
    marginBottom: 16,
  },
  viewOffersButton: {
    marginTop: 8,
  },
});
