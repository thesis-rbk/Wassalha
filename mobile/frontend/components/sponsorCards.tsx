import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useColorScheme } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import platformImages, { SponsorshipCardProps } from "../types/Sponsorship";
import type NavigationProp from "@/types/navigation.d";
import { COLORS } from "../constants/theme";
import { memo, useState } from "react";

// Constants for description truncation
const DESCRIPTION_MAX_LENGTH = 50; // Increased for better readability

// Component to render the platform image
const PlatformImage: React.FC<{ platform: string }> = ({ platform }) => {
    const platformImage = platformImages[platform as keyof typeof platformImages] || platformImages["OTHER"];

    return (
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
    );
};

// Component to render the description with "See More" link
const DescriptionWithSeeMore: React.FC<{
    description: string;
    onPress: () => void;
    textColor: string;
    linkColor: string;
}> = ({ description, onPress, textColor, linkColor }) => {
    // Set condition for truncation: Show "See More" after at least 1 letter and at most 10 letters
    const isTruncated = description.length > 10;  // Adjusted for max 10 letters
    const truncatedDescription = description.length > 10
        ? `${description.substring(0, 10)}...`
        : description; // Truncate after 10 characters

    return (
        <View style={styles.descriptionContainer}>
            <Text style={[styles.description, { color: textColor }]}>{truncatedDescription}</Text>
            {/* Always show "See More" link */}
            <TouchableOpacity onPress={onPress} accessibilityLabel="See more details">
                <Text style={[styles.seeMore, { color: linkColor }]}>
                    See More
                </Text>
            </TouchableOpacity>
        </View>
    );
};

// Component to render a trust signal (e.g., "New" badge or reviews)
const TrustSignal: React.FC<{ reviews?: number; rating?: number; isNew?: boolean }> = ({
    reviews = 0,
    rating = 0,
    isNew = false,
}) => {
    if (isNew) {
        return (
            <View style={[styles.trustBadge, { backgroundColor: "#FFD700" }]}>
                <Text style={styles.trustText}>New</Text>
            </View>
        );
    }

    return reviews > 0 ? (
        <View style={styles.trustBadge}>
            <Text style={styles.trustText}>
                {rating.toFixed(1)}/5 ({reviews} reviews)
            </Text>
        </View>
    ) : null;
};

// Component to render the action buttons and status
const ActionButtons: React.FC<{
    isActive: boolean;
    onBuyPress: () => void;
    activeColor: string;
    inactiveColor: string;
    buttonColor: string;
}> = ({ isActive, onBuyPress, activeColor, inactiveColor, buttonColor }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleBuyPress = async () => {
        setIsLoading(true);
        try {
            await onBuyPress();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.actionContainer}>
            <View style={[styles.statusBadge, { backgroundColor: isActive ? activeColor : inactiveColor }]}>
                <Text style={styles.statusText}>{isActive ? "Active" : "Inactive"}</Text>
            </View>
            <TouchableOpacity
                onPress={handleBuyPress}
                style={[styles.buyButton, { backgroundColor: buttonColor }]}
                disabled={isLoading}
                accessibilityLabel="Buy now button"
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Text style={styles.buyButtonText}>Buy Now</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

// Main SponsorshipCard component
export const SponsorshipCard: React.FC<SponsorshipCardProps> = memo(
    ({
        id,
        platform,
        price,
        description,
        isActive,
        onPress,
        onBuyPress,
        duration, // New prop for package duration
    }) => {
        const colorScheme = useColorScheme() ?? "light";
        const theme = COLORS[colorScheme];
        const navigation = useNavigation<NavigationProp>();

        const handleSeeMore = () => {
            navigation.navigate("verification/SponsorshipDetails", { id });
        };

        // Format price with currency (assuming TDN for now, but this could be dynamic)
        const formattedPrice = `${price} TDN`;

        return (
            <TouchableOpacity
                onPress={onPress}
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.background,
                        shadowColor: theme.shadow,
                        shadowOpacity: theme.shadowOpacity,
                    },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${platform} sponsorship card, ${formattedPrice}, ${isActive ? "active" : "inactive"}`}
            >
                <PlatformImage platform={platform} />

                <View style={styles.contentContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={[styles.platform, { color: theme.platformText }]}>
                            {platform}
                        </Text>
                    </View>
                    <Text style={[styles.price, { color: theme.secondaryText }]}>
                        {formattedPrice}
                    </Text>
                    <DescriptionWithSeeMore
                        description={description || "No description available"}
                        onPress={handleSeeMore}
                        textColor={theme.secondaryText}
                        linkColor={theme.interactive}
                    />
                    <ActionButtons
                        isActive={isActive}
                        onBuyPress={onBuyPress}
                        activeColor={theme.activeBadge}
                        inactiveColor={theme.inactiveBadge}
                        buttonColor={theme.interactive}
                    />
                </View>
            </TouchableOpacity>
        );
    }
);

// Updated styles with better spacing and typography
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
        width: 48, // Slightly larger for better visibility
        height: 48,
        borderRadius: 12,
    },
    fallbackImage: {
        backgroundColor: "#D3D3D3",
    },
    contentContainer: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8, // Increased spacing
    },
    platform: {
        fontSize: 20, // Larger for better hierarchy
        fontWeight: "700",
    },
    price: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 8,
    },
    descriptionContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12, // Increased spacing
    },
    description: {
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 20, // Better readability
    },
    seeMore: {
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 6,
    },
    actionContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between", // Better spacing for buttons
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    statusText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    trustBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        backgroundColor: "#E0E0E0",
    },
    trustText: {
        color: "#333333",
        fontSize: 12,
        fontWeight: "600",
    },
    buyButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    buyButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
});