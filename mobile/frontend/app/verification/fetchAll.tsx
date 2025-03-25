import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
} from "react-native";
import Icon from 'react-native-vector-icons/Feather';
import axiosInstance from "@/config";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Sponsorship } from "@/types/Sponsorship";
import NavigationProp from "@/types/navigation.d";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useRouter } from "expo-router";
import { SponsorshipCard } from "../../components/sponsorCards";
import { TabBar } from "@/components/navigation/TabBar";
import SegmentedControl from "@/components/SegmentedControl";
import OrdersScreen from "./SponsorRequests"
// Placeholder for Requests Component (replace with your actual component)
const RequestsComponent: React.FC = () => {
    return (
        <View style={styles.fakeRequestsContainer}>
            <Text style={styles.fakeRequestsText}>Requests View (Placeholder)</Text>
            <Text style={styles.fakeRequestsSubText}>Replace this with your actual Requests component.</Text>
        </View>
    );
};

const SponsorshipsScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState("home"); // For TabBar
    const [view, setView] = useState<"requests" | "all">("all"); // Updated for SegmentedControl
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isSponsor, setIsSponsor] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);
    const [id, setID] = useState<number>(0);

    const navigation = useNavigation<NavigationProp>();
    const router = useRouter();

    // Animation for search bar focus
    const [isFocused, setIsFocused] = useState(false);
    const animatedScale = new Animated.Value(1);

    const handleFocus = () => {
        setIsFocused(true);
        Animated.spring(animatedScale, {
            toValue: 1.02,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.spring(animatedScale, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const clearSearch = () => {
        setSearchQuery("");
    };

    // Fetch JWT token from AsyncStorage
    const tokenVerif = async () => {
        try {
            const tokeny = await AsyncStorage.getItem("jwtToken");
            console.log("token:", tokeny);
            setToken(tokeny);
        } catch (error) {
            console.error("Error fetching token:", error);
        }
    };

    // Check if the user is a sponsor
    const check = async () => {
        if (!token) return;
        try {
            const response = await axiosInstance.get("/api/checkSponsor", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            console.log("is sponsor:", response.data);
            setIsSponsor(response.data);
        } catch (err) {
            console.log("Error in check function:", err);
        }
    };

    const fetchSponsorships = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/api/search", {
                params: {
                    searchTerm: searchQuery || "",
                },
            });
            const sorted = response.data.sort(
                (a: Sponsorship, b: Sponsorship) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setSponsorships(sorted);
        } catch (error) {
            console.error("Error fetching sponsorships:", error);
            setSponsorships([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch token on mount
    useEffect(() => {
        tokenVerif();
    }, []);

    // Check sponsor status when token changes
    useEffect(() => {
        check();
    }, [token]);

    // Fetch sponsorships when search query changes in "All" view
    useFocusEffect(
        useCallback(() => {
            if (view === "all") {
                fetchSponsorships();
            }
        }, [searchQuery, view])
    );

    // Handle "Buy" button press
    const handleBuyPress = (sponsorshipId: number) => {
        router.push({
            pathname: "/sponsorshipTrack/initializationBuyer",
            params: { id: sponsorshipId }
        });
    };

    // Handle "Add Sponsorship" button press
    const handleAddSponsorshipPress = (sponsorshipId: number) => {
        navigation.navigate("verification/CreateSponsorPost", { id: sponsorshipId });
    };

    // Handle tab press
    const handleTabPress = (tab: string) => {
        setActiveTab(tab);
        if (tab === "create") {
            navigation.navigate("verification/CreateSponsorPost", { id });
        } else {
            navigation.navigate(tab as any);
        }
    };

    // Render the sponsorship card using SponsorshipCard component
    const renderItem = ({ item }: { item: Sponsorship }) => (
        <SponsorshipCard
            id={item.id}
            platform={item.platform}
            price={`$${item.price.toFixed(2)}`}
            description={item.description ?? ""}
            isActive={item.isActive}
            onPress={() => navigation.navigate("verification/SponsorshipDetails", { id: item.id })}
            onBuyPress={() => handleBuyPress(item.id)}
        />
    );

    // Render "All" View with search and FlatList
    const renderAllView = () => (
        <>
            <Animated.View style={[styles.searchContainer, { transform: [{ scale: animatedScale }] }]}>
                <Icon name="search" size={20} color="#007BFF" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search Sponsorships"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    accessibilityLabel="Search sponsorships input"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
                        <Icon name="x" size={20} color="#007BFF" />
                    </TouchableOpacity>
                )}
                {isSponsor && (
                    <TouchableOpacity onPress={() => handleAddSponsorshipPress(id)} style={styles.plusButtonContainer}>
                        <Text style={styles.plusButton}>+</Text>
                    </TouchableOpacity>
                )}
            </Animated.View>

            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" style={styles.loading} />
            ) : (
                <FlatList
                    data={sponsorships}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={<Text style={styles.emptyText}>No sponsorships found.</Text>}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </>
    );

    return (
        <View style={styles.container}>
            {/* Conditionally render SegmentedControl if user is a sponsor */}
            {isSponsor && (
                <SegmentedControl
                    values={["Requests", "All"]}
                    selectedIndex={view === "requests" ? 0 : 1}
                    onChange={(index) => setView(index === 0 ? "requests" : "all")}
                />
            )}

            {/* Render views based on sponsor status */}
            {isSponsor ? (
                view === "requests" ? <OrdersScreen /> : renderAllView()
            ) : (
                renderAllView()
            )}

            {/* TabBar */}
            <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
    },
    clearIcon: {
        marginLeft: 8,
    },
    plusButtonContainer: {
        marginLeft: 10,
        backgroundColor: "#007BFF",
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    plusButton: {
        fontSize: 20,
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    loading: {
        marginTop: 20,
    },
    emptyText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
        color: "#666666",
    },
    listContent: {
        padding: 20,
        paddingBottom: 80,
    },
    fakeRequestsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    fakeRequestsText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    fakeRequestsSubText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
});

export default SponsorshipsScreen;