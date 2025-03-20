"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { useRoute, type RouteProp, useNavigation } from "@react-navigation/native"
import { Image as ExpoImage } from "expo-image"
import type { Sponsorship } from "@/types/Sponsorship"
import axiosInstance from "@/config"
import platformImages from "../../types/Sponsorship"

type RouteParams = {
    SponsorshipDetails: {
        id: number
    }
}

const SponsorshipDetails: React.FC = () => {
    const route = useRoute<RouteProp<RouteParams, "SponsorshipDetails">>()
    const navigation = useNavigation()
    const { id } = route.params
    const [sponsorship, setSponsorship] = useState<Sponsorship | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
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

        fetchSponsorshipDetails()
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
            <View style={styles.container}>
                <Text style={styles.errorText}>Failed to load sponsorship details</Text>
            </View>
        )
    }

    const platformImage = platformImages[sponsorship.platform as keyof typeof platformImages] || platformImages["OTHER"]

    return (
        <ScrollView style={styles.container}>
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
                        <Text style={styles.rating}>4.5/5</Text>
                        <Text style={styles.reviewCount}>(120 reviews)</Text>
                    </View>
                    <View style={styles.review}>
                        <Text style={styles.reviewText}>"Great platform for sponsorships! Highly recommend."</Text>
                        <Text style={styles.reviewer}>- Alex M.</Text>
                    </View>
                    <View style={styles.review}>
                        <Text style={styles.reviewText}>"Good value, but the process could be faster."</Text>
                        <Text style={styles.reviewer}>- Sarah K.</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buyButton}>
                        <Text style={styles.buyButtonText}>Buy Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#F5F5F5",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
        shadowColor: "#4A4A4A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
        marginBottom: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    platformImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 16,
    },
    headerText: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    platform: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    price: {
        fontSize: 20,
        fontWeight: "600",
        color: "#007BFF",
    },
    description: {
        fontSize: 16,
        color: "#666",
        marginBottom: 16,
        lineHeight: 24,
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    statusText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    reviewsContainer: {
        marginBottom: 20,
    },
    reviewsTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    rating: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
        marginRight: 8,
    },
    reviewCount: {
        fontSize: 14,
        color: "#666",
    },
    review: {
        marginBottom: 8,
    },
    reviewText: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
    },
    reviewer: {
        fontSize: 12,
        color: "#666",
        fontStyle: "italic",
    },
    actionContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    backButton: {
        flex: 1,
        backgroundColor: "#E0E0E0",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginRight: 8,
    },
    backButtonText: {
        color: "#1A1A1A",
        fontSize: 16,
        fontWeight: "600",
    },
    buyButton: {
        flex: 1,
        backgroundColor: "#007BFF",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    buyButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
    },
    errorText: {
        fontSize: 16,
        color: "#FF3B30",
        textAlign: "center",
    },
})

export default SponsorshipDetails