import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { CreditCard, Shield, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axiosInstance from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { TabBar } from "@/components/navigation/TabBar";
import { useStatus } from '@/context/StatusContext';

const CreditCardVerification = () => {
  const router = useRouter();
  const { show, hide } = useStatus();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("verification");

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
      show({
        type: 'error',
        title: 'Invalid Card Number',
        message: 'Please enter a valid 16-digit card number',
        primaryAction: {
          label: 'OK',
          onPress: () => hide()
        }
      });
      return false;
    }

    if (!validateExpiryDate(expiryDate)) {
      show({
        type: 'error',
        title: 'Invalid Expiry Date',
        message: 'Please enter a valid future expiry date',
        primaryAction: {
          label: 'OK',
          onPress: () => hide()
        }
      });
      return false;
    }

    if (!validateCVV(cvv)) {
      show({
        type: 'error',
        title: 'Invalid CVV',
        message: 'Please enter a valid CVV (3-4 digits)',
        primaryAction: {
          label: 'OK',
          onPress: () => hide()
        }
      });
      return false;
    }

    if (cardholderName.trim().length < 3) {
      show({
        type: 'error',
        title: 'Invalid Name',
        message: 'Please enter the full cardholder name',
        primaryAction: {
          label: 'OK',
          onPress: () => hide()
        }
      });
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
        show({
          type: 'success',
          title: 'Card Verified',
          message: 'Credit card verified successfully',
          primaryAction: {
            label: 'Continue',
            onPress: () => {
              hide();
              router.push('/verification/Questionnaire');
            }
          }
        });
      }
    } catch (error: any) {
      console.error('Error verifying credit card:', error);
      show({
        type: 'error',
        title: 'Verification Failed',
        message: error.message || 'Failed to verify credit card. Please try again.',
        primaryAction: {
          label: 'Try Again',
          onPress: () => {
            hide();
            handleSubmit();
          }
        },
        secondaryAction: {
          label: 'Cancel',
          onPress: () => hide()
        }
      });
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

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    if (tabName !== "verification") {
      router.push(`./${tabName}`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.header}
      >
        <Shield size={32} color="#FFF" />
        <ThemedText style={styles.headerTitle}>Card Verification</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Add your credit card details securely
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
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <ThemedText style={styles.submitButtonText}>
            {loading ? 'Verifying...' : 'Verify Card'}
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.securityNote}>
          <Lock size={16} color="#64748B" />
          <ThemedText style={styles.securityText}>
            Your card details are encrypted and secure
          </ThemedText>
        </View>
      </ScrollView>

      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
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

export default CreditCardVerification; 