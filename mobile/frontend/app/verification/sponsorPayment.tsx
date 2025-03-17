"use client";

import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from "react-native";
import axiosInstance from "@/config";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, RouteProp } from '@react-navigation/native';
import { decode as atob } from 'base-64';
import { PaymentFormProps, PaymentFormData, RouteParams } from "@/types/Payment";
import ReviewComponent from "./reviewSponsor";
const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, amount }) => {
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const idy = route.params?.id;
    const [oneData, setOneData] = useState<{ price: number; sponsor: { id: number } } | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [ids, setId] = useState<number>(0);
    const [isPaymentSuccessful, setIsPaymentSuccessful] = useState<boolean>(false);
    const [formData, setFormData] = useState<PaymentFormData>({
        email: "",
        cardNumber: "",
        cardExpiryMm: "",
        cardExpiryYyyy: "",
        cardCvc: "",
        cardholderName: "",
        postalCode: "",
    });

    console.log("idssss", idy);

    const decodeJWT = (token: string) => {
        try {
            const base64Url = token.split('.')[1];  // Payload part of the token
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decodedData = JSON.parse(atob(base64));
            return decodedData;
        } catch (error) {
            console.error("Error decoding token:", error);
            return null;
        }
    };

    const formatCardNumber = (text: string) => {
        const cleaned = text.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        // Add space after every 4 digits
        const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
        return formatted.slice(0, 19); // Limit to 16 digits + 3 spaces
    };

    const tokenVerif = async () => {
        const tokeny = await AsyncStorage.getItem('jwtToken');
        const decodedToken = decodeJWT(tokeny as string);
        setId(decodedToken?.id);
        console.log("token:", tokeny);
        setToken(tokeny);
    };

    const formatExpiryDate = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        if (cleaned.length >= 2) {
            return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
        }
        return cleaned;
    };

    const getData = async () => {
        try {
            const response = await axiosInstance.get(`/api/one/${idy}`);
            console.log("hello from payment:", response.data);
            setOneData(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleSubmit = async () => {
        // Show confirmation alert before proceeding with payment
        Alert.alert(
            "Confirm Payment",
            `Are you sure you want to pay ${oneData?.price} EUR for the subscription?`,
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Payment Cancelled"),
                    style: "cancel",
                },
                {
                    text: "Confirm",
                    onPress: async () => {
                        try {
                            const checkOut = await axiosInstance.post('/api/payment', {
                                email: formData.email,
                                cardNumber: formData.cardNumber.replace(/\s+/g, ""), // Remove spaces
                                cardExpiryMm: formData.cardExpiryMm,
                                cardExpiryYyyy: formData.cardExpiryYyyy,
                                cardCvc: formData.cardCvc,
                                cardholderName: formData.cardholderName,
                                postalCode: formData.postalCode,
                                amount: Math.round(oneData?.price || 0), // Use price from the API response
                                sponsorShipId: oneData?.sponsor.id,
                                buyerId: ids,
                            });
                            console.log("Payment response:", checkOut.data);

                            // Show success alert
                            Alert.alert(
                                "Payment Successful",
                                "Your payment was successful. You will receive the subscription details in your email within 48 hours.",
                                [{ text: "OK", onPress: () => setIsPaymentSuccessful(true) }]
                            );

                            // Call onSubmit with formData
                            onSubmit(formData);

                        } catch (err) {
                            console.log(err);
                        }
                    },
                },
            ]
        );
    };

    useEffect(() => {
        getData();
        tokenVerif()
    }, []);

    return (
        <ScrollView style={styles.container}>
            {/* Displaying the amount to be paid in Euros */}
            <Text style={styles.amount}>Amount: {oneData?.price}</Text>

            {isPaymentSuccessful ? (
                // Show the review component if payment is successful
                <ReviewComponent />
            ) : (
                // Show the payment form fields if payment is not yet successful
                <>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Card Information</Text>
                        <View style={styles.cardNumberContainer}>
                            <TextInput
                                style={styles.cardNumberInput}
                                value={formData.cardNumber}
                                onChangeText={(text) => {
                                    const formatted = formatCardNumber(text);
                                    setFormData({ ...formData, cardNumber: formatted });
                                }}
                                keyboardType="numeric"
                                placeholder="1234 1234 1234 1234"
                            />
                            <View style={styles.cardIcons}>
                                <Image
                                    source={{ uri: "https://cdn.visa.com/v2/assets/images/logos/visa/blue/logo.png" }}
                                    style={styles.cardIcon}
                                    resizeMode="contain"
                                />
                                <Image
                                    source={{
                                        uri: "https://brand.mastercard.com/content/dam/mccom/brandcenter/thumbnails/mastercard_vrt_pos_92px_2x.png",
                                    }}
                                    style={styles.cardIcon}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>

                        <View style={styles.cardDetailsRow}>
                            <View style={styles.expiryContainer}>
                                <TextInput
                                    style={styles.expiryInput}
                                    value={formData.cardExpiryMm}
                                    onChangeText={(text) => setFormData({ ...formData, cardExpiryMm: text })}
                                    placeholder="MM"
                                    keyboardType="numeric"
                                    maxLength={2}
                                />
                            </View>
                            <View style={styles.expiryContainer}>
                                <TextInput
                                    style={styles.expiryInput}
                                    value={formData.cardExpiryYyyy}
                                    onChangeText={(text) => setFormData({ ...formData, cardExpiryYyyy: text })}
                                    placeholder="YYYY"
                                    keyboardType="numeric"
                                    maxLength={4}
                                />
                            </View>
                            <View style={styles.cvcContainer}>
                                <TextInput
                                    style={styles.cvcInput}
                                    value={formData.cardCvc}
                                    onChangeText={(text) => setFormData({ ...formData, cardCvc: text })}
                                    placeholder="CVC"
                                    keyboardType="numeric"
                                    maxLength={4}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <TextInput
                            style={styles.input}
                            value={formData.cardholderName}
                            onChangeText={(text) => setFormData({ ...formData, cardholderName: text })}
                            placeholder="Cardholder's Name"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Postal Code</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.postalCode}
                            onChangeText={(text) => setFormData({ ...formData, postalCode: text })}
                            placeholder="Postal Code"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.spacer} />

                    <TouchableOpacity style={styles.checkoutButton} onPress={handleSubmit}>
                        <Text style={styles.checkoutButtonText}>Checkout</Text>
                    </TouchableOpacity>
                </>
            )}

            <View style={styles.footer}>
                <Text style={styles.footerText}>Powered by Stripe</Text>
                <View style={styles.footerLinks}>
                    <Text style={styles.footerLink}>Terms of Service</Text>
                    <Text style={styles.footerDot}>•</Text>
                    <Text style={styles.footerLink}>Privacy</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        padding: 16,
    },
    amount: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 16,
        color: "#4CAF50", // Green color for the amount
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 6,
        padding: 12,
        fontSize: 16,
        marginBottom: 8,
    },
    cardNumberContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 6,
        marginBottom: 8,
    },
    cardNumberInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
    },
    cardIcons: {
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 12,
    },
    cardIcon: {
        width: 32,
        height: 20,
        marginLeft: 4,
    },
    cardDetailsRow: {
        flexDirection: "row",
        marginBottom: 8,
    },
    expiryContainer: {
        flex: 1,
        marginRight: 8,
    },
    expiryInput: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 6,
        padding: 12,
        fontSize: 16,
    },
    cvcContainer: {
        flex: 1,
        marginLeft: 8,
    },
    cvcInput: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 6,
        padding: 12,
        fontSize: 16,
    },
    spacer: {
        flex: 1,
        minHeight: 20,
    },
    checkoutButton: {
        backgroundColor: "#0066ff",
        borderRadius: 6,
        padding: 16,
        alignItems: "center",
        marginTop: 8,
        marginBottom: 24,
    },
    checkoutButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    footer: {
        alignItems: "center",
    },
    footerText: {
        color: "#6b7280",
        fontSize: 14,
        marginBottom: 8,
    },
    footerLinks: {
        flexDirection: "row",
        alignItems: "center",
    },
    footerLink: {
        color: "#6b7280",
        fontSize: 14,
        textDecorationLine: "underline",
    },
    footerDot: {
        color: "#6b7280",
        marginHorizontal: 8,
    },
});

export default PaymentForm;
