// In frontend/app/test/order-details.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import axiosInstance from '@/config';
import { useAuth } from '@/hooks/useAuth';
import ProcessTracker from '@/components/ProcessTracker';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ProcessStatus } from '@/types/GoodsProcess';
import { Review } from '@/types/Review';
import { BlurView } from 'expo-blur';
import { CheckCircle, Star, Award, Package } from 'lucide-react-native';
import { Image } from 'expo-image';
import { BACKEND_URL } from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStatus } from '@/context/StatusContext';
// Import Traveler types from types directory
import { Traveler, TravelerProfile, TravelerReputation, TravelerStats } from '@/types';

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(authUser);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { show, hide } = useStatus();

  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Add useEffect for user authentication
  useEffect(() => {
    const loadUser = async () => {
      try {
        // First try to use authUser
        if (authUser) {
          setUser(authUser);
          return;
        }

        // Then try to get token and decode it
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
        console.error('Error loading user:', error);
      }
    };

    loadUser();
  }, [authUser]);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/orders/${orderId}?include=traveler.reputation,traveler.reviews,traveler.profile`);
      console.log('=== DEBUG ORDER DETAILS ===');
      console.log('Order Data:', response.data.data);
      console.log('Tracking Number:', response.data.data.trackingNumber);
      console.log('Traveler Info:', response.data.data.traveler);
      
      // Add default values for missing data
      const orderData = {
        ...response.data.data,
        traveler: {
          ...response.data.data.traveler,
          reputation: response.data.data.traveler?.reputation || {
            score: 0,
            totalRatings: 0,
            level: 1
          },
          profile: response.data.data.traveler?.profile || {
            isVerified: false,
            imageId: null
          },
          stats: {
            completedOrders: response.data.data.traveler?.stats?.completedOrders || 0,
            successRate: response.data.data.traveler?.stats?.successRate || 0
          },
          reviews: response.data.data.traveler?.reviews || []
        }
      };
      
      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order details:', error);
      show({
        type: 'error',
        title: 'Error',
        message: 'Failed to load order details',
        primaryAction: {
          label: 'OK',
          onPress: () => {}
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect for debugging auth
  useEffect(() => {
    const debugAuth = async () => {
      console.log('=== DETAILED AUTH DEBUG ===');
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        const storedUser = await AsyncStorage.getItem('user');
        console.log('Raw Token:', token);
        console.log('Raw Stored User:', storedUser);
        
        // Only try to parse if we have data
        if (storedUser) {
          console.log('Parsed User:', JSON.parse(storedUser));
        }
        
        if (token) {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('JWT Payload:', payload);
          }
        }

        console.log('useAuth user:', user);
      } catch (error) {
        console.error('Error in auth debug:', error);
      }
    };
    
    debugAuth();
  }, [user]);

  const updateProcessStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      
      const response = await axiosInstance.patch(`/api/orders/${order.id}/status`, {
        status: newStatus,
        userId: user?.id
      });

      if (response.status === 200) {
        if (newStatus === 'CANCELLED') {
          show({
            type: 'success',
            title: 'Order Cancelled',
            message: 'The request is now available for new offers.',
            primaryAction: { 
              label: 'OK', 
              onPress: () => {
                // Navigate back to the requests list since this order no longer exists
                router.back();
              } 
            }
          });
        } else {
          show({
            type: 'success',
            title: 'Status Updated',
            message: 'Order status has been updated.',
            primaryAction: { 
              label: 'OK', 
              onPress: () => fetchOrderDetails() 
            }
          });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      show({
        type: 'error',
        title: 'Error',
        message: 'Failed to update status. Please try again.',
        primaryAction: {
          label: 'OK',
          onPress: () => {}
        }
      });
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (currentStatus: ProcessStatus): ProcessStatus | undefined => {
    const statusFlow: Record<ProcessStatus, ProcessStatus | undefined> = {
      'PREINITIALIZED': 'INITIALIZED',
      'INITIALIZED': 'CONFIRMED',
      'CONFIRMED': 'PAID',
      'PAID': 'IN_TRANSIT',
      'IN_TRANSIT': 'PICKUP_MEET',
      'PICKUP_MEET': 'FINALIZED',
      'FINALIZED': undefined,
      'CANCELLED': undefined
    };
    
    return statusFlow[currentStatus];
  };

  // Add debug logs before render
  const debugRender = () => {
    if (order) {
      const currentStatus = order.goodsProcess?.status;
      console.log('=== DEBUG RENDER ===');
      console.log('Current User ID:', user?.id);
      console.log('Request User ID:', order?.request?.userId);
      console.log('Traveler ID:', order?.travelerId);
      console.log('Is Requester:', user?.id === order?.request?.userId);
      console.log('Is Traveler:', user?.id === order?.travelerId);
      console.log('Current Status:', currentStatus);
      console.log('Process Events:', order.goodsProcess?.events);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
        <ThemedText style={styles.loadingText}>Loading order details...</ThemedText>
      </ThemedView>
    );
  }

  if (!order) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Order not found</ThemedText>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  debugRender(); // Call debug render before main render

  const currentStatus = order.goodsProcess?.status;
  const nextStatus = getNextStatus(currentStatus);
  const isCompleted = currentStatus === 'FINALIZED' || currentStatus === 'CANCELLED';
  const canUpdateStatus = !isCompleted && (
    (user?.id === order.travelerId) || // Traveler can update
    (user?.id === order.request.userId) // Requester can update
  );

  // Determine if current user is the requester or traveler
  const isRequester = user?.id === order?.request?.userId;
  const isTraveler = user?.id === order?.travelerId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Order Details' }} />
        
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
        >
          {/* Order Header with Order ID and Status */}
          <View style={styles.orderHeader}>
            <View>
              
              <ThemedText style={styles.orderDate}>
                {formatDate(order.goodsProcess?.createdAt)}
              </ThemedText>
            </View>
            <View style={styles.statusBadge}>
              <ThemedText style={styles.statusText}>
                {currentStatus?.replace('_', ' ')}
              </ThemedText>
            </View>
          </View>

          {/* Order Progress Tracker */}
          <View style={styles.trackerCard}>
            <ProcessTracker 
              currentStatus={currentStatus}
              events={order.goodsProcess?.events || []}
            />
          </View>

          {/* Requester View - Prominently showing Traveler Info */}
          {isRequester && (
            <>
              {/* Traveler Info Card - Prioritized */}
              <View style={styles.travelerSection}>
                <ThemedText style={styles.sectionTitle}>Your Delivery Partner</ThemedText>
                
                <View style={styles.travelerCard}>
                  {/* Traveler Avatar */}
                  <View style={styles.travelerAvatarContainer}>
                    {order.traveler?.profile?.imageId ? (
                      <BlurView intensity={80} style={styles.blurContainer}>
                        <Image 
                          source={{ uri: `${BACKEND_URL}/api/uploads/${order.traveler.profile.imageId}` }}
                          style={styles.travelerAvatar}
                          contentFit="cover"
                        />
                      </BlurView>
                    ) : (
                      <View style={styles.initialsContainer}>
                        <ThemedText style={styles.initials}>
                          {getInitials(order.traveler?.name)}
                        </ThemedText>
                      </View>
                    )}
                    
                    {order.traveler?.profile?.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <CheckCircle size={16} color="#10b981" />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.travelerInfo}>
                    <ThemedText style={styles.travelerName}>
                      {getObfuscatedName(order.traveler?.name)}
                    </ThemedText>
                    
                    {/* Reputation Display */}
                    <View style={styles.reputationRow}>
                      <View style={styles.reputationContainer}>
                        <Star size={16} color="#f59e0b" strokeWidth={2} fill="#f59e0b" />
                        <ThemedText style={styles.reputationText}>
                          {order.traveler.reputation.score.toFixed(1)} ({order.traveler.reputation.totalRatings} ratings)
                        </ThemedText>
                      </View>
                      
                      <View style={styles.experienceBadge}>
                        <Award size={14} color="#7c3aed" strokeWidth={2} />
                        <ThemedText style={styles.experienceText}>
                          Level {order.traveler.reputation.level}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Main Stats */}
                    <View style={styles.statsContainer}>
                      <View style={styles.statItem}>
                        <Package size={14} color="#64748b" strokeWidth={2} />
                        <ThemedText style={styles.statText}>
                          {order.traveler.stats.completedOrders} Deliveries
                        </ThemedText>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.statItem}>
                        <CheckCircle size={14} color="#64748b" strokeWidth={2} />
                        <ThemedText style={styles.statText}>
                          {order.traveler.stats.successRate}% Success
                        </ThemedText>
                      </View>
                    </View>
                    
                    <ThemedText style={styles.joinedDate}>
                      Member since {formatDate(order.traveler?.createdAt)}
                    </ThemedText>
                  </View>
                </View>
                
                {/* Key Delivery Information */}
                <View style={styles.deliveryDetails}>
                  <ThemedText style={styles.deliveryTitle}>Delivery Information</ThemedText>
                  
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Delivery Date:</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {formatDate(order.departureDate)}
                    </ThemedText>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>From:</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {order.request?.goodsLocation}
                    </ThemedText>
                  </View>

                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>To:</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {order.request?.goodsDestination}
                    </ThemedText>
                  </View>

                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Quantity:</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {order.request?.quantity}
                    </ThemedText>
                  </View>

                  {order.trackingNumber && (
                    <>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Airline:</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {order.trackingNumber.slice(0, 2)}
                        </ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Flight Number:</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {order.trackingNumber.slice(2)}
                        </ThemedText>
                      </View>
                    </>
                  )}

                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Box Required:</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {order.request?.withBox ? 'Yes' : 'No'}
                    </ThemedText>
                  </View>
                </View>
              </View>
              
              {/* Reviews Section */}
              {order.traveler.reviews && order.traveler.reviews.length > 0 && (
                <View style={styles.reviewsSection}>
                  <ThemedText style={styles.reviewsHeading}>Partner Reviews</ThemedText>
                  {order.traveler.reviews.slice(0, 3).map((review: Review, index: number) => (
                    <View key={review.id || index} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewRating}>
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i}
                              size={12}
                              color="#f59e0b"
                              strokeWidth={2}
                              fill={i < (review.rating || 0) ? "#f59e0b" : "transparent"}
                            />
                          ))}
                        </View>
                        {review.reviewer && (
                          <ThemedText style={styles.reviewerName}>
                            {review.reviewer.name}
                          </ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.reviewText} numberOfLines={3}>
                        {review.comment || "No comment provided"}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Traveler View - Show Request Details */}
          {isTraveler && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Request Details</ThemedText>
              
              {/* Request Info */}
              <View style={styles.requestCard}>
                {order.request?.goods?.goodsUrl && (
                  <Image 
                    source={{ uri: `${BACKEND_URL}/api/uploads/${order.request.goods.goodsUrl}` }}
                    style={styles.goodsImage}
                    contentFit="cover"
                  />
                )}
                
                <View style={styles.requestInfo}>
                  <ThemedText style={styles.goodsName}>{order.request?.goods?.name}</ThemedText>
                  <ThemedText style={styles.goodsDescription}>{order.request?.goods?.description}</ThemedText>
                  
                  <View style={styles.requestDetails}>
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Price:</ThemedText>
                      <ThemedText style={styles.detailValue}>${order.request?.goods?.price?.toFixed(2)}</ThemedText>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Quantity:</ThemedText>
                      <ThemedText style={styles.detailValue}>{order.request?.quantity}</ThemedText>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Location:</ThemedText>
                      <ThemedText style={styles.detailValue}>{order.request?.goodsLocation}</ThemedText>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Destination:</ThemedText>
                      <ThemedText style={styles.detailValue}>{order.request?.goodsDestination}</ThemedText>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Box Required:</ThemedText>
                      <ThemedText style={styles.detailValue}>{order.request?.withBox ? 'Yes' : 'No'}</ThemedText>
                    </View>
                  </View>
                </View>
              </View>
              
              {/* Requester Info */}
              <View style={styles.requesterInfo}>
                <ThemedText style={styles.subSectionTitle}>Requester</ThemedText>
                <ThemedText style={styles.requesterName}>{order.request?.user?.name}</ThemedText>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Add this spacer at the bottom of the ScrollView content */}
        <View style={styles.bottomSpacer} />

        {/* Move buttons inside the main container but after ScrollView */}
        {canUpdateStatus && (
          <View style={styles.bottomActions}>
            {nextStatus && (
              <TouchableOpacity 
                style={styles.updateButton}
                onPress={() => updateProcessStatus(nextStatus)}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <ThemedText style={styles.updateButtonText}>
                    Update to {nextStatus.replace('_', ' ')}
                  </ThemedText>
                )}
              </TouchableOpacity>
            )}
            
            {currentStatus !== 'CANCELLED' && (
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  show({
                    type: 'error',
                    title: 'Cancel Order',
                    message: 'Are you sure you want to cancel this order? The request will become available for new offers.',
                    primaryAction: {
                      label: 'Yes, Cancel',
                      onPress: () => updateProcessStatus('CANCELLED')
                    },
                    secondaryAction: {
                      label: 'No',
                      onPress: () => {}
                    }
                  });
                }}
                disabled={updating}
              >
                <ThemedText style={styles.cancelButtonText}>
                  Cancel Order
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

// Helper function to get initials
const getInitials = (name?: string) => {
  if (!name) return '?';
  const names = name.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return names[0][0].toUpperCase();
};

// Helper function to obfuscate name (show first name and last initial)
const getObfuscatedName = (name?: string) => {
  if (!name) return 'Anonymous';
  const names = name.split(' ');
  if (names.length >= 2) {
    return `${names[0]} ${names[names.length - 1][0]}.`;
  }
  return name;
};

// Helper function to format date
const formatDate = (date?: string | Date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderIdLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  orderDate: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  trackerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
    color: '#1e293b',
  },
  travelerSection: {
    marginBottom: 20,
  },
  travelerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 12,
  },
  travelerAvatarContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
  },
  blurContainer: {
    width: '100%',
    height: '100%',
  },
  travelerAvatar: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0891b2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
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
    marginLeft: 16,
    flex: 1,
  },
  travelerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  reputationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  reputationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reputationText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
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
    marginTop: 8,
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
  joinedDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  deliveryDetails: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  reviewsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewsHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1e293b',
  },
  reviewItem: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewerName: {
    fontSize: 12,
    color: '#64748b',
  },
  reviewText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  requestCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  goodsImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  goodsName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  goodsDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 8,
  },
  requestDetails: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  requesterInfo: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1e293b',
  },
  requesterName: {
    fontSize: 15,
    color: '#475569',
  },
  bottomSpacer: {
    height: 100, // Height to ensure content is visible above buttons
  },
  bottomActions: {
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
    gap: 8,
  },
  updateButton: {
    backgroundColor: '#0891b2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  // Keep the loading, error and other existing styles
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
    backgroundColor: '#0891b2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});