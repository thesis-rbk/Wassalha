import type React from "react"
import { View, StyleSheet, TouchableOpacity, Text } from "react-native"
import { useColorScheme } from "react-native"
import { Image as ExpoImage } from "expo-image"
import { useNavigation } from "@react-navigation/native"
import platformImages from "../types/Sponsorship"
import type NavigationProp from "@/types/navigation"
// Define the props interface for TypeScript
interface SponsorshipCardProps {
    id: number // Add the ID prop
    platform: string
    price: string
    description: string
    isActive: boolean
    onPress: () => void
    onBuyPress: () => void
}

// Constants for theme colors
const COLORS = {
    light: {
        background: "#FFFFFF",
        shadow: "#4A4A4A",
        shadowOpacity: 0.2,
        platformText: "#1A1A1A",
        secondaryText: "#666666",
        interactive: "#007BFF",
        activeBadge: "#34C759",
        inactiveBadge: "#FF3B30",
    },
    dark: {
        background: "#1C2526",
        shadow: "#000",
        shadowOpacity: 0.4,
        platformText: "#E0E0E0",
        secondaryText: "#A0A0A0",
        interactive: "#66B2FF",
        activeBadge: "#34C759",
        inactiveBadge: "#FF3B30",
    },
}

// Constants for description truncation
const DESCRIPTION_MAX_LENGTH = 20

// Component to render the platform image
const PlatformImage: React.FC<{ platform: string }> = ({ platform }) => {
    const platformImage = platformImages[platform as keyof typeof platformImages] || platformImages["OTHER"]

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
    )
}

// Component to render the description with "See More" link
const DescriptionWithSeeMore: React.FC<{
    description: string
    onPress: () => void
    textColor: string
    linkColor: string
}> = ({ description, onPress, textColor, linkColor }) => {
    const truncatedDescription =
        description.length > DESCRIPTION_MAX_LENGTH ? `${description.substring(0, DESCRIPTION_MAX_LENGTH)}...` : description

    return (
        <View style={styles.descriptionContainer}>
            <Text style={[styles.description, { color: textColor }]}>{truncatedDescription}</Text>
            {description.length > DESCRIPTION_MAX_LENGTH && (
                <TouchableOpacity onPress={onPress}>
                    <Text style={[styles.seeMore, { color: linkColor }]}>See More</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

// Component to render the action buttons and status
const ActionButtons: React.FC<{
    isActive: boolean
    onBuyPress: () => void
    activeColor: string
    inactiveColor: string
    buttonColor: string
}> = ({ isActive, onBuyPress, activeColor, inactiveColor, buttonColor }) => (
    <View style={styles.actionContainer}>
        <TouchableOpacity onPress={onBuyPress} style={[styles.buyButton, { backgroundColor: buttonColor }]}>
            <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
    </View>
)

export const SponsorshipCard: React.FC<SponsorshipCardProps> = ({
    id, // Destructure the ID prop
    platform,
    price,
    description,
    isActive,
    onPress,
    onBuyPress,
}) => {
    const colorScheme = useColorScheme() ?? "light"
    const theme = COLORS[colorScheme]
    const navigation = useNavigation<NavigationProp>()

    const handleSeeMore = () => {
        navigation.navigate("verification/SponsorshipDetails", { id })
    }

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
            accessibilityLabel={`${platform} sponsorship card`}
        >
            <PlatformImage platform={platform} />

            <View style={styles.contentContainer}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.platform, { color: theme.platformText }]}>{platform}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: isActive ? theme.activeBadge : theme.inactiveBadge }]}>
                        <Text style={styles.statusText}>{isActive ? "Active" : "Inactive"}</Text>
                    </View>
                </View>
                <Text style={[styles.price, { color: theme.secondaryText }]}>Price: {price}</Text>
                <DescriptionWithSeeMore
                    description={description}
                    onPress={handleSeeMore} // Use the handleSeeMore function
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
    )
}

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
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    platform: {
        fontSize: 18,
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
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        fontWeight: "400",
    },
    seeMore: {
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 4,
    },
    actionContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    statusText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    buyButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    buyButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
})

