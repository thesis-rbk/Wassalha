import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { VerificationStatusProps } from '@/types/VerificationStatusProps';


export const VerificationStatus = ({ 
  isVerified, 
  isPending = false,
  type,
  onPress
}: VerificationStatusProps) => {
  const router = useRouter();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (!isVerified && !isPending) {
      router.push('/screens/SponsorshipScreen');
    }
  };
  
  if (isVerified) {
    return (
      <View style={[styles.badge, styles.verifiedBadge]}>
        <Ionicons name="checkmark" size={12} color="#16a34a" />
        <Text style={styles.verifiedText}>
          {type === 'SPONSOR' ? 'Verified Sponsor' : 'Verified'}
        </Text>
      </View>
    );
  }
  
  if (isPending) {
    return (
      <View style={[styles.badge, styles.pendingBadge]}>
        <Ionicons name="time-outline" size={12} color="#d97706" />
        <Text style={styles.pendingText}>Verification Pending</Text>
      </View>
    );
  }
  
  return (
    <TouchableOpacity 
      style={[styles.badge, styles.unverifiedBadge]}
      onPress={handlePress}
    >
      <Ionicons name="alert-circle-outline" size={12} color="#dc2626" />
      <Text style={styles.unverifiedText}>Unverified</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  verifiedText: {
    color: '#16a34a',
    fontSize: 12,
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
  },
  pendingText: {
    color: '#d97706',
    fontSize: 12,
  },
  unverifiedBadge: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  unverifiedText: {
    color: '#dc2626',
    fontSize: 12,
  },
}); 