import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import axiosInstance from '@/config';
import { ArrowLeft, CreditCard, IdCard, Shield, CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

export default function BecomeTraveler() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    idCardNumber: '',
    bankCardNumber: '',
  });

  const validateForm = () => {
    if (!formData.idCardNumber) {
      Alert.alert('Error', 'Please enter your ID card number');
      return false;
    }
    if (!formData.bankCardNumber) {
      Alert.alert('Error', 'Please enter your bank card number');
      return false;
    }
    // Basic validation for card numbers
    if (formData.idCardNumber.length < 8) {
      Alert.alert('Error', 'Please enter a valid ID card number');
      return false;
    }
    if (formData.bankCardNumber.length < 16) {
      Alert.alert('Error', 'Please enter a valid bank card number');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user || !user.id) {
      Alert.alert('Error', 'You must be logged in to become a traveler');
      return;
    }

    try {
      setIsLoading(true);

      const response = await axiosInstance.post('/api/travelers/apply', {
        userId: user.id,
        idCard: formData.idCardNumber,
        bankCard: formData.bankCardNumber,
      });

      if (response.data.success) {
        setApplicationSubmitted(true);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit application');
      }
    } catch (error: any) {
      console.error('Error submitting traveler application:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit application';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (applicationSubmitted) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Application Submitted</ThemedText>
        </View>

        <View style={styles.successContainer}>
          <CheckCircle size={80} color="#4CAF50" />
          <ThemedText style={styles.successTitle}>Thank You!</ThemedText>
          <ThemedText style={styles.successMessage}>
            Your traveler application has been submitted successfully. Our admin team will review your information and verify your account soon.
          </ThemedText>
          <ThemedText style={styles.successSubMessage}>
            You will receive a notification once your application is approved.
          </ThemedText>
          
          <TouchableOpacity 
            style={styles.returnButton}
            onPress={() => router.push('/goodPost/goodpostpage')}
          >
            <ThemedText style={styles.returnButtonText}>Return to Goods Posts</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Become a Traveler</ThemedText>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.infoCard}>
            <Shield size={24} color="#3a86ff" />
            <ThemedText style={styles.infoTitle}>Verification Required</ThemedText>
            <ThemedText style={styles.infoText}>
              To become a verified traveler, we need to verify your identity and payment information. This helps us maintain a safe and trusted community.
            </ThemedText>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <IdCard size={20} color="#3a86ff" />
                <ThemedText style={styles.cardTitle}>Identity Verification</ThemedText>
              </View>
              
              <ThemedText style={styles.label}>ID Card Number</ThemedText>
              <ThemedText style={styles.sublabel}>Please enter your government-issued ID card number</ThemedText>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter ID card number"
                  value={formData.idCardNumber}
                  onChangeText={(text) => setFormData({ ...formData, idCardNumber: text })}
                  keyboardType="numeric"
                  maxLength={20}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <CreditCard size={20} color="#3a86ff" />
                <ThemedText style={styles.cardTitle}>Payment Information</ThemedText>
              </View>
              
              <ThemedText style={styles.label}>Bank Card Number</ThemedText>
              <ThemedText style={styles.sublabel}>Please enter your bank card number (last 16 digits)</ThemedText>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter bank card number"
                  value={formData.bankCardNumber}
                  onChangeText={(text) => setFormData({ ...formData, bankCardNumber: text })}
                  keyboardType="numeric"
                  maxLength={16}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.submitButtonText}>Submit Application</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#e6f2ff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  sublabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#3a86ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#3a86ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#a0c4ff',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
    color: '#333',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    lineHeight: 24,
    marginBottom: 16,
  },
  successSubMessage: {
    fontSize: 14,
    textAlign: 'center',
    color: '#777',
    marginBottom: 32,
  },
  returnButton: {
    backgroundColor: '#3a86ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#3a86ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  returnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
