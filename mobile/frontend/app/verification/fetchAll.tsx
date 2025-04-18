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
    SafeAreaView,
    BackHandler,
} from "react-native";
import Icon from 'react-native-vector-icons/Feather';
import { Plus } from "lucide-react-native"
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
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { ThemedView } from "@/components/ThemedView";

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

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                navigation.navigate("home");
                return true;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [navigation])
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
        } else if (tab === "sponsor") {
            // Already on sponsor tab, no need to navigate
            return;
        } else if (tab === "travel") {
            navigation.navigate("home");
            setTimeout(() => {
                navigation.getParent()?.navigate("goodPost/goodpostpage");
            }, 0);
        } else if (tab === "home") {
            navigation.navigate("home");
        } else {
            // For any other tabs
            console.log(`Tab ${tab} not implemented yet`);
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
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Sponsorships"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        accessibilityLabel="Search sponsorships input"
                        placeholderTextColor="#999"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
                            <Icon name="x" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007BFF" />
                </View>
            ) : (
                <FlatList
                    data={sponsorships}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={<Text style={styles.emptyText}>No sponsorships found.</Text>}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
                />
            )}
            {isSponsor && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => handleAddSponsorshipPress(id)}
                    activeOpacity={0.8}
                >
                    <Plus size={24} color="white" strokeWidth={2.5} />
                </TouchableOpacity>
            )}
        </>
    );

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ThemedView style={styles.container}>
                <TopNavigation title="Sponsorships" />
                
                {isSponsor ? (
                    <SegmentedControl
                        values={["Requests", "All"]}
                        selectedIndex={view === "requests" ? 0 : 1}
                        onChange={(index) => setView(index === 0 ? "requests" : "all")}
                        style={styles.segmentedControl}
                    />
                ) : (
                    <SegmentedControl
                        values={["Orders", "All"]}
                        selectedIndex={view === "orders" ? 0 : 1}
                        onChange={(index) => setView(index === 0 ? "orders" : "all")}
                        style={styles.segmentedControl}
                    />
                )}

                <View style={styles.contentContainer}>
                    {isSponsor ? (
                        view === "requests" ? <OrdersScreen /> : renderAllView()
                    ) : (
                        view === "orders" ? <OrdersSponsor /> : renderAllView()
                    )}
                </View>

                <View style={styles.tabBarContainer}>
                    <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
                </View>
            </ThemedView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        display: 'flex',
        flexDirection: 'column',
    },
    contentContainer: {
        flex: 1,
        width: '100%',
    },
    tabBarContainer: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    segmentedControl: {
        marginHorizontal: 16,
        marginVertical: 4,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 4,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 60,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: '#333',
    },
    clearIcon: {
        padding: 5,
    },
    emptyText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
        color: "#666666",
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    cardSeparator: {
        height: 12,
    },
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
    }
});

export default SponsorshipsScreen;
