import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Image } from 'react-native';
import { useRoute, type RouteProp, useNavigation } from "@react-navigation/native";
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { CreditCard, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axiosInstance from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { RouteParams } from "@/types/Sponsorship";
import NavigationProp from "@/types/navigation";
import type { Sponsorship } from "@/types/Sponsorship";

// Stripe imports
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe with your publishable key
const stripePromise = loadStripe('your_stripe_publishable_key_here'); // Replace with your Stripe publishable key

// Real icons (replace with actual paths to your icon files)
const BNAIcon: React.FC = () => (
    <Image
        source={{ uri: 'https://e7.pngegg.com/pngimages/351/496/png-clipart-attijariwafa-bank-logo-attijari-bank-tijari-wafa-bank-bank-angle-text.png' }}
        style={styles.bankIcon}
    />
);

const STBIcon: React.FC = () => (
    <Image
        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/BH_BANK.png/800px-BH_BANK.png' }}
        style={styles.bankIcon}
    />
);

// Define types for decoded JWT token
interface DecodedToken {
    sub?: string;
    id?: string;
}

const CreditCardPayment: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProp<RouteParams, "SponsorshipDetails">>();
    const { id } = route.params;
    const [cardholderName, setCardholderName] = useState<string>('');
    const [detectedBank, setDetectedBank] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [sponsorship, setSponsorship] = useState<Sponsorship | null>(null);
    const [clientSecret, setClientSecret] = useState<string>(''); // To store clientSecret from backend
    const stripe = useStripe();
    const elements = useElements();

    // Platform fee (5% of the price)
    const platformFeePercentage = 0.05;
    const platformFee = sponsorship?.price
        ? (sponsorship.price * platformFeePercentage).toFixed(2)
        : '0.00';
    const totalAmount = sponsorship?.price
        ? (sponsorship.price + parseFloat(platformFee)).toFixed(2)
        : '0.00';

    // Get the sponsorship details
    const fetchSponsorshipDetails = async () => {
        try {
            const response = await axiosInstance.get<Sponsorship>(`/api/one/${id}`);
            setSponsorship(response.data);
        } catch (error) {
            console.error("Error fetching sponsorship details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCardChange = (event: { card?: { number: string } }) => {
        const cardNumber = event?.card?.number || '';
        if (cardNumber.length >= 4) {
            const firstDigit = cardNumber.charAt(0);
            if (firstDigit === '2') setDetectedBank('BNA');
            else if (firstDigit === '3') setDetectedBank('STB');
            else setDetectedBank('');
        } else {
            setDetectedBank('');
        }
    };

    const validateForm = (): boolean => {
        if (cardholderName.trim().length < 3) {
            Alert.alert('Error', 'Please enter the full cardholder name');
            return false;
        }
        if (!sponsorship?.price || sponsorship.price <= 0) {
            Alert.alert('Error', 'Invalid sponsorship price');
            return false;
        }
        if (!detectedBank) {
            Alert.alert('Error', 'Only BNA and STB cards are supported');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const jwtToken = await AsyncStorage.getItem('jwtToken');
            if (!jwtToken) throw new Error('No token found');

            const decoded: DecodedToken = jwtDecode(jwtToken);
            const buyerId = decoded.sub || decoded.id;

            if (!buyerId) throw new Error('Buyer ID not found in token');

            // Prepare payload for backend
            const payload = {
                buyerId: parseFloat(buyerId),
                amount: parseFloat(totalAmount),
                cardholderName,
                postalCode: '', // Set as empty string since backend expects it
                sponsorShipId: parseFloat(sponsorship?.sponsor.id),
                cardNumber: '', // Leave empty as we'll use Stripe Elements
                cardExpiryMm: '', // Will be handled by Stripe Elements
                cardExpiryYyyy: '', // Will be handled by Stripe Elements
                cardCvc: '', // Will be handled by Stripe Elements
            };

            // Send payment request to backend
            const response = await axiosInstance.post<{
                clientSecret: string;
                status: string;
            }>(`/api/payment`, payload, {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                },
            });

            const { clientSecret, status } = response.data;

            if (!clientSecret || !stripe || !elements) {
                throw new Error('Stripe initialization failed or missing clientSecret');
            }

            setClientSecret(clientSecret);

            // Handle Stripe payment confirmation
            if (status === 'requires_action') {
                const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: elements.getElement(CardElement)!,
                        billing_details: {
                            name: cardholderName,
                        },
                    },
                });

                if (error) {
                    throw new Error(error.message);
                } else if (paymentIntent?.status === 'succeeded') {
                    Alert.alert('Success', 'Payment completed successfully', [
                        { text: 'OK' }
                    ]);
                }
            } else if (status === 'succeeded') {
                Alert.alert('Success', 'Payment completed successfully', [
                    { text: 'OK' }
                ]);
            }
        } catch (error: unknown) {
            console.error('Error processing payment:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to process payment. Please try again.';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSponsorshipDetails();
    }, []);

    return (
        <ThemedView style={styles.container}>
            <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                style={styles.header}
            >
                <ThemedText style={styles.headerTitle}>Add Payment</ThemedText>
                <ThemedText style={styles.headerSubtitle}>
                    Enter your payment details securely
                </ThemedText>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Card Details</ThemedText>
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#1E293B',
                                        '::placeholder': { color: '#94A3B8' },
                                    },
                                    invalid: { color: '#EF4444' },
                                },
                            }}
                            onChange={handleCardChange}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Cardholder Name</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Name as shown on card"
                            placeholderTextColor="#94A3B8"
                            value={cardholderName}
                            onChangeText={setCardholderName}
                            autoCapitalize="characters"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Amount (TND)</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter amount"
                            placeholderTextColor="#94A3B8"
                            value={sponsorship?.price ? sponsorship.price.toFixed(2) : ''}
                            editable={false}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.feeContainer}>
                        <ThemedText style={styles.feeLabel}>Platform Fee (5%):</ThemedText>
                        <ThemedText style={styles.feeValue}>{platformFee} TND</ThemedText>
                    </View>

                    <View style={styles.feeContainer}>
                        <ThemedText style={styles.feeLabel}>Total Amount:</ThemedText>
                        <ThemedText style={styles.feeValue}>{totalAmount} TND</ThemedText>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <ThemedText style={styles.submitButtonText}>
                        {loading ? 'Processing...' : 'Submit Payment'}
                    </ThemedText>
                </TouchableOpacity>

                <View style={styles.securityNote}>
                    <Lock size={16} color="#64748B" />
                    <ThemedText style={styles.securityText}>
                        Your payment details are encrypted and secure
                    </ThemedText>
                </View>
            </ScrollView>
        </ThemedView>
    );
};

// Wrap the component with Stripe Elements provider
const CreditCardPaymentWithStripe: React.FC = () => (
    <Elements stripe={stripePromise}>
        <CreditCardPayment />
    </Elements>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        padding: 24,
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFF',
        marginTop: 12,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 8,
        textAlign: 'center',
    },
    content: {
        padding: 20,
    },
    form: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1E293B',
    },
    feeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    feeLabel: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    feeValue: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: Colors.light.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    securityNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    securityText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#64748B',
    },
    bankIcon: {
        width: 32,
        height: 32,
        marginLeft: 8,
    },
});

export default CreditCardPaymentWithStripe;