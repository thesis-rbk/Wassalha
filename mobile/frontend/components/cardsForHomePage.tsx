import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Animated,
    AccessibilityInfo,
} from "react-native";
import type { OrderfetchCardProps } from "../types/Sponsorship";
import { Plane, Send } from "lucide-react-native";
import { formatDistanceToNow } from "date-fns";
import * as Haptics from "expo-haptics";

const OrderCard: React.FC<OrderfetchCardProps> = ({ order, onPress }) => {
    const {
        userName = order.user?.name || "Unknown User",
        requestTime = order.date,
        goods = order.goods,
        origin = order.goodsDestination || "Unknown Origin",
        destination = order.goodsLocation || "Unknown Destination",
    } = order;

    const userImageUrl = order.user?.profile?.image?.url;
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(30)).current;
    const [isLoading, setIsLoading] = React.useState(false);

    const timeAgo = React.useMemo(() => {
        if (!requestTime) return "N/A";
        try {
            const dateObj = typeof requestTime === "string" ? new Date(requestTime) : requestTime;
            return formatDistanceToNow(dateObj, { addSuffix: true });
        } catch {
            return "N/A";
        }
    }, [requestTime]);

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 7, useNativeDriver: true }),
        ]).start(() => {
            AccessibilityInfo.announceForAccessibility(
                `${userName} requested ${goods?.name || "an item"} from ${origin} to ${destination} forTND ${goods?.price || "N/A"}, ${timeAgo}`
            );
        });
    }, [userName, goods?.name, origin, destination, goods?.price, timeAgo]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.92, friction: 6, useNativeDriver: true }).start();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    };

    const handlePress = async () => {
        setIsLoading(true);
        await onPress();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
        setIsLoading(false);
    };

    return (
        <Animated.View
            style={[
                styles.card,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
            accessible={true}
            accessibilityLabel={`${userName} requested ${goods?.name || "an item"} from ${origin} to ${destination}, ${timeAgo}, priced at TND${goods?.price || "N/A"}`}
        >
            {/* Image Section (70% of height) */}
            <View style={styles.imageContainer}>
                {goods?.image?.url ? (
                    <Image
                        source={{ uri: goods.image.url }}
                        style={styles.goodsImage}
                        resizeMode="cover"
                        accessibilityLabel={`${goods.name} image`}
                        onError={() => console.log("Image failed to load")}
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                )}
                <View style={styles.gradientOverlay} />
                {/* User Info Overlay */}
                <View style={styles.userContainer}>
                    {userImageUrl ? (
                        <Image
                            source={{ uri: userImageUrl }}
                            style={styles.userAvatar}
                            resizeMode="cover"
                            accessibilityLabel={`${userName}'s profile picture`}
                        />
                    ) : (
                        <View style={styles.userInitialContainer}>
                            <Text style={styles.userInitialText}>
                                {userName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{userName}</Text>
                        <Text style={styles.requestTime}>{timeAgo}</Text>
                    </View>
                </View>
                {/* Send Button at Bottom-Right of Image */}
                <TouchableOpacity
                    style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
                    onPress={handlePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                    disabled={isLoading}
                    accessibilityRole="button"
                    accessibilityHint="Send an offer for this order"
                >
                    <Animated.View style={[styles.buttonContent, { transform: [{ scale: scaleAnim }] }]}>
                        <Send size={18} color="#fff" style={styles.sendIcon} />
                        <Text style={styles.sendButtonText}>
                            {isLoading ? "Sending Offer..." : "Send Offer"}
                        </Text>
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* White Info Section (30% of height) */}
            <View style={styles.infoContainer}>
                <Text style={styles.productName} numberOfLines={1}>
                    {goods?.name || "N/A"}
                </Text>
                <View style={styles.routeContainer}>
                    <Text style={styles.locationText} numberOfLines={1}>
                        {origin}
                    </Text>
                    <View style={styles.planeContainer}>
                        <Plane size={18} color="#4A90E2" style={styles.planeIcon} />
                    </View>
                    <Text style={styles.locationText} numberOfLines={1}>
                        {destination}
                    </Text>
                </View>
                <Text style={styles.price}>TND {goods?.price?.toFixed(2) || "N/A"}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 28,
        overflow: "hidden",
        marginVertical: 20,
        marginHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
        elevation: 10,
        height: 450,
    },
    imageContainer: {
        width: "100%",
        height: "70%",
        position: "relative",
    },
    goodsImage: {
        width: "100%",
        height: "100%",
    },
    placeholderImage: {
        width: "100%",
        height: "100%",
        backgroundColor: "#E8ECEF",
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        color: "#6B7280",
        fontSize: 20,
        fontWeight: "500",
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
    },
    userContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        borderWidth: 2,
        borderColor: "#fff",
    },
    userInitialContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#4A90E2",
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    userInitialText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "700",
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: "500",
        color: "#fff",
    },
    requestTime: {
        fontSize: 14,
        color: "#D1D5DB",
        marginTop: 4,
    },
    infoContainer: {
        width: "100%",
        height: "30%",
        backgroundColor: "#fff",
        padding: 16,
    },
    productName: {
        fontSize: 20,
        fontWeight: "500",
        color: "#1F2937",
        marginBottom: 4,
    },
    routeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    locationText: {
        fontSize: 14,
        color: "#6B7280",
        flex: 1,
    },
    planeContainer: {
        paddingHorizontal: 8,
    },
    planeIcon: {
        transform: [{ rotate: "45deg" }],
    },
    price: {
        fontSize: 18, // Reduced from 22
        fontWeight: "600", // Slightly lighter than 700
        color: "#000000", // Changed from #4A90E2 to black
    },
    sendButton: {
        borderRadius: 12,
        backgroundColor: "#FFD700",
        position: "absolute",
        bottom: 16,
        right: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    sendButtonDisabled: {
        backgroundColor: "#D4AF37",
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    sendButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
        marginLeft: 6,
    },
    sendIcon: {
        transform: [{ rotate: "45deg" }],
    },
});

export default OrderCard;