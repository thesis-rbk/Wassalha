import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TitleLarge, BodyMedium } from '@/components/Typography';
import { BaseButton } from '@/components/ui/buttons/BaseButton';
import { MapPin, Package, Calendar, DollarSign, Clock, User, Star, Bell, MessageCircle } from 'lucide-react-native';
import { Image } from 'expo-image';
import axiosInstance from '@/config';
import ProgressBar from '@/components/ProgressBar';
import { ProgressBarProps } from '@/types/ProgressBarProps';

// Backend URL for images
const BACKEND_URL = "http://192.168.1.11:5000";

// Mock data for testing
const MOCK_OFFER = {
  id: 1,
  price: 120,
  estimatedDeliveryDate: new Date().toISOString(),
  notes: "I can deliver this item within a week. I'll be traveling directly from the source location.",
  status: 'PENDING',
  serviceProvider: {
    id: 2,
    name: "John Traveler",
    profile: {
      image: null,
      isVerified: true
    },
    reputation: {
      rating: 4.8,
      count: 24
    }
  },
  request: {
    id: 1,
    goods: {
      name: "iPhone 13 Pro",
      price: 999,
      image: {
        filename: "iphone.jpg"
      }
    },
    goodsLocation: "New York, USA",
    goodsDestination: "Miami, USA",
    quantity: 1
  }
};

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const [offer, setOffer] = useState<any>(MOCK_OFFER);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Progress tracking
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  const progressData: ProgressBarProps = {
    steps: [
      { id: 1, title: 'Review', icon: 'check-circle' },
      { id: 2, title: 'Verification', icon: 'shield' },
      { id: 3, title: 'Payment', icon: 'credit-card' },
      { id: 4, title: 'Pickup', icon: 'package' },
      { id: 5, title: 'Delivery', icon: 'truck' }
    ],
    currentStep: currentStep
  };

  useEffect(() => {
    // In a real implementation, fetch the offer data
    // For testing, we'll use the mock data
    setLoading(false);
  }, [id]);

  const handleAcceptOffer = async () => {
    try {
      setProcessing(true);
      
      // In a real implementation, make an API call
      // For testing, we'll simulate a successful response
      setTimeout(() => {
        Alert.alert(
          "Offer Accepted",
          "You've accepted this offer. The traveler will be notified.",
          [{ 
            text: "Proceed to Verification", 
            onPress: () => router.push(`/processTrack/verificationSO?orderId=1`) 
          }]
        );
        setProcessing(false);
      }, 1000);
    } catch (error) {
      console.error('Error accepting offer:', error);
      Alert.alert("Error", "Failed to accept offer. Please try again.");
      setProcessing(false);
    }
  };

  const handleRejectOffer = async () => {
    try {
      setProcessing(true);
      
      // In a real implementation, make an API call
      // For testing, we'll simulate a successful response
      setTimeout(() => {
        Alert.alert(
          "Offer Rejected",
          "You've rejected this offer. The traveler will be notified.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        setProcessing(false);
      }, 1000);
    } catch (error) {
      console.error('Error rejecting offer:', error);
      Alert.alert("Error", "Failed to reject offer. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
        <Text style={styles.loadingText}>Loading offer details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TitleLarge style={styles.headerTitle}>Review Offer</TitleLarge>
        <View style={styles.headerIcons}>
          <Bell size={24} color={Colors[colorScheme].primary} />
          <MessageCircle size={24} color={Colors[colorScheme].primary} />
          <User size={24} color={Colors[colorScheme].primary} />
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar 
          steps={progressData.steps}
          currentStep={progressData.currentStep}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `${BACKEND_URL}/api/uploads/${offer.request.goods.image?.filename}` }}
            style={styles.productImage}
            contentFit="cover"
            onError={(error) => console.error("Image loading error:", error)}
          />
        </View>

        {/* Request Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{offer.request.goods.name}</Text>
          <Text style={styles.price}>${offer.price}</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Request Details</Text>
            
            <View style={styles.detailRow}>
              <MapPin size={16} color="#64748b" />
              <Text style={styles.detailText}>From: {offer.request.goodsLocation}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={16} color="#64748b" />
              <Text style={styles.detailText}>To: {offer.request.goodsDestination}</Text>
            </View>
            <View style={styles.detailRow}>
              <Package size={16} color="#64748b" />
              <Text style={styles.detailText}>Quantity: {offer.request.quantity}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={16} color="#64748b" />
              <Text style={styles.detailText}>
                Estimated Delivery: {new Date(offer.estimatedDeliveryDate).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Traveler Profile */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Traveler</Text>
            
            <View style={styles.travelerCard}>
              <View style={styles.travelerHeader}>
                <View style={styles.avatarContainer}>
                  {offer.serviceProvider.profile.image ? (
                    <Image 
                      source={{ uri: offer.serviceProvider.profile.image }} 
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitials}>
                        {getInitials(offer.serviceProvider.name)}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.travelerInfo}>
                  <Text style={styles.travelerName}>{offer.serviceProvider.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Star size={16} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.ratingText}>
                      {offer.serviceProvider.reputation.rating} 
                      ({offer.serviceProvider.reputation.count} reviews)
                    </Text>
                    {offer.serviceProvider.profile.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Notes */}
          {offer.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <Text style={styles.notesText}>{offer.notes}</Text>
            </View>
          )}

          {/* Order Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Status</Text>
            <View style={[styles.statusBadge, getStatusStyle(offer.status)]}>
              <Text style={styles.statusText}>{formatStatus(offer.status)}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <BaseButton
              size="large"
              onPress={handleAcceptOffer}
              style={styles.acceptButton}
              disabled={processing || offer.status !== 'PENDING'}
            >
              {processing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <BodyMedium style={styles.buttonText}>Accept Offer</BodyMedium>
              )}
            </BaseButton>
            
            <BaseButton
              size="large"
              onPress={handleRejectOffer}
              style={styles.rejectButton}
              disabled={processing || offer.status !== 'PENDING'}
            >
              <BodyMedium style={styles.rejectButtonText}>Reject Offer</BodyMedium>
            </BaseButton>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Helper function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
};

// Helper function to get status style
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'ACCEPTED':
      return { backgroundColor: '#dcfce7', borderColor: '#86efac' };
    case 'REJECTED':
      return { backgroundColor: '#fee2e2', borderColor: '#fca5a5' };
    case 'PENDING':
      return { backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' };
    default:
      return { backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' };
  }
};

// Helper function to format status
const formatStatus = (status: string) => {
  switch (status) {
    case 'ACCEPTED':
      return 'Accepted';
    case 'REJECTED':
      return 'Rejected';
    case 'PENDING':
      return 'Pending';
    default:
      return status;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  imageContainer: {
    width: '100%',
    height: 250,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 16,
  },
  productName: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#64748b',
  },
  travelerCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  travelerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
  },
  travelerInfo: {
    flex: 1,
  },
  travelerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#64748b',
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  notesText: {
    fontSize: 16,
    color: '#64748b',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    marginTop: 16,
  },
  acceptButton: {
    marginBottom: 12,
    backgroundColor: Colors.light.primary,
  },
  rejectButton: {
    backgroundColor: '#f1f5f9',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  rejectButtonText: {
    color: '#64748b',
    fontWeight: '600',
  },
});
