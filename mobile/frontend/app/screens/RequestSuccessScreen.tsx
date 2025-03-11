import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { Check, Home, Package, CheckCircle } from 'lucide-react-native';

export default function RequestSuccessScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.checkCircle}>
          <CheckCircle size={80} color="#4CAF50" />
        </View>
        
        <ThemedText style={styles.title}>Request Created!</ThemedText>
        
        <ThemedText style={styles.description}>
          Your request has been successfully created and is now visible to travelers. 
          You'll be notified when someone makes an offer.
        </ThemedText>
        
        <View style={styles.infoCard}>
          <ThemedText style={styles.infoTitle}>What's Next?</ThemedText>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <ThemedText style={styles.numberText}>1</ThemedText>
            </View>
            <ThemedText style={styles.infoText}>
              Wait for travelers to make offers on your request
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <ThemedText style={styles.numberText}>2</ThemedText>
            </View>
            <ThemedText style={styles.infoText}>
              Review and accept an offer that works for you
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <ThemedText style={styles.numberText}>3</ThemedText>
            </View>
            <ThemedText style={styles.infoText}>
              Coordinate with your traveler for delivery
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => router.replace('/')}
          >
            <Home size={20} color="#fff" />
            <ThemedText style={styles.buttonText}>Home</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.ordersButton}
            onPress={() => router.replace('/test/order')}
          >
            <Package size={20} color="#fff" />
            <ThemedText style={styles.buttonText}>My Orders</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  checkCircle: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    color: '#64748b',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    color: '#fff',
    fontWeight: '600',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  homeButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginRight: 8,
  },
  ordersButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
}); 