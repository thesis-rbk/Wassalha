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
import Icon from 'react-native-vector-icons/Feather'; // Add this for icons
import axiosInstance from "@/config";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Sponsorship } from "@/types/Sponsorship";
import NavigationProp from "@/types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { SponsorshipCard } from "../../components/sponsorCards";

const SponsorshipsScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
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

    // Fetch sponsorships from the API
    const fetchSponsorships = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("api/search", {
                params: {
                    nameContains: searchQuery,
                    minPrice: minPrice || undefined,
                    maxPrice: maxPrice || undefined,
                },
            });
            const sorted = response.data.sort(
                (a: Sponsorship, b: Sponsorship) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setSponsorships(sorted);
        } catch (error) {
            console.error("Error fetching sponsorships:", error);
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

    // Fetch sponsorships when search query or price range changes
    useFocusEffect(
        useCallback(() => {
            fetchSponsorships();
        }, [searchQuery, minPrice, maxPrice])
    );

    // Handle "Buy" button press
    const handleBuyPress = (sponsorshipId: number) => {
        router.push({
            pathname: "/sponsorshipTrack/initializationBuyer",
            params: { id: sponsorshipId },
        });
    };

    // Handle "Add Sponsorship" button press
    const handleAddSponsorshipPress = (sponsorshipId: number) => {
        navigation.navigate("verification/CreateSponsorPost", { id: sponsorshipId });
    };

    // Render the sponsorship card using SponsorshipCard component
    const renderItem = ({ item }: { item: Sponsorship }) => (
        <SponsorshipCard
            platform={item.platform}
            price={`$${item.price.toFixed(2)}`}
            isActive={item.isActive}
            onPress={() => navigation.navigate("verification/CreateSponsorPost", { id: item.id })}
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

            {/* Price Range Inputs */}
            <View style={styles.priceRangeContainer}>
                <TextInput
                    style={styles.priceInput}
                    placeholder="Min Price"
                    value={minPrice}
                    keyboardType="numeric"
                    onChangeText={setMinPrice}
                    accessibilityLabel="Minimum price input"
                />
                <TextInput
                    style={styles.priceInput}
                    placeholder="Max Price"
                    value={maxPrice}
                    keyboardType="numeric"
                    onChangeText={setMaxPrice}
                    accessibilityLabel="Maximum price input"
                />
            </View>

            {/* Sponsorships List */}
            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" style={styles.loading} />
            ) : (
                <FlatList
                    data={sponsorships}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={<Text style={styles.emptyText}>No sponsorships found.</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#F5F5F5",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // For Android shadow
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
    priceRangeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    priceInput: {
        width: "45%",
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        backgroundColor: "#FFFFFF",
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
});

export default SponsorshipsScreen;