"use client"

import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Image as ExpoImage } from "expo-image"
import type { Sponsorship } from "@/types/Sponsorship"
import axiosInstance from "@/config"
import platformImages from "@/types/Sponsorship" // Fixed import path - should point to actual images file
import { Ionicons } from "@expo/vector-icons"
import { TabBar } from "@/components/navigation/TabBar"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { RouteProp } from "@react-navigation/native"
import { SponsorshipDetailsRouteParams } from "../../types/Subscription"
import { useStatus } from '@/context/StatusContext'
// Define the route params type

const SponsorshipDetails: React.FC = () => {
    const [activeTab, setActiveTab] = useState("Home")
    const route = useRoute<RouteProp<SponsorshipDetailsRouteParams, "SponsorshipDetails">>()
    const navigation = useNavigation<any>() // Using any temporarily, should be typed properly
    const { id } = route.params
    const [sponsorship, setSponsorship] = useState<Sponsorship | null>(null)
    const [loading, setLoading] = useState(true)
    const [averageRating, setAverageRating] = useState<number | null>(null)
    const [reviewCount, setReviewCount] = useState<number>(0)
    const [token, setToken] = useState<string | null>(null)
    const { show, hide } = useStatus()
    console.log("ifddddd from details", id)
    // Fetch token from AsyncStorage
    const fetchToken = async () => {
        try {
            const storedToken = await AsyncStorage.getItem("jwtToken")
            setToken(storedToken)
        } catch (error) {
            console.error("Error fetching token:", error)
        }
    }

    // Fetch sponsorship details
    const fetchSponsorshipDetails = async () => {
        try {
            const response = await axiosInstance.get(`/api/getOneSponsorSip/${id}`)
            setSponsorship(response.data)
        } catch (error) {
            console.error("Error fetching sponsorship details:", error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch reviews and calculate average rating
    const fetchReviews = async () => {
        try {
            const response = await axiosInstance.get(`/api/allRev/${id}`)
            const reviews = response.data
            if (reviews && reviews.length > 0) {
                const totalRating = reviews.reduce((sum: number, review: any) => sum + (review.sponsorshipRating || 0), 0)
                const avgRating = totalRating / reviews.length
                setAverageRating(avgRating)
                setReviewCount(reviews.length)
            } else {
                setAverageRating(0)
                setReviewCount(0)
            }
        } catch (err) {
            console.error("Error fetching reviews:", err)
        }
    }

    // Handle "Buy Now" action
    const buyNow = async () => {
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

        if (!sponsorship || !sponsorship.sponsorId || !sponsorship.price) {
            show({
                type: 'error',
                title: 'Invalid Data',
                message: 'Unable to process sponsorship data',
                primaryAction: {
                    label: 'OK',
                    onPress: () => hide()
                }
            });
            console.error("Invalid sponsorship data:", sponsorship);
            return;
        }

        const payload = {
            serviceProviderId: sponsorship.sponsorId,
            sponsorshipId: id,
            amount: sponsorship.price,
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
                message: 'Your order has been created successfully',
                primaryAction: {
                    label: 'View Orders',
                    onPress: () => {
                        hide();
                        navigation.navigate("verification/ClientsOrders");
                    }
                },
                secondaryAction: {
                    label: 'Stay Here',
                    onPress: () => hide()
                }
            });
        } catch (error) {
            console.error("Error creating order:", error);
            show({
                type: 'error',
                title: 'Order Creation Failed',
                message: 'Unable to create your order. Please try again.',
                primaryAction: {
                    label: 'Retry',
                    onPress: () => {
                        hide();
                        buyNow();
                    }
                },
                secondaryAction: {
                    label: 'Cancel',
                    onPress: () => hide()
                }
            });
        }
    };

    useEffect(() => {
        fetchSponsorshipDetails()
        fetchReviews()
        fetchToken()
    }, [])

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        )
    }

    if (!sponsorship) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Failed to load sponsorship details</Text>
            </View>
        )
    }

    const platformImage = platformImages[sponsorship.platform as keyof typeof platformImages] || platformImages["OTHER"]

    // Render star rating
    const renderStars = (rating: number | null) => {
        const stars = []
        const maxStars = 5
        const roundedRating = rating ? Math.round(rating) : 0

        for (let i = 1; i <= maxStars; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= roundedRating ? "star" : "star-outline"}
                    size={24}
                    color={i <= roundedRating ? "#FFD700" : "#D3D3D3"}
                    style={styles.star}
                />
            )
        }
        return stars
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.cardWrapper}>
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <ExpoImage
                                source={platformImage}
                                style={styles.platformImage}
                                contentFit="contain"
                                accessibilityLabel={`${sponsorship.platform} logo`}
                            />
                            <View style={styles.headerText}>
                                <Text style={styles.platform}>{sponsorship.platform}</Text>
                                <Text style={styles.price}>TDN{sponsorship.price?.toFixed(2)}</Text>
                            </View>
                        </View>

                        <Text style={styles.description}>{sponsorship.description}</Text>

                        <View style={[styles.statusBadge, { backgroundColor: sponsorship.isActive ? "#34C759" : "#FF3B30" }]}>
                            <Text style={styles.statusText}>{sponsorship.isActive ? "Active" : "Inactive"}</Text>
                        </View>

                        <View style={styles.reviewsContainer}>
                            <Text style={styles.reviewsTitle}>Reviews</Text>
                            <View style={styles.ratingContainer}>
                                {averageRating !== null ? (
                                    <>
                                        <View style={styles.starsContainer}>{renderStars(averageRating)}</View>
                                        <Text style={styles.rating}>{averageRating.toFixed(1)}/5</Text>
                                        <Text style={styles.reviewCount}>({reviewCount} reviews)</Text>
                                    </>
                                ) : (
                                    <Text style={styles.noReviews}>No reviews yet</Text>
                                )}
                            </View>
                        </View>

                        <View style={styles.actionContainer}>
                            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                                <Text style={styles.backButtonText}>Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buyButton} onPress={buyNow}>
                                <Text style={styles.buyButtonText}>Buy Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    cardWrapper: {
        width: "100%",
        maxWidth: 380,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 24,
        shadowColor: "#4A4A4A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    platformImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 20,
    },
    headerText: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    platform: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    price: {
        fontSize: 24,
        fontWeight: "600",
        color: "#007BFF",
    },
    description: {
        fontSize: 16,
        color: "#666",
        marginBottom: 20,
        lineHeight: 24,
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 20,
    },
    statusText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    reviewsContainer: {
        marginBottom: 24,
    },
    reviewsTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 12,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    starsContainer: {
        flexDirection: "row",
        marginRight: 10,
    },
    star: {
        marginRight: 6,
    },
    rating: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1A1A1A",
        marginRight: 10,
    },
    reviewCount: {
        fontSize: 16,
        color: "#666",
    },
    noReviews: {
        fontSize: 16,
        color: "#666",
        fontStyle: "italic",
    },
    actionContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    backButton: {
        flex: 1,
        backgroundColor: "#E0E0E0",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginRight: 10,
    },
    backButtonText: {
        color: "#1A1A1A",
        fontSize: 18,
        fontWeight: "600",
    },
    buyButton: {
        flex: 1,
        backgroundColor: "#007BFF",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    buyButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
    },
    errorText: {
        fontSize: 18,
        color: "#FF3B30",
        textAlign: "center",
    },
})

export default SponsorshipDetails