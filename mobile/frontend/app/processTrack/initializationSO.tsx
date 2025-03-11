import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { MapPin, Package, Calendar, DollarSign, Clock, User, Star, Bell, MessageCircle, CheckCircle, Award } from 'lucide-react-native';
import axiosInstance from '@/config';
import ProgressBar from '@/components/ProgressBar';
import { BlurView } from 'expo-blur';
import { BACKEND_URL } from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Traveler, TravelerProfile, TravelerReputation, TravelerStats } from '@/types';

export default function InitializationSO() {
  const { id, offerId } = useLocalSearchParams<{ id: string, offerId: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Progress steps
  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization" },
    { id: 2, title: "Verification", icon: "verification" },
    { id: 3, title: "Payment", icon: "payment" },
    { id: 4, title: "Pickup", icon: "pickup" },
  ];

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
          return;
        }

        const token = await AsyncStorage.getItem('jwtToken');
        if (token) {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            if (payload.id) {
              setUser({
                id: payload.id,
                email: payload.email,
                name: payload.name
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  // Fetch offer details
  useEffect(() => {
    if (offerId) {
      fetchOfferDetails();
    } else if (id) {
      fetchOrderDetails();
    }
  }, [offerId, id]);

  useEffect(() => {
    console.log('InitializationSO params:', { id, offerId });
  }, [id, offerId]);

  const fetchOfferDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/offers/${offerId}`);
      setOffer(response.data.data);
    } catch (error) {
      console.error('Error fetching offer details:', error);
      Alert.alert('Error', 'Failed to load offer details');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/orders/${id}?include=traveler.reputation,traveler.profile`);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async () => {
    console.log('=== STARTING ACCEPT OFFER FUNCTION ===');
    console.log('id:', id);
    console.log('offerId:', offerId);
    console.log('offer state:', JSON.stringify(offer, null, 2));
    console.log('user state:', JSON.stringify(user, null, 2));

    // If we're viewing an existing order, not an offer
    if (id && !offerId) {
      console.log('This is an existing order, not an offer to accept');
      Alert.alert("Info", "This is an existing order, not a pending offer.");
      return;
    }

    if (!offerId) {
      console.log('ERROR: No offerId found');
      Alert.alert("Error", "No offer ID found. Please try again.");
      return;
    }

    if (!offer) {
      console.log('ERROR: Offer is null');
      Alert.alert("Error", "Offer details not found. Please try again.");
      return;
    }

    try {
      setProcessing(true);
      console.log('Setting processing to true');
      
      // Create a more complete order data with null checks
      const orderData = {
        offerId: parseInt(offerId),
        requestId: offer.requestId || null,
        travelerId: offer.travelerId || null,
        price: offer.price || 0,
        estimatedDeliveryDate: offer.estimatedDeliveryDate || new Date().toISOString(),
        orderStatus: "PENDING",
        paymentStatus: "ON_HOLD"
      };

      console.log('Order data prepared:', JSON.stringify(orderData, null, 2));

      try {
        console.log('Attempting API call to /api/orders');
        const response = await axiosInstance.post('/api/orders', orderData);
        console.log('API response received:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.data && response.data.data.id) {
          console.log('Updating offer status');
          await axiosInstance.patch(`/api/offers/${offerId}/status`, {
            status: 'ACCEPTED'
          });
          console.log('Offer status updated successfully');

          router.replace({
            pathname: '/screens/OrderSuccessScreen',
            params: {
              orderId: response.data.data.id,
              goodsName: offer.request.goods.name,
              destination: offer.request.goodsDestination
            }
          });
        } else {
          console.error('Response data missing id:', response.data);
          Alert.alert("Error", "Invalid response from server. Please try again.");
        }
      } catch (apiError) {
        console.error('=== API ERROR ===');
        console.error('Error object:', apiError);
        Alert.alert("Error", "Failed to accept offer. Please try again.");
      }
    } catch (error) {
      console.error('=== GENERAL ERROR ===');
      console.error('Error object:', error);
      Alert.alert("Error", "Failed to prepare order data");
    } finally {
      console.log('Setting processing to false');
      setProcessing(false);
      console.log('=== ENDING ACCEPT OFFER FUNCTION ===');
    }
  };

  const handleRejectOffer = async () => {
    try {
      setProcessing(true);
      
      const response = await axiosInstance.patch(`/api/offers/${offer.id}/status`, {
        status: 'REJECTED'
      });

      if (response.status === 200) {
        Alert.alert(
          "Offer Rejected",
          "You've rejected this offer. The traveler will be notified.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Error rejecting offer:', error);
      Alert.alert("Error", "Failed to reject offer. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? The request will become available for new offers.',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              const response = await axiosInstance.patch(`/api/orders/${order.id}/status`, {
                status: 'CANCELLED',
                userId: user?.id
              });

              if (response.status === 200) {
                Alert.alert(
                  'Order Cancelled',
                  'The request is now available for new offers.',
                  [{ 
                    text: 'OK', 
                    onPress: () => router.back()
                  }]
                );
              }
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Failed to cancel order. Please try again.');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
        <ThemedText style={styles.loadingText}>Loading details...</ThemedText>
      </ThemedView>
    );
  }

  const displayData = offer || order;
  if (!displayData) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>No data found</ThemedText>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const traveler = offer ? offer.traveler : order.traveler;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Order Details' }} />
        
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>
            {offer ? "Review Offer" : "Order Details"}
          </ThemedText>
          <View style={styles.headerIcons}>
            <Bell size={24} color={Colors[colorScheme].primary} />
            <MessageCircle size={24} color={Colors[colorScheme].primary} />
            <User size={24} color={Colors[colorScheme].primary} />
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <ProgressBar currentStep={1} steps={progressSteps} />

          <View style={styles.detailsContainer}>
            <ThemedText style={styles.productName}>
              {offer ? offer.request.goods.name : order.request.goods.name}
            </ThemedText>
            

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Request Details</ThemedText>
              
              <View style={styles.detailRow}>
                <MapPin size={16} color="#64748b" />
                <ThemedText style={styles.detailText}>
                  From: {offer ? offer.request.goodsLocation : order.request.goodsLocation}
                </ThemedText>
              </View>
              
              <View style={styles.detailRow}>
                <MapPin size={16} color="#64748b" />
                <ThemedText style={styles.detailText}>
                  To: {offer ? offer.request.goodsDestination : order.request.goodsDestination}
                </ThemedText>
              </View>
              
              <View style={styles.detailRow}>
                <Package size={16} color="#64748b" />
                <ThemedText style={styles.detailText}>
                  Quantity: {offer ? offer.request.quantity : order.request.quantity}
                </ThemedText>
              </View>
              
              <View style={styles.detailRow}>
                <Clock size={16} color="#64748b" />
                <ThemedText style={styles.detailText}>
                  Estimated Delivery: {new Date(displayData.estimatedDeliveryDate).toLocaleDateString()}
                </ThemedText>
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Traveler</ThemedText>
              
              <View style={styles.travelerCard}>
                <View style={styles.travelerHeader}>
                  <View style={styles.avatarContainer}>
                    {traveler?.profile?.imageId ? (
                      <Image 
                        source={{ uri: `${BACKEND_URL}/api/uploads/${traveler.profile.imageId}` }}
                        style={styles.avatar}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <ThemedText style={styles.avatarInitials}>
                          {getInitials(traveler?.name)}
                        </ThemedText>
                      </View>
                    )}
                    
                    {traveler?.profile?.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <CheckCircle size={16} color="#10b981" />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.travelerInfo}>
                    <ThemedText style={styles.travelerName}>
                      {getObfuscatedName(traveler?.name)}
                    </ThemedText>
                    
                    <View style={styles.reputationRow}>
                      <View style={styles.reputationContainer}>
                        <Star size={16} color="#f59e0b" fill="#f59e0b" />
                        <ThemedText style={styles.reputationText}>
                          {traveler?.reputation?.score?.toFixed(1)} ({traveler?.reputation?.totalRatings} ratings)
                        </ThemedText>
                      </View>
                      
                      <View style={styles.experienceBadge}>
                        <Award size={14} color="#7c3aed" />
                        <ThemedText style={styles.experienceText}>
                          Level {traveler?.reputation?.level}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.statsContainer}>
                      <View style={styles.statItem}>
                        <Package size={14} color="#64748b" />
                        <ThemedText style={styles.statText}>
                          {traveler?.stats?.completedOrders} Deliveries
                        </ThemedText>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.statItem}>
                        <CheckCircle size={14} color="#64748b" />
                        <ThemedText style={styles.statText}>
                          {traveler?.stats?.successRate}% Success
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {offer?.notes && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Additional Notes</ThemedText>
                <ThemedText style={styles.notesText}>{offer.notes}</ThemedText>
              </View>
            )}

            <View style={[styles.imageContainer, { marginTop: 16 }]}>
              <Image
                source={{ uri: getImageUrl(displayData) }}
                style={styles.productImage}
                contentFit="cover"
              />
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.bottomActions}>
          {/* Show Accept button when we have an offer */}
          {offerId && offer ? (
            <TouchableOpacity
              style={[styles.acceptButton, processing && styles.buttonDisabled]}
              onPress={handleAcceptOffer}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <ThemedText style={styles.buttonText}>
                  Accept and Proceed to Verification
                </ThemedText>
              )}
            </TouchableOpacity>
          ) : null}

          {/* Show Cancel button for orders */}
          {id && order ? (
            <TouchableOpacity
              style={[styles.cancelButton, processing && styles.buttonDisabled]}
              onPress={handleCancelOrder}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <ThemedText style={styles.cancelButtonText}>
                  Cancel Order
                </ThemedText>
              )}
            </TouchableOpacity>
          ) : null}
          
          {/* Show Reject button for offers */}
          {offerId && offer ? (
            <TouchableOpacity
              style={[styles.cancelButton, processing && styles.buttonDisabled]}
              onPress={handleRejectOffer}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <ThemedText style={styles.cancelButtonText}>
                  Reject Offer
                </ThemedText>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

// Helper Functions
const getImageUrl = (data: any) => {
  if (data.request?.goods?.image?.filename) {
    return `${BACKEND_URL}/api/uploads/${data.request.goods.image.filename}`;
  }
  return 'https://via.placeholder.com/400x200?text=No+Image';
};

const getInitials = (name?: string) => {
  if (!name) return '?';
  const names = name.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return names[0][0].toUpperCase();
};

const getObfuscatedName = (name?: string) => {
  if (!name) return 'Anonymous';
  const names = name.split(' ');
  if (names.length >= 2) {
    return `${names[0]} ${names[names.length - 1][0]}.`;
  }
  return name;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
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
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
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
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '600',
    color: '#64748b',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  travelerInfo: {
    flex: 1,
  },
  travelerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  reputationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reputationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reputationText: {
    fontSize: 14,
    color: '#64748b',
  },
  experienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  experienceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7c3aed',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  statText: {
    fontSize: 13,
    color: '#64748b',
  },
  notesText: {
    fontSize: 16,
    color: '#64748b',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  bottomSpacer: {
    height: 80,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    gap: 12,
  },
  acceptButton: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});