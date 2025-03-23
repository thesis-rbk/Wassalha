"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { useRoute, type RouteProp, useNavigation } from "@react-navigation/native"
import { Image as ExpoImage } from "expo-image"
import type { Sponsorship } from "@/types/Sponsorship"
import axiosInstance from "@/config"
import platformImages from "../../types/Sponsorship"
import { Ionicons } from "@expo/vector-icons"
import { TabBar } from "@/components/navigation/TabBar";
import { RouteParams } from "@/types/Sponsorship";
import NavigationProp from "@/types/navigation";
const SponsorshipDetails: React.FC = () => {
    const [activeTab, setActiveTab] = useState("Home");
    const route = useRoute<RouteProp<RouteParams, "SponsorshipDetails">>()
    const navigation = useNavigation<NavigationProp>();
    const { id } = route.params
    const [sponsorship, setSponsorship] = useState<Sponsorship | null>(null)
    const [loading, setLoading] = useState(true)
    const [averageRating, setAverageRating] = useState<number | null>(null)
    const [reviewCount, setReviewCount] = useState<number>(0)

    // Fetch sponsorship details
    const fetchSponsorshipDetails = async () => {
        try {
            const response = await axiosInstance.get(`/api/one/${id}`)
            setSponsorship(response.data)
        } catch (error) {
            console.error("Error fetching sponsorship details:", error)
        } finally {
            setLoading(false)
        }
    }
    const buyNow = () => {
        navigation.navigate('verification/PaymentByKH', { id });
    };
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
            setAverageRating(0)
            setReviewCount(0)
        }
    }

    useEffect(() => {
        fetchSponsorshipDetails()
        fetchReviews()
    }, [id])

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
                    size={24} // Increased size for better visibility
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
                        {/* Platform Image and Header */}
                        <View style={styles.header}>
                            <ExpoImage
                                source={platformImage}
                                style={styles.platformImage}
                                resizeMode="contain"
                                accessibilityLabel={`${sponsorship.platform} logo`}
                            />
                            <View style={styles.headerText}>
                                <Text style={styles.platform}>{sponsorship.platform}</Text>
                                <Text style={styles.price}>${sponsorship.price.toFixed(2)}</Text>
                            </View>
                        </View>

                        {/* Description */}
                        <Text style={styles.description}>{sponsorship.description}</Text>

                        {/* Status */}
                        <View style={[styles.statusBadge, { backgroundColor: sponsorship.isActive ? "#34C759" : "#FF3B30" }]}>
                            <Text style={styles.statusText}>{sponsorship.isActive ? "Active" : "Inactive"}</Text>
                        </View>

                        {/* Reviews Section */}
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

                        {/* Action Buttons */}
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
        paddingVertical: 20, // Increased padding for better spacing
        paddingHorizontal: 10, // Reduced horizontal padding to allow more card width
    },
    cardWrapper: {
        width: "100%",
        maxWidth: 380, // Slightly increased for better use of screen space
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16, // Increased border radius for a softer look
        padding: 24, // Increased padding for better spacing inside the card
        shadowColor: "#4A4A4A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15, // Softer shadow
        shadowRadius: 8,
        elevation: 6,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20, // Increased spacing
    },
    platformImage: {
        width: 60, // Increased size for better visibility
        height: 60,
        borderRadius: 10,
        marginRight: 20, // Increased spacing
    },
    headerText: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    platform: {
        fontSize: 28, // Increased font size for better readability
        fontWeight: "700",
        color: "#1A1A1A",
    },
    price: {
        fontSize: 24, // Increased font size
        fontWeight: "600",
        color: "#007BFF",
    },
    description: {
        fontSize: 16,
        color: "#666",
        marginBottom: 20, // Increased spacing
        lineHeight: 24,
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingVertical: 6, // Increased padding for better touch area
        paddingHorizontal: 16,
        borderRadius: 20, // More rounded for a modern look
        marginBottom: 20,
    },
    statusText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    reviewsContainer: {
        marginBottom: 24, // Increased spacing
    },
    reviewsTitle: {
        fontSize: 20, // Increased font size
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 12, // Increased spacing
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
        marginRight: 6, // Increased spacing between stars
    },
    rating: {
        fontSize: 18, // Increased font size
        fontWeight: "600",
        color: "#1A1A1A",
        marginRight: 10,
    },
    reviewCount: {
        fontSize: 16, // Increased font size
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
        marginTop: 10, // Added margin for better separation
    },
    backButton: {
        flex: 1,
        backgroundColor: "#E0E0E0",
        padding: 14, // Increased padding for better touch area
        borderRadius: 10,
        alignItems: "center",
        marginRight: 10,
    },
    backButtonText: {
        color: "#1A1A1A",
        fontSize: 18, // Increased font size
        fontWeight: "600",
    },
    buyButton: {
        flex: 1,
        backgroundColor: "#007BFF",
        padding: 14, // Increased padding
        borderRadius: 10,
        alignItems: "center",
    },
    buyButtonText: {
        color: "#FFFFFF",
        fontSize: 18, // Increased font size
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
    },
    errorText: {
        fontSize: 18, // Increased font size
        color: "#FF3B30",
        textAlign: "center",
    },
})

export default SponsorshipDetails