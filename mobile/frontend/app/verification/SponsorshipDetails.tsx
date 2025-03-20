import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Sponsorship } from "@/types/Sponsorship";

type RouteParams = {
    SponsorshipDetails: {
        sponsorship: Sponsorship;
    };
};

const SponsorshipDetails: React.FC = () => {
    const route = useRoute<RouteProp<RouteParams, "SponsorshipDetails">>();
    const { sponsorship } = route.params;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.platform}>{sponsorship.platform}</Text>
                <Text style={styles.price}>${sponsorship.price.toFixed(2)}</Text>
            </View>
            <Text style={styles.description}>{sponsorship.description}</Text>
            <Text style={styles.status}>{sponsorship.isActive ? "Active" : "Inactive"}</Text>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Buy</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#F5F5F5",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    platform: {
        fontSize: 24,
        fontWeight: "bold",
    },
    price: {
        fontSize: 24,
        color: "#007BFF",
    },
    description: {
        fontSize: 16,
        color: "#666",
        marginBottom: 20,
    },
    status: {
        fontSize: 16,
        color: "#34C759",
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#007BFF",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default SponsorshipDetails;
