import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Users, Clock, FileText, UserCircle2, CreditCard } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Header from '@/components/navigation/headers';

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
      <Header 
        title="Verify Your Identity"
        subtitle="Complete these steps to get verified"
        onBackPress={() => router.back()}
        showBackButton={true}
      />
      
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
          <ThemedText style={styles.logoText}>Wassalha</ThemedText>
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
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  activeStepDot: {
    backgroundColor: Colors.light.primary,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
  stepContent: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeText: {
    marginLeft: 12,
    color: '#64748B',
    fontSize: 15,
    fontWeight: '500',
  },
  requirementsList: {
    width: '100%',
    marginTop: 24,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTexts: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  nextButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  disclaimer: {
    fontSize: 13,
    textAlign: 'center',
    color: '#94A3B8',
    lineHeight: 18,
  },
}); 