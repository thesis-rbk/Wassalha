"use client"

import { useState, useEffect, useRef } from "react"
import {
    View,
    TextInput,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    Animated,
} from "react-native"
import axiosInstance, { BACKEND_URL } from "@/config"
import OrderCard from "../../components/cardsForHomePage"
import type { OrderfetchCardProps } from "../../types/Sponsorship"
import { Search, X, Plus } from "lucide-react-native" // Assuming you have lucide icons installed
import { useRouter } from "expo-router"
import { TabBar } from "@/components/navigation/TabBar"
import { TopNavigation } from "@/components/navigation/TopNavigation"
export default function OrderList() {
    const [orders, setOrders] = useState<OrderfetchCardProps[]>([])
    const [filteredOrders, setFilteredOrders] = useState<OrderfetchCardProps[]>([])
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const router = useRouter()
    const searchInputRef = useRef<TextInput>(null)
    const fadeAnim = useRef(new Animated.Value(1)).current // For placeholder animation
    const [activeTab, setActiveTab] = useState("homz")
    const handleTabPress = (tab: string) => {
        setActiveTab(tab);
        if (tab === "create") {
            router.push("/verification/CreateSponsorPost");
        } else if (tab === "travel") {
            // Already on travel tab, no need to navigate
            return;
        } else if (tab === "sponsor") {
            router.push("/verification/fetchAll");
        } else if (tab === "home") {
            router.push("/home");
        } else {
            // Handle other tabs if needed in the future
            console.log(`Tab ${tab} not implemented yet`);
        }
    };
    const fetchAllOrders = async () => {
        setLoading(true)
        setError("")
        try {
            const response = await axiosInstance.get("api/allPendingReq")

            // Process the orders to ensure image URLs are properly formatted
            const processedOrders = response.data.data.map((order: any) => {
                // Process goods image URL
                if (order.goods && order.goods.goodsUrl) {
                    // Make sure the URL has the proper backend prefix
                    if (!order.goods.goodsUrl.startsWith("http")) {
                        order.goods.goodsUrl = `${BACKEND_URL}${order.goods.goodsUrl}`
                    }
                }

                // Process user profile image URL
                if (order.user && order.user.profile && order.user.profile.image && order.user.profile.image.url) {
                    if (!order.user.profile.image.url.startsWith("http")) {
                        order.user.profile.image.url = `${BACKEND_URL}${order.user.profile.image.url}`
                    }
                }

                return order
            })

            setOrders(processedOrders)
            setFilteredOrders(processedOrders)
        } catch (err) {
            setError("Failed to fetch orders. Please try again later.")
            console.error("Error fetching orders:", err)
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch on component mount
    useEffect(() => {
        fetchAllOrders()
    }, [])

    const handleCreatePost = () => {
        router.push("/productDetails/create-order")
    }

    // Debounce function to limit search execution
    const debounce = (func: (...args: any[]) => void, delay: number) => {
        let timeoutId: NodeJS.Timeout
        return (...args: any[]) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => func(...args), delay)
        }
    }

    // Handle search functionality on frontend
    const handleSearchLogic = (query: string) => {
        const searchLower = query.toLowerCase().trim()

        if (searchLower === "") {
            setFilteredOrders(orders)
        } else {
            const filtered = orders.filter((order) => {
                const userName = (order.user?.name || "Unknown User").toLowerCase()
                const goodsName = (order.goods?.name || "").toLowerCase()
                const origin = (order.goodsDestination || "Unknown Origin").toLowerCase()
                const destination = (order.goodsLocation || "Unknown Destination").toLowerCase()

                return (
                    userName.includes(searchLower) ||
                    goodsName.includes(searchLower) ||
                    origin.includes(searchLower) ||
                    destination.includes(searchLower)
                )
            })
            setFilteredOrders(filtered)
        }
    }

    const debouncedSearch = debounce(handleSearchLogic, 300)

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        debouncedSearch(query)
    }

    // Clear search input
    const clearSearch = () => {
        setSearchQuery("")
        setFilteredOrders(orders)
        searchInputRef.current?.blur()
    }

    // Handle focus animation
    const handleFocus = () => {
        setIsFocused(true)
        Animated.timing(fadeAnim, {
            toValue: 0.5,
            duration: 200,
            useNativeDriver: true,
        }).start()
    }

    const handleBlur = () => {
        setIsFocused(false)
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start()
    }

    // Handle order press
    const handleOrderPress = (item: OrderfetchCardProps) => {
        // Prepare navigation parameters
        const navigationParams = {
            id: item?.id?.toString(),
            goodsName: item.goods?.name || "Unknown",
            price: item.goods?.price || 0,
            location: item.goodsLocation || "Unknown",
            destination: item.goodsDestination || "Unknown",
            quantity: item.quantity?.toString() || "0",
            description: item.goods?.description || "",
            category: item?.goods?.category?.name || "Uncategorized",
            withBox: item.withBox?.toString() || "false",
            requesterId: item.userId?.toString(),
            requesterName: item.user?.name || "Anonymous",
            requesterRating: item.user?.reputation?.score?.toString() || "0",
            requesterLevel: item.user?.reputation?.level?.toString() || "1",
            requesterTotalRatings: item.user?.reputation?.totalRatings?.toString() || "0",
            requesterVerified: item.user?.profile?.isVerified?.toString() || "false",
            status: item.status,
            imageUrl: item.goods?.goodsUrl || null,
        }

        router.push({
            pathname: `/processTrack/initializationSP`,
            params: navigationParams,
        })
    }

    // Render individual order card
    const renderOrder = ({ item }: { item: OrderfetchCardProps }) => (
        <OrderCard order={item} onPress={() => handleOrderPress(item)} />
    )

    return (
        <View style={styles.container}>
            <TopNavigation title="Travel Posts" />
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchWrapper, isFocused && styles.searchWrapperFocused]}>
                    <Search size={20} color="#6B7280" style={styles.searchIcon} />
                    <Animated.Text style={[styles.placeholder, searchQuery && styles.placeholderHidden, { opacity: fadeAnim }]}>
                        Search Requests...
                    </Animated.Text>
                    <TextInput
                        ref={searchInputRef}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        autoCapitalize="none"
                        returnKeyType="search"
                        accessibilityLabel="Search orders"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={clearSearch} style={styles.clearButton} accessibilityLabel="Clear search">
                            <X size={20} color="#6B7280" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Loading State */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4A90E2" />
                </View>
            )}

            {/* Error State */}
            {error && !loading && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Orders List */}
            {!loading && !error && (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrder}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{searchQuery ? "No matching orders found" : "No orders available"}</Text>
                        </View>
                    }
                />
            )}
            <TouchableOpacity style={styles.fab} onPress={handleCreatePost} activeOpacity={0.8}>
                <Plus size={24} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
            <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },
    searchContainer: {
        padding: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    searchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        height: 48,
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    searchWrapperFocused: {
        borderColor: "#4A90E2",
        shadowColor: "#4A90E2",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#1F2937",
        height: "100%",
    },
    placeholder: {
        position: "absolute",
        left: 40,
        fontSize: 16,
        color: "#6B7280",
    },
    placeholderHidden: {
        display: "none",
    },
    clearButton: {
        padding: 4,
    },
    listContent: {
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        color: "#EF4444",
        fontSize: 16,
        textAlign: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        marginTop: 50,
    },
    emptyText: {
        color: "#6B7280",
        fontSize: 16,
        textAlign: "center",
    },
    fab: {
        position: "absolute",
        bottom: 95, // Adjust to be above TabBar
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
})
