import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FileText, UserCircle2, Phone, CreditCard } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { VerificationOption } from '@/types/VerificationOption';


const VerificationScreen = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  const verificationOptions: VerificationOption[] = [
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
      <View style={styles.content}>
        <ThemedText style={styles.title}>Verify your identity</ThemedText>
        <ThemedText style={styles.subtitle}>It will only take about 10 minutes</ThemedText>

        <View style={styles.optionsContainer}>
          {verificationOptions.map((option) => (
            <View key={option.id} style={[styles.optionRow, { backgroundColor: Colors[colorScheme].secondary }]}>
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

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors[colorScheme].primary }]}
            onPress={() => router.push('/verification/SelectCountry' as any)}
          >
            <ThemedText style={styles.buttonText}>Continue</ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.disclaimer}>
          By tapping Continue, you accept our consent to Personal Data Processing
        </ThemedText>
      </View>
    </ThemedView>
  );
};

export default VerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  optionsContainer: {
    gap: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
  },
  optionTexts: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 16,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
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