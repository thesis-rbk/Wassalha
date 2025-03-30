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
    Alert,
} from "react-native";
import Icon from 'react-native-vector-icons/Feather';
import axiosInstance from "@/config";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Sponsorship } from "@/types/Sponsorship";
import NavigationProp from "@/types/navigation.d";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SponsorshipCard } from "../../components/sponsorCards";
import { TabBar } from "@/components/navigation/TabBar";
import SegmentedControl from "@/components/SegmentedControl";
import OrdersScreen from "./SponsorRequests";
import OrdersSponsor from "./ClientsOrders";
import { useStatus } from '@/context/StatusContext';

const SponsorshipsScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState("home");
    const [view, setView] = useState<"requests" | "orders" | "all">("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isSponsor, setIsSponsor] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);
    const [id, setID] = useState<number>(0);

    const navigation = useNavigation<NavigationProp>();

    const [isFocused, setIsFocused] = useState(false);
    const animatedScale = new Animated.Value(1);

    const { show, hide } = useStatus();

    const handleFocus = () => {
        setIsFocused(true);
        Animated.spring(animatedScale, { toValue: 1.02, friction: 3, useNativeDriver: true }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.spring(animatedScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    };

    const clearSearch = () => setSearchQuery("");

    const tokenVerif = async () => {
        try {
            const tokeny = await AsyncStorage.getItem("jwtToken");
            setToken(tokeny);
        } catch (error) {
            console.error("Error fetching token:", error);
        }
    };

    const check = async () => {
        if (!token) return;
        try {
            const response = await axiosInstance.get("/api/checkSponsor", {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            setIsSponsor(response.data);
        } catch (err) {
            console.log("Error in check function:", err);
        }
    };

    const fetchSponsorships = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/api/search", {
                params: { searchTerm: searchQuery || "" },
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

    useEffect(() => {
        tokenVerif();
    }, []);

    useEffect(() => {
        check();
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            if (view === "all") fetchSponsorships();
        }, [searchQuery, view])
    );

    const handleBuyPress = async (serviceProviderId: number, sponsorshipId: number, amount: number, status: string) => {
        if (!token) {
            show({
                type: 'error',
                title: 'Authentication Required',
                message: 'Please log in to make a purchase',
                primaryAction: {
                    label: 'OK',
                    onPress: () => hide()
                }
            });
            return;
        }

        // Validate inputs before sending
        if (!serviceProviderId || !sponsorshipId || !amount) {
            show({
                type: 'error',
                title: 'Invalid Data',
                message: 'Invalid sponsorship data',
                primaryAction: {
                    label: 'OK',
                    onPress: () => hide()
                }
            });
            console.error("Invalid data:", { serviceProviderId, sponsorshipId, amount });
            return;
        }

        const payload = {
            serviceProviderId,
            sponsorshipId,
            amount,
            status: "PENDING"
        };

        try {
            const response = await axiosInstance.post("/api/createOrderSponsor", payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            show({
                type: 'success',
                title: 'Order Created',
                message: 'Order created successfully',
                primaryAction: {
                    label: 'Continue',
                    onPress: () => {
                        hide();
                        navigation.navigate("verification/ClientsOrders");
                        if (view === "all") fetchSponsorships();
                    }
                }
            });
        } catch (error) {
            console.error("Error creating order:", error);
            show({
                type: 'error',
                title: 'Order Creation Failed',
                message: `Failed to create order: ${error}`,
                primaryAction: {
                    label: 'Try Again',
                    onPress: () => {
                        hide();
                        handleBuyPress(serviceProviderId, sponsorshipId, amount, status);
                    }
                },
                secondaryAction: {
                    label: 'Cancel',
                    onPress: () => hide()
                }
            });
        }
    };

    const handleAddSponsorshipPress = (sponsorshipId: number) => {
        navigation.navigate("verification/CreateSponsorPost", { id: sponsorshipId });
    };

    const handleTabPress = (tab: string) => {
        setActiveTab(tab);
        if (tab === "create") {
            navigation.navigate("verification/CreateSponsorPost", { id });
        } else {
            navigation.navigate(tab as any);
        }
    };

    const renderItem = ({ item }: { item: Sponsorship }) => {
        return (
            <SponsorshipCard
                id={item.id}
                platform={item.platform ?? ""}
                price={`TND${(item.price ?? 0).toFixed(2)}`}
                description={item.description ?? ""}
                isActive={item.isActive ?? false}
                duration={item.duration}
                onPress={() => navigation.navigate("verification/SponsorshipDetails", { id: item.id })}
                onBuyPress={() => handleBuyPress(
                    item.sponsorId, // Fallback to 0 if undefined
                    item.id,
                    item.price ?? 0, // Fallback to 0 if undefined
                    "PENDING"
                )}
                sponsorship={{ description: item.description, amount: item.price }}
            />
        );
    };

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
            {isSponsor ? (
                <SegmentedControl
                    values={["Requests", "All"]}
                    selectedIndex={view === "requests" ? 0 : 1}
                    onChange={(index) => setView(index === 0 ? "requests" : "all")}
                    style={styles.segmentedControl} // Added style to move it down
                />
            ) : (
                <SegmentedControl
                    values={["Orders", "All"]}
                    selectedIndex={view === "orders" ? 0 : 1}
                    onChange={(index) => setView(index === 0 ? "orders" : "all")}
                    style={styles.segmentedControl} // Added style to move it down
                />
            )}

            {isSponsor ? (
                view === "requests" ? <OrdersScreen /> : renderAllView()
            ) : (
                view === "orders" ? <OrdersSponsor /> : renderAllView()
            )}

            <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    segmentedControl: {
        marginTop: 40, // Moves the SegmentedControl down
        marginHorizontal: 20, // Optional: adds horizontal spacing
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
});

export default SponsorshipsScreen;
