import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Users, ChevronRight, Globe, Award, Shield, FileText, RefreshCw } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SponsorshipScreen() {
  const router = useRouter();
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);
  
  useEffect(() => {
    checkTermsAcceptance();
  }, []);

  const checkTermsAcceptance = async () => {
    try {
      const accepted = await AsyncStorage.getItem('sponsorshipTermsAccepted');
      if (accepted === 'true') {
        setHasAcceptedTerms(true);
      } else {
        setHasAcceptedTerms(false);
      }
    } catch (error) {
      console.error('Error checking terms acceptance:', error);
      setHasAcceptedTerms(false);
    }
  };
  
  const handleJoinCommunity = () => {
    if (hasAcceptedTerms) {
      router.push('/verification/start');
    } else {
      router.push('/screens/TermsAndConditions');
    }
  };

  // For testing - reset terms acceptance
  const resetTermsAcceptance = async () => {
    try {
      await AsyncStorage.removeItem('sponsorshipTermsAccepted');
      setHasAcceptedTerms(false);
      Alert.alert('Reset', 'Terms acceptance has been reset for testing.');
    } catch (error) {
      console.error('Error resetting terms acceptance:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TopNavigation title="Sponsorship" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Users size={40} color="#0891b2" />
          </View>
          <ThemedText style={styles.title}>The Tribe</ThemedText>
          <ThemedText style={styles.subtitle}>Global Sponsorship Community</ThemedText>
          
          {/* Testing button - long press to reset terms acceptance */}
          <TouchableOpacity 
            onLongPress={resetTermsAcceptance} 
            style={styles.resetButton}
          >
            <RefreshCw size={16} color="#64748b" />
            <ThemedText style={styles.resetText}>Reset (Long Press)</ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Globe size={24} color="#0891b2" />
            <ThemedText style={styles.cardHeaderText}>Global Community</ThemedText>
          </View>
          
          <View style={styles.cardContent}>
            <ThemedText style={styles.cardTitle}>Join Our Global Community</ThemedText>
            <ThemedText style={styles.cardDescription}>
              Connect with thousands of sponsors worldwide who are helping others access digital content.
              Our community has facilitated over 50,000 successful sponsorships.
            </ThemedText>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>50K+</ThemedText>
                <ThemedText style={styles.statLabel}>Sponsorships</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>120+</ThemedText>
                <ThemedText style={styles.statLabel}>Countries</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>10K+</ThemedText>
                <ThemedText style={styles.statLabel}>Active Members</ThemedText>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.infoSection}>
          <ThemedText style={styles.sectionTitle}>How It Works</ThemedText>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>1</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Accept Terms & Conditions</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Review and accept our community guidelines and terms of service.
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>2</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Verify Your Identity</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Complete a simple verification process to join our trusted community.
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>3</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Connect With Others</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Browse sponsorship requests and offer your help to those in need.
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>4</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Make A Difference</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Help others access digital content they couldn't otherwise obtain.
              </ThemedText>
            </View>
          </View>
        </View>
        
        <View style={styles.benefitsSection}>
          <ThemedText style={styles.sectionTitle}>Benefits of Joining</ThemedText>
          
          <View style={styles.benefitCard}>
            <Shield size={24} color="#0891b2" />
            <View style={styles.benefitContent}>
              <ThemedText style={styles.benefitTitle}>Trusted Network</ThemedText>
              <ThemedText style={styles.benefitDescription}>
                Join a verified community of sponsors with a proven track record.
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.benefitCard}>
            <Globe size={24} color="#0891b2" />
            <View style={styles.benefitContent}>
              <ThemedText style={styles.benefitTitle}>Global Reach</ThemedText>
              <ThemedText style={styles.benefitDescription}>
                Connect with people from over 120 countries around the world.
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.benefitCard}>
            <Award size={24} color="#0891b2" />
            <View style={styles.benefitContent}>
              <ThemedText style={styles.benefitTitle}>Recognition</ThemedText>
              <ThemedText style={styles.benefitDescription}>
                Earn badges and status as you help more people in the community.
              </ThemedText>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={handleJoinCommunity}
        >
          <ThemedText style={styles.joinButtonText}>
            {hasAcceptedTerms ? 'Continue to Verification' : 'Review Terms & Conditions'}
          </ThemedText>
          <ChevronRight size={20} color="#fff" />
        </TouchableOpacity>
        
        <ThemedText style={styles.termsNote}>
          {hasAcceptedTerms 
            ? 'You have already accepted our terms and conditions.' 
            : 'You must accept our terms and conditions to proceed.'}
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0f2fe',
  },
  cardHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#0891b2',
  },
  image: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4b5563',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0891b2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },
  benefitsSection: {
    marginBottom: 24,
  },
  benefitCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  benefitContent: {
    marginLeft: 12,
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  joinButton: {
    backgroundColor: '#0891b2',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  termsNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b',
    marginBottom: 24,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginTop: 8,
  },
  resetText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
}); 