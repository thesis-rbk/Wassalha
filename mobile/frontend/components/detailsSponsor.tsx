import React from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { useColorScheme } from "react-native";
import { Image as ExpoImage } from "expo-image";
import platformImages from "../types/Sponsorship"; // Adjust path as needed
import { SponsorshipDetailsModalProps } from "../types/Sponsorship"
import { THEME } from "../constants/theme";
// Define props interface based on your Sponsorship model
// Theme colors


const SponsorshipDetailsModal: React.FC<SponsorshipDetailsModalProps> = ({
    visible,
    onClose,
    platform,
    price,
    description,
    duration,
    isActive,
    reviews,
}) => {
    const colorScheme = useColorScheme() ?? "light";
    const theme = THEME[colorScheme];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View
                    style={[
                        styles.container,
                        {
                            backgroundColor: theme.background,
                            shadowColor: theme.shadow,
                            shadowOpacity: theme.shadowOpacity,
                        },
                    ]}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Header with Platform and Image */}
                        <View style={styles.header}>
                            <ExpoImage
                                source={
                                    platformImages[platform as keyof typeof platformImages] ||
                                    platformImages["OTHER"]
                                }
                                style={styles.platformImage}
                                resizeMode="contain"
                                accessibilityLabel={`${platform} logo`}
                            />
                            <Text style={[styles.platformTitle, { color: theme.primaryText }]}>
                                {platform}
                            </Text>
                            <View
                                style={[
                                    styles.statusIndicator,
                                    { backgroundColor: isActive ? theme.active : theme.inactive },
                                ]}
                            >
                                <Text style={styles.statusText}>
                                    {isActive ? "Active" : "Inactive"}
                                </Text>
                            </View>
                        </View>

                        {/* Details Section */}
                        <View style={styles.detailsSection}>
                            <DetailItem
                                label="Price"
                                value={price}
                                labelColor={theme.secondaryText}
                                valueColor={theme.primaryText}
                            />
                            <DetailItem
                                label="Duration"
                                value={`${duration} days`}
                                labelColor={theme.secondaryText}
                                valueColor={theme.primaryText}
                            />
                            <DetailItem
                                label="Description"
                                value={description}
                                labelColor={theme.secondaryText}
                                valueColor={theme.primaryText}
                                isDescription
                            />

                            {/* Reviews */}
                            {reviews.length > 0 && (
                                <View style={styles.reviewsSection}>
                                    <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>
                                        Reviews
                                    </Text>
                                    {reviews.map((review, index) => (
                                        <View key={index} style={styles.reviewItem}>
                                            <Text style={[styles.rating, { color: theme.primaryText }]}>
                                                {review.rating}/5
                                            </Text>
                                            <Text style={[styles.comment, { color: theme.secondaryText }]}>
                                                {review.comment}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Close Button */}
                        <TouchableOpacity
                            style={[styles.closeBtn, { backgroundColor: theme.accent }]}
                            onPress={onClose}
                        >
                            <Text style={styles.closeBtnText}>Close</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

// Reusable Detail Item Component
const DetailItem: React.FC<{
    label: string;
    value: string;
    labelColor: string;
    valueColor: string;
    isDescription?: boolean;
}> = ({ label, value, labelColor, valueColor, isDescription }) => (
    <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, { color: labelColor }]}>{label}:</Text>
        <Text
            style={[
                isDescription ? styles.descriptionText : styles.detailValue,
                { color: valueColor },
            ]}
        >
            {value}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        width: "85%",
        maxHeight: "75%",
        borderRadius: 16,
        padding: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 5,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    platformImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 12,
    },
    platformTitle: {
        fontSize: 22,
        fontWeight: "bold",
        flex: 1,
    },
    statusIndicator: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 16,
    },
    statusText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    detailsSection: {
        marginBottom: 20,
    },
    detailRow: {
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: "500",
    },
    detailValue: {
        fontSize: 16,
        fontWeight: "400",
        marginTop: 4,
    },
    descriptionText: {
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 20,
        marginTop: 4,
    },
    reviewsSection: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
    },
    reviewItem: {
        marginBottom: 12,
        paddingLeft: 8,
    },
    rating: {
        fontSize: 16,
        fontWeight: "500",
    },
    comment: {
        fontSize: 14,
        fontWeight: "400",
        marginTop: 2,
    },
    closeBtn: {
        alignSelf: "center",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    closeBtnText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default SponsorshipDetailsModal;