import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { CreditCard } from 'lucide-react-native';
import axiosInstance from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
const [token, setToken] = useState<null | string>(null);


const CreditCardVerification = () => {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [loading, setLoading] = useState(false);

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

  // Add these validation functions at the top of the file
  const validateCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    return /^[0-9]{16}$/.test(cleaned);
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
    return /^[0-9]{3,4}$/.test(cvv);
  };

  // Update the validateForm function
  const validateForm = () => {
    if (!validateCardNumber(cardNumber)) {
      Alert.alert('Error', 'Please enter a valid 16-digit card number');
      return false;
    }

    if (!validateExpiryDate(expiryDate)) {
      Alert.alert('Error', 'Please enter a valid future expiry date');
      return false;
    }

    if (!validateCVV(cvv)) {
      Alert.alert('Error', 'Please enter a valid CVV (3-4 digits)');
      return false;
    }

    if (cardholderName.trim().length < 3) {
      Alert.alert('Error', 'Please enter the full cardholder name');
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

      const decoded: any = jwtDecode(jwtToken);

      // Parse expiry date
      const [expiryMonth, expiryYear] = expiryDate.split('/');

      // Basic card validation (Luhn algorithm)
      const isValidCard = validateCreditCard(cardNumber.replace(/\s/g, ''));
      if (!isValidCard) {
        throw new Error('Invalid card number');
      }

      // Get card type
      const cardType = getCardType(cardNumber.replace(/\s/g, ''));
      const last4 = cardNumber.replace(/\s/g, '').slice(-4);

      // Send to backend
      const response = await axiosInstance.post(
        `/api/users/verify-credit-card/${decoded.id}`,
        {
          cardholderName,
          last4,
          brand: cardType,
          expiryMonth,
          expiryYear
        },
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Credit card verified successfully', [
          { text: 'OK', onPress: () => router.push('/verification/Questionnaire') }
        ]);
      }
    } catch (error: any) {
      console.error('Error verifying credit card:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to verify credit card. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Basic Luhn algorithm for card validation
  const validateCreditCard = (number: string) => {
    let sum = 0;
    let shouldDouble = false;

    // Loop through values starting from the rightmost digit
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
  const getCardType = (number: string) => {
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

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <CreditCard size={40} color={Colors.light.primary} />
        <ThemedText style={styles.title}>Credit Card Verification</ThemedText>
        <ThemedText style={styles.subtitle}>
          Add your credit card details for verification
        </ThemedText>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Card Number</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor="#999"
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            keyboardType="numeric"
            maxLength={19}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <ThemedText style={styles.label}>Expiry Date</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
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
            placeholder="John Doe"
            placeholderTextColor="#999"
            value={cardholderName}
            onChangeText={setCardholderName}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <ThemedText style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify Card'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedText style={styles.disclaimer}>
        Your card details are securely encrypted and will only be used for verification purposes.
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    marginTop: 'auto',
  },
  button: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
});

export default CreditCardVerification; 