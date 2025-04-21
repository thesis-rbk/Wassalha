import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import axiosInstance, { BACKEND_URL } from "@/config";
import OrderCard from "../../components/cardsForHomePage";
import type { OrderfetchCardProps } from "../../types/Sponsorship";
import { Plus, Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import { TabBar } from "@/components/navigation/TabBar";
import { TopNavigation } from "@/components/navigation/TopNavigation";

export default function OrderList() {
  const [orders, setOrders] = useState<OrderfetchCardProps[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderfetchCardProps[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const router = useRouter();

  const handleOrderCardPress = (item: any) => {
    const navigationParams = {
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
        ? item.goods.goodsUrl.startsWith("http")
          ? item.goods.goodsUrl
          : `${BACKEND_URL}${item.goods.goodsUrl}`
        : null,
    };
    router.push({
      pathname: `/processTrack/initializationSP`,
      params: navigationParams,
    });
  };

  // Fetch orders
  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/allPendingReq`);
      const newRequests = response.data.data;
      console.log("Fetched requests:", newRequests);

      if (!newRequests || newRequests.length === 0) {
        setOrders([]);
        setFilteredOrders([]);
        setError("No orders available from the server.");
        return;
      }

      const processedRequests = newRequests.map((request: any) => {
        if (request.goods) {
          let imageUrl = request.goods.goodsUrl;
          if (
            request.goods.image?.url &&
            (request.goods.image.url.startsWith("http") ||
              request.goods.image.url.startsWith("https"))
          ) {
            imageUrl = request.goods.image.url;
          } else {
            imageUrl = `${BACKEND_URL}${imageUrl}`;
          }
          request.goods.goodsUrl = imageUrl;
        }
        return request;
      });

      const sortedRequests = processedRequests.sort(
        (a: any, b: any) => b.index - a.index
      );
      setOrders(sortedRequests);
      setFilteredOrders(sortedRequests);
      setError("");
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Handle search
  useEffect(() => {
    if (!searchQuery) {
      setFilteredOrders(orders);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = orders.filter((order: any) => {
      const userName = (order.user?.name || "Unknown User").toLowerCase();
      const createdAt = order.createdAt
        ? new Date(order.createdAt).toLocaleString().toLowerCase()
        : "";
      const updatedAt = order.updatedAt
        ? new Date(order.updatedAt).toLocaleString().toLowerCase()
        : "";
      const goods = order.goods?.name
        ? order.goods.name.toLowerCase()
        : order.goods?.description
        ? order.goods.description.toLowerCase()
        : "";
      const origin = (order.goodsDestination || "Unknown Origin").toLowerCase();
      const destination = (
        order.goodsLocation || "Unknown Destination"
      ).toLowerCase();

      return (
        userName.includes(lowerCaseQuery) ||
        createdAt.includes(lowerCaseQuery) ||
        updatedAt.includes(lowerCaseQuery) ||
        goods.includes(lowerCaseQuery) ||
        origin.includes(lowerCaseQuery) ||
        destination.includes(lowerCaseQuery)
      );
    });

    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  return (
    <View style={styles.container}>
      <TopNavigation title="Travel Posts" />
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      )}

      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <ScrollView contentContainerStyle={styles.listContent}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "No orders match your search"
                  : "No orders available"}
              </Text>
            </View>
          ) : (
            filteredOrders.map((item, i) => (
              <OrderCard
                key={`item-${i}`}
                order={item as any}
                onPress={() => handleOrderCardPress(item)}
              />
            ))
          )}
        </ScrollView>
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/productDetails/create-order")}
      >
        <Plus size={24} color="white" strokeWidth={2.5} />
      </TouchableOpacity>
      <TabBar activeTab="travel" onTabPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#1F2937",
  },
  listContent: { paddingBottom: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: { color: "#EF4444", fontSize: 16, textAlign: "center" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  emptyText: { color: "#6B7280", fontSize: 16, textAlign: "center" },
  fab: {
    position: "absolute",
    bottom: 95,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3a86ff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
