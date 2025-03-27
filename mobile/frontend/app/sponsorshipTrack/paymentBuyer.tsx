import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { CreditCard, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axiosInstance from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';

const CreditCardPayment: React.FC = () => {
  const params = useLocalSearchParams();
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [cardholderName, setCardholderName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sponsorship, setSponsorship] = useState<any>(null);
  const router = useRouter();

  // Get parameters from useLocalSearchParams
  const sponsorShipId = params.sponsorshipId as string;
  const type = (params.type as string) || 'sponsorship';
  const returnPath = params.returnPath as string;
  const [token, setToken] = useState<null | string>(null);

  // Platform fee (5% of the price)
  const platformFeePercentage = 0.05;
  const platformFee = sponsorship?.amount
    ? (sponsorship.amount * platformFeePercentage).toFixed(2)
    : '0.00';
  const totalAmount = sponsorship?.amount
    ? (sponsorship.amount + parseFloat(platformFee)).toFixed(2)
    : '0.00';

  // Get token
  const getToken = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      setToken(token);
      return token;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  };

  // Fetch sponsorship details
  const fetchSponsorshipDetails = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        throw new Error("No token found, please log in again.");
      }
      // Use the correct endpoint
      const response = await axiosInstance.get(`/api/one/${sponsorShipId}`);

      if (response?.data) {
        setSponsorship(response.data);
      } else {
        throw new Error("Invalid sponsorship data");
      }
    } catch (error: any) {
      console.error("Error fetching sponsorship details:", error);
      Alert.alert(
        "Error",
        "Failed to load sponsorship details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // Limit to 16 digits + 3 spaces
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    setCardNumber(formatCardNumber(text));
  };

  const handleExpiryDateChange = (text: string) => {
    setExpiryDate(formatExpiryDate(text));
  };

  const handleCvvChange = (text: string) => {
    setCvv(text.replace(/\D/g, '').slice(0, 3));
  };

  // Validation functions
  const validateCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    return /^[0-9]{16}$/.test(cleaned) && validateLuhn(cleaned);
  };

  const validateExpiryDate = (date: string) => {
    const [month, year] = date.split('/').map(Number);
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    return month >= 1 && month <= 12 &&
      year >= currentYear &&
      (year > currentYear || month >= currentMonth);
  };

  const validateCVV = (cvv: string) => {
    return /^[0-9]{3}$/.test(cvv); // Assuming 3-digit CVV for simplicity
  };

  const validateForm = (): boolean => {
    if (!validateCardNumber(cardNumber)) {
      Alert.alert('Error', 'Please enter a valid 16-digit card number');
      return false;
    }

    if (!validateExpiryDate(expiryDate)) {
      Alert.alert('Error', 'Please enter a valid future expiry date');
      return false;
    }

    if (!validateCVV(cvv)) {
      Alert.alert('Error', 'Please enter a valid 3-digit CVV');
      return false;
    }

    if (cardholderName.trim().length < 3) {
      Alert.alert('Error', 'Please enter the full cardholder name');
      return false;
    }

    if (!sponsorship?.amount || sponsorship.amount <= 0) {
      Alert.alert('Error', 'Invalid sponsorship price');
      return false;
    }

    return true;
  };

  // Luhn algorithm for card validation
  const validateLuhn = (number: string): boolean => {
    let sum = 0;
    let shouldDouble = false;

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return (sum % 10) === 0;
  };

  // Get card type based on number
  const getCardType = (number: string): string => {
    const firstDigit = number.charAt(0);
    const firstTwoDigits = number.substring(0, 2);

    if (number.startsWith('4')) return 'Visa';
    if (['51', '52', '53', '54', '55'].includes(firstTwoDigits)) return 'Mastercard';
    if (['34', '37'].includes(firstTwoDigits)) return 'American Express';
    if (['300', '301', '302', '303', '304', '305'].includes(number.substring(0, 3))) return 'Diners Club';
    if (number.startsWith('6')) return 'Discover';
    if (number.startsWith('35')) return 'JCB';
    return 'Unknown';
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const paymentData = {
        sponsorShipId,
        amount: parseFloat(totalAmount) * 100,
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardExpiryMm: expiryDate.split('/')[0],
        cardExpiryYyyy: `20${expiryDate.split('/')[1]}`,
        cardCvc: cvv,
        cardholderName: cardholderName
      };

      const response = await axiosInstance.post('/api/payment', paymentData, {
        headers: { Authorization: `Bearer ${token}`, }
      });

      if (response.data.message === "successfully initiated") {
        Alert.alert(
          "Success",
          "Payment processed successfully!",
          [
            {
              text: "Continue",
              onPress: () => {
                router.push({
                  pathname: "/sponsorshipTrack/deliveryBuyer",
                  params: {
                    sponsorshipId: sponsorShipId,
                    status: 'PAID'
                  }
                });
              }
            }
          ]
        );
      } else {
        throw new Error(response.data.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      Alert.alert(
        "Payment Failed",
        error.response?.data?.message || error.message || "Failed to process payment"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type === 'sponsorship' && sponsorShipId) {
      fetchSponsorshipDetails();
    }
  }, [type, sponsorShipId]);

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.header}
      >
        <CreditCard size={32} color="#FFF" />
        <ThemedText style={styles.headerTitle}>Add Payment</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Enter your payment details securely
        </ThemedText>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardPreview}>
          <LinearGradient
            colors={['#1E293B', '#334155']}
            style={styles.cardBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <CreditCard size={32} color="#FFF" style={styles.cardIcon} />
            <ThemedText style={styles.cardNumber}>
              {cardNumber || '•••• •••• •••• ••••'}
            </ThemedText>
            <View style={styles.cardDetails}>
              <View>
                <ThemedText style={styles.cardLabel}>CARDHOLDER NAME</ThemedText>
                <ThemedText style={styles.cardValue}>
                  {cardholderName || 'YOUR NAME'}
                </ThemedText>
              </View>
              <View>
                <ThemedText style={styles.cardLabel}>EXPIRES</ThemedText>
                <ThemedText style={styles.cardValue}>
                  {expiryDate || 'MM/YY'}
                </ThemedText>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Card Number</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor="#94A3B8"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <ThemedText style={styles.label}>Expiry Date</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor="#94A3B8"
                value={expiryDate}
                onChangeText={handleExpiryDateChange}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <ThemedText style={styles.label}>CVV</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="123"
                placeholderTextColor="#94A3B8"
                value={cvv}
                onChangeText={handleCvvChange}
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
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
              value={sponsorship?.amount ? sponsorship.amount.toFixed(2) : ''}
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
          onPress={handlePayment}
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
  cardPreview: {
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  cardBackground: {
    padding: 24,
    borderRadius: 16,
    height: 200,
  },
  cardIcon: {
    marginBottom: 24,
  },
  cardNumber: {
    fontSize: 22,
    color: '#FFF',
    letterSpacing: 2,
    marginBottom: 24,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    color: '#FFF',
    textTransform: 'uppercase',
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
  row: {
    flexDirection: 'row',
    marginBottom: 16,
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
});

export default CreditCardPayment;