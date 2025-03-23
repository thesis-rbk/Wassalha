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
    PlatformColor,
} from "react-native";
import Icon from 'react-native-vector-icons/Feather';
import axiosInstance from "@/config";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Sponsorship } from "@/types/Sponsorship";
import NavigationProp from "@/types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { SponsorshipCard } from "../../components/sponsorCards";
import { TabBar } from "@/components/navigation/TabBar";

const SponsorshipsScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState("home"); // Set to "home" to match the screenshot
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

    // Fetch sponsorships when search query changes
    useFocusEffect(
        useCallback(() => {
            fetchSponsorships();
        }, [searchQuery])
    );

    // Handle "Buy" button press
    const handleBuyPress = (sponsorshipId: number) => {
        navigation.navigate(
            "verification/PaymentByKH",
            { id: sponsorshipId }
        );
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

    return (
        <View style={styles.container}>
            {/* Search Bar and Add Sponsorship Button */}
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

            {/* Sponsorships List */}
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
        margin: 20,
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
        paddingBottom: 80, // Add padding to avoid content being hidden behind TabBar
    },
});

export default SponsorshipsScreen;