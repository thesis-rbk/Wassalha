import React from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Home,
  Package,
  ShoppingBag,
  MapPin,
  Calendar,
  CheckCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function OrderSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract parameters (you can add more as needed)
  const {
    orderId = "0",
    goodsName = "Your item",
    destination = "Destination",
  } = params;

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.gradientBackground}
      />

      <View style={styles.content}>
        <View style={styles.successIconContainer}>
          <CheckCircle size={100} color="#fff" />
        </View>

        <ThemedText style={styles.title}>Order Confirmed!</ThemedText>

        <ThemedText style={styles.description}>
          Your order has been successfully placed. A traveler will be bringing
          your item soon!
        </ThemedText>

        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <ShoppingBag size={20} color="#3b82f6" />
            <ThemedText style={styles.orderHeaderText}>
              Order #{orderId}
            </ThemedText>
          </View>

          <View style={styles.orderDetail}>
            <ThemedText style={styles.itemName}>{goodsName}</ThemedText>

            <View style={styles.detailRow}>
              <MapPin size={16} color="#64748b" />
              <ThemedText style={styles.detailText}>{destination}</ThemedText>
            </View>

            <View style={styles.detailRow}>
              <Calendar size={16} color="#64748b" />
              <ThemedText style={styles.detailText}>
                Estimated arrival: {getEstimatedDate()}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.tipCard}>
          <ThemedText style={styles.tipTitle}>💡 Tip</ThemedText>
          <ThemedText style={styles.tipText}>
            You can track the status of your order in the Orders section. Make
            sure to stay in touch with your traveler!
          </ThemedText>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace("/")}
          >
            <Home size={20} color="#fff" />
            <ThemedText style={styles.buttonText}>Home</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ordersButton}
            onPress={() => router.replace("/orders&requests/order")}
          >
            <Package size={20} color="#fff" />
            <ThemedText style={styles.buttonText}>My Orders</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

// Helper function to get estimated date (2 weeks from now)
const getEstimatedDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: Dimensions.get("window").height * 0.4,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    color: "#fff",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    color: "#e2e8f0",
  },
  orderCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 0,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
  },
  orderHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "#1e293b",
  },
  orderDetail: {
    padding: 16,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1e293b",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
    color: "#64748b",
  },
  tipCard: {
    width: "100%",
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: "#eab308",
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#854d0e",
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#854d0e",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  homeButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginRight: 8,
  },
  ordersButton: {
    flex: 1,
    backgroundColor: "#8b5cf6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginLeft: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});
