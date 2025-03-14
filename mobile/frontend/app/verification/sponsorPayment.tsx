"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native"
import { Picker } from "@react-native-picker/picker"

interface PaymentFormProps {
    onSubmit: (formData: PaymentFormData) => void
}

interface PaymentFormData {
    email: string
    cardNumber: string
    expiryDate: string
    cvc: string
    cardholderName: string
    country: string
    zipCode: string
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<PaymentFormData>({
        email: "",
        cardNumber: "",
        expiryDate: "",
        cvc: "",
        cardholderName: "",
        country: "États-Unis",
        zipCode: "",
    })

    const formatCardNumber = (text: string) => {
        const cleaned = text.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
        // Add space after every 4 digits
        const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned
        return formatted.slice(0, 19) // Limit to 16 digits + 3 spaces
    }

    const formatExpiryDate = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "")
        if (cleaned.length >= 2) {
            return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
        }
        return cleaned
    }

    const handleSubmit = () => {
        onSubmit(formData)
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Payer par carte</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Courriel</Text>
                <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Informations de la carte</Text>
                <View style={styles.cardNumberContainer}>
                    <TextInput
                        style={styles.cardNumberInput}
                        value={formData.cardNumber}
                        onChangeText={(text) => {
                            const formatted = formatCardNumber(text)
                            setFormData({ ...formData, cardNumber: formatted })
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
                            value={formData.expiryDate}
                            onChangeText={(text) => {
                                const formatted = formatExpiryDate(text)
                                setFormData({ ...formData, expiryDate: formatted })
                            }}
                            placeholder="MM/AA"
                            keyboardType="numeric"
                            maxLength={5}
                        />
                    </View>
                    <View style={styles.cvcContainer}>
                        <TextInput
                            style={styles.cvcInput}
                            value={formData.cvc}
                            onChangeText={(text) => setFormData({ ...formData, cvc: text })}
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
                    placeholder="Nom du titulaire de la carte"
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Pays ou région</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={formData.country}
                        onValueChange={(value) => setFormData({ ...formData, country: value })}
                        style={styles.picker}
                    >
                        <Picker.Item label="États-Unis" value="États-Unis" />
                        <Picker.Item label="Canada" value="Canada" />
                        <Picker.Item label="France" value="France" />
                    </Picker>
                </View>

                <TextInput
                    style={styles.input}
                    value={formData.zipCode}
                    onChangeText={(text) => setFormData({ ...formData, zipCode: text })}
                    placeholder="Code postal"
                    keyboardType="numeric"
                />
            </View>

            <TouchableOpacity style={styles.payButton} onPress={handleSubmit}>
                <Text style={styles.payButtonText}>Payer</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Propulsé par stripe</Text>
                <View style={styles.footerLinks}>
                    <Text style={styles.footerLink}>Conditions d'utilisation</Text>
                    <Text style={styles.footerDot}>•</Text>
                    <Text style={styles.footerLink}>Confidentialité</Text>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 24,
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 6,
        marginBottom: 8,
    },
    picker: {
        height: 50,
    },
    payButton: {
        backgroundColor: "#0066ff",
        borderRadius: 6,
        padding: 16,
        alignItems: "center",
        marginTop: 8,
        marginBottom: 24,
    },
    payButtonText: {
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
})

export default PaymentForm

