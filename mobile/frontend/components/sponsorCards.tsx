import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import { useColorScheme } from "react-native";
import { ChevronRight } from "lucide-react-native";
import platformImages from "../types/Sponsorship"; // Platform-to-image mapping
import { Image as ExpoImage } from "expo-image";
// Define the props interface for TypeScript
interface SponsorshipCardProps {
    platform: string; // e.g., "YOUTUBE", "TWITTER"
    price: string;
    isActive: boolean;
    onPress: () => void; // Callback for when the card is clicked
}

export const SponsorshipCard: React.FC<SponsorshipCardProps> = ({
    platform,
    price,
    isActive,
    onPress,
}) => {
    const colorScheme = useColorScheme() ?? "light";

    // Fetch the platform-specific image dynamically
    const platformImage = platformImages[platform as keyof typeof platformImages] || platformImages["OTHER"];

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.card,
                {
                    backgroundColor: colorScheme === "dark" ? "#1C2526" : "#FFFFFF",
                    shadowColor: colorScheme === "dark" ? "#000" : "#4A4A4A",
                    shadowOpacity: colorScheme === "dark" ? 0.4 : 0.2,
                },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${platform} sponsorship card`}
        >
            {/* Platform Image */}
            <View style={styles.imageContainer}>
                {platformImage ? (
                    <ExpoImage
                        source={platformImage}
                        style={styles.platformImage}
                        resizeMode="contain"
                        accessibilityLabel={`${platform} logo`}
                    />
                ) : (
                    <View style={[styles.platformImage, styles.fallbackImage]} />
                )}
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                <Text
                    style={[
                        styles.platform,
                        { color: colorScheme === "dark" ? "#E0E0E0" : "#1A1A1A" },
                    ]}
                >
                    {platform}
                </Text>
                <Text
                    style={[
                        styles.price,
                        { color: colorScheme === "dark" ? "#A0A0A0" : "#666666" },
                    ]}
                >
                    Price: {price}
                </Text>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: isActive ? "#34C759" : "#FF3B30" },
                    ]}
                >
                    <Text style={styles.statusText}>
                        {isActive ? "Active" : "Inactive"}
                    </Text>
                </View>
            </View>

            <ChevronRight
                color={colorScheme === "dark" ? "#66B2FF" : "#007BFF"}
                size={24}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.05)",
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 8,
        marginVertical: 8,
        minWidth: "100%",
    },
    imageContainer: {
        marginRight: 16,
    },
    platformImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
    },
    fallbackImage: {
        backgroundColor: "#D3D3D3",
    },
    contentContainer: {
        flex: 1,
    },
    platform: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 8,
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    statusText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
});