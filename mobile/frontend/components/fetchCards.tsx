import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { UserCardProps } from "@/types/UserCardProps";

const UserCard: React.FC<UserCardProps & { isVerified?: boolean }> = ({
    role,
    name,
    score,
    gender,
    img,
    isVerified,
}) => {
    const calculateStars = (score: number) => {
        const stars = Math.round((score / 1.15) / 100 * 5);
        return "★".repeat(stars) + "☆".repeat(5 - stars);
    };

    return (
        <View style={styles.cardContainer}>
            {/* Verification Icon with Tooltip */}
            {isVerified && (
                <View style={styles.verificationContainer}>
                    <Icon name="checkmark-circle" size={22} color="#4CAF50" />
                    <Text style={styles.verificationText}>Verified</Text>
                </View>
            )}

            {/* Profile Image */}
            <View style={styles.imageContainer}>
                <Image source={{ uri: img }} style={styles.profileImage} />
            </View>

            {/* Text Content */}
            <View style={styles.textContainer}>
                <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                    {name}
                </Text>
                <Text style={styles.roleText}>
                    {role}
                </Text>
                <View style={styles.starContainer}>
                    <Text style={styles.starText}>{calculateStars(score)}</Text>
                </View>
                <Text style={styles.genderText}>Gender: {gender}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: "row",
        width: 280,
        height: 140,
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#fff",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
        overflow: "hidden",
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: "hidden",
        marginRight: 16,
        borderWidth: 2,
        borderColor: "#007BFF",
    },
    profileImage: {
        width: "100%",
        height: "100%",
    },
    textContainer: {
        flex: 1,
        justifyContent: "center",
    },
    nameText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    roleText: {
        fontSize: 12, // Same size as genderText
        color: "#666", // Same color as genderText
        marginBottom: 4,
    },
    starContainer: {
        backgroundColor: "#F5F5F5",
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 2,
        alignSelf: "flex-start",
        marginBottom: 4,
    },
    starText: {
        color: "#FFD700",
        fontSize: 14,
    },
    genderText: {
        fontSize: 12,
        color: "#666",
    },
    verificationContainer: {
        position: "absolute",
        top: 10,
        right: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    verificationText: {
        fontSize: 10,
        color: "#4CAF50",
        marginLeft: 4,
    },
});

export default UserCard;