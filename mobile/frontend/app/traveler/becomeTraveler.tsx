import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import axiosInstance from '@/config';
import { CreditCard, IdCard, Shield, CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/navigation/headers';
import { StatusScreen } from '@/app/screens/StatusScreen';

export default function BecomeTraveler() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    idCardNumber: '',
    bankCardNumber: '',
  });
  
  // Status screen state
  const [statusVisible, setStatusVisible] = useState(false);
  const [statusType, setStatusType] = useState<'success' | 'error'>('success');
  const [statusTitle, setStatusTitle] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [primaryAction, setPrimaryAction] = useState<{ label: string, onPress: () => void } | undefined>(undefined);
  const [secondaryAction, setSecondaryAction] = useState<{ label: string, onPress: () => void } | undefined>(undefined);

  const closeStatusScreen = () => {
    setStatusVisible(false);
  };

  const showStatusScreen = (
    type: 'success' | 'error',
    title: string,
    message: string,
    primary?: { label: string; onPress: () => void },
    secondary?: { label: string; onPress: () => void }
  ) => {
    setStatusType(type);
    setStatusTitle(title);
    setStatusMessage(message);
    setPrimaryAction(primary);
    setSecondaryAction(secondary);
    setStatusVisible(true);
  };

  const validateForm = () => {
    if (!formData.idCardNumber) {
      showStatusScreen(
        'error',
        'Error',
        'Please enter your ID card number',
        { label: 'OK', onPress: closeStatusScreen }
      );
      return false;
    }
    if (!formData.bankCardNumber) {
      showStatusScreen(
        'error',
        'Error',
        'Please enter your bank card number',
        { label: 'OK', onPress: closeStatusScreen }
      );
      return false;
    }
    // Basic validation for card numbers
    if (formData.idCardNumber.length < 8) {
      showStatusScreen(
        'error',
        'Error',
        'Please enter a valid ID card number',
        { label: 'OK', onPress: closeStatusScreen }
      );
      return false;
    }
    if (formData.bankCardNumber.length < 16) {
      showStatusScreen(
        'error',
        'Error',
        'Please enter a valid bank card number',
        { label: 'OK', onPress: closeStatusScreen }
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user || !user.id) {
      showStatusScreen(
        'error',
        'Error',
        'You must be logged in to become a traveler',
        { label: 'OK', onPress: closeStatusScreen }
      );
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
        showStatusScreen(
          'error',
          'Error',
          response.data.message || 'Failed to submit application',
          { label: 'OK', onPress: closeStatusScreen }
        );
      }
    } catch (error: any) {
      console.error('Error submitting traveler application:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit application';
      showStatusScreen(
        'error',
        'Error',
        errorMessage,
        { label: 'OK', onPress: closeStatusScreen }
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (applicationSubmitted) {
    return (
      <ThemedView style={styles.container}>
        <Header 
          title="Application Submitted"
          subtitle="Your application has been sent for review"
          onBackPress={() => router.back()}
          showBackButton={true}
        />

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
      <StatusScreen
        visible={statusVisible}
        type={statusType}
        title={statusTitle}
        message={statusMessage}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        onClose={closeStatusScreen}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Header 
          title="Become a Traveler"
          subtitle="Verify your identity to start delivering goods"
          onBackPress={() => router.back()}
          showBackButton={true}
        />

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
