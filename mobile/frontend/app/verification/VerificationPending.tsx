import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { CheckCircle2 } from 'lucide-react-native';

const VerificationPending = () => {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <CheckCircle2 size={64} color={Colors.light.primary} />
        <ThemedText style={styles.title}>Verification Pending</ThemedText>
        <ThemedText style={styles.message}>
          Thank you for completing the verification process. Our admin team will review your information and get back to you shortly.
        </ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default VerificationPending; 