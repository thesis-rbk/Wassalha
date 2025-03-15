import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ChevronLeft, Users, Clock, FileText, UserCircle2, CreditCard } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function VerificationStart() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const [currentStep, setCurrentStep] = useState(1);
  
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to SelectCountry screen
      router.push('/verification/SelectCountry');
    }
  };

  const verificationOptions = [
    {
      id: 'identity',
      title: 'Identity document',
      description: 'Take a photo of your ID',
      icon: <FileText size={24} color={Colors[colorScheme].text} />,
    },
    {
      id: 'selfie',
      title: 'Selfie',
      description: 'Take a Selfie',
      icon: <UserCircle2 size={24} color={Colors[colorScheme].text} />,
    },
    {
      id: 'creditCard',
      title: 'Credit Card',
      description: 'We will link your credit card to your account',
      icon: <CreditCard size={24} color={Colors[colorScheme].text} />,
    },
    {
      id: 'questionnaire',
      title: 'Questionnaire',
      description: 'We will ask you a few questions',
      icon: <FileText size={24} color={Colors[colorScheme].text} />,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Verify Your Identity</ThemedText>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
          </View>
          <View style={styles.stepIndicators}>
            <View style={[styles.stepDot, currentStep >= 1 && styles.activeStepDot]} />
            <View style={[styles.stepDot, currentStep >= 2 && styles.activeStepDot]} />
            <View style={[styles.stepDot, currentStep >= 3 && styles.activeStepDot]} />
          </View>
        </View>
        
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Users size={40} color="#0891b2" />
          </View>
          <ThemedText style={styles.logoText}>THE TRIBE</ThemedText>
        </View>
        
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <ThemedText style={styles.stepTitle}>Join Our Global Community</ThemedText>
            <ThemedText style={styles.stepDescription}>
              You're about to join thousands of sponsors worldwide who are helping others access digital content. 
              Our community has facilitated over 50,000 successful sponsorships.
            </ThemedText>
          </View>
        )}
        
        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <ThemedText style={styles.stepTitle}>Quick Verification Process</ThemedText>
            <ThemedText style={styles.stepDescription}>
              It will only take about 10 minutes to complete your verification. 
              This helps us maintain a safe and trusted community for everyone.
            </ThemedText>
            
            <View style={styles.timeEstimate}>
              <Clock size={20} color="#64748b" />
              <ThemedText style={styles.timeText}>Estimated time: 10 minutes</ThemedText>
            </View>
          </View>
        )}
        
        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <ThemedText style={styles.stepTitle}>Ready to Begin?</ThemedText>
            <ThemedText style={styles.stepDescription}>
              Please have your ID ready. We'll guide you through each step of the verification process.
              Your information is secure and will only be used for verification purposes.
            </ThemedText>
            
            <View style={styles.requirementsList}>
              <ThemedText style={styles.requirementsTitle}>You'll need:</ThemedText>
              
              {verificationOptions.map((option) => (
                <View key={option.id} style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <View style={styles.iconContainer}>{option.icon}</View>
                    <View style={styles.optionTexts}>
                      <ThemedText style={styles.optionTitle}>{option.title}</ThemedText>
                      <ThemedText style={styles.optionDescription}>
                        {option.description}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <ThemedText style={styles.nextButtonText}>
            {currentStep < 3 ? 'Next' : 'Begin Verification'}
          </ThemedText>
        </TouchableOpacity>
        
        <ThemedText style={styles.disclaimer}>
          By tapping Continue, you accept our consent to Personal Data Processing
        </ThemedText>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40, // Add extra padding at the bottom for scrolling
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0891b2',
    borderRadius: 3,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e5e7eb',
  },
  activeStepDot: {
    backgroundColor: '#0891b2',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  stepContent: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 24,
  },
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  timeText: {
    marginLeft: 8,
    color: '#64748b',
    fontSize: 14,
  },
  requirementsList: {
    width: '100%',
    marginTop: 16,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginBottom: 8,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    marginRight: 12,
  },
  optionTexts: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  nextButton: {
    backgroundColor: '#0891b2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    color: '#64748b',
  },
}); 