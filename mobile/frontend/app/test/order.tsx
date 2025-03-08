import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Dimensions, Text, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Stack } from 'expo-router';
import axiosInstance from '@/config';
import { useAuth } from '@/hooks/useAuth';
import { Request, RequestStatus, Goods } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { MapPin, DollarSign, Package, Activity } from 'lucide-react-native';
import { BACKEND_URL } from '@/config';
import { useRouter } from 'expo-router';

export default function OrderPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/api/requests');
      console.log('Request with user data:', {
        firstRequest: response.data.data[0],
        userData: response.data.data[0]?.user,
        userName: response.data.data[0]?.user?.name
      });
      setRequests(response.data.data);
    } catch (error: any) {
      console.error('Error details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const renderItem = ({ item }: { item: Request }) => {
    // Helper function to get the correct image URL
    const getImageUrl = (goods: Goods) => {
      // If no image data at all, return null
      if (!goods) return null;
      
      // If goodsUrl has the full path
      if (goods.goodsUrl?.startsWith('/api/uploads/')) {
        return `${BACKEND_URL}${goods.goodsUrl}`;
      }
      
      // If goodsUrl is just the filename
      if (goods.goodsUrl) {
        return `${BACKEND_URL}/api/uploads/${goods.goodsUrl}`;
      }
      
      // If we have imageId but no direct access to filename
      if (goods.imageId) {
        // Use the imageId to construct the URL
        return `${BACKEND_URL}/api/uploads/${goods.imageId}`;
      }
      
      return null;
    };

    const getInitials = (user?: { name?: string }) => {
      if (!user?.name) return '?';
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return names[0][0].toUpperCase();
    };

    const handleMakeOffer = () => {
      console.log('Making offer for request:', {
        requestId: item.id,
        user: item.user,
        reputation: item.user?.reputation
      });
      
      router.push({
        pathname: '/test/initializationSp',
        params: {
          id: item.id.toString(),
          imageUrl: getImageUrl(item.goods),
          goodsName: item.goods.name,
          price: item.goods.price.toString(),
          location: item.goodsLocation,
          destination: item.goodsDestination,
          quantity: item.quantity.toString(),
          description: item.goods.description || '',
          withBox: item.withBox?.toString() || 'false',
          // Add requester information
          requesterId: item.userId.toString(),
          requesterName: item.user?.name || 'Anonymous',
          // Reputation data
          requesterRating: item.user?.reputation?.score?.toString() || '0',
          requesterLevel: item.user?.reputation?.level?.toString() || '1',
          requesterTotalRatings: item.user?.reputation?.totalRatings?.toString() || '0',
          requesterVerified: item.user?.profile?.isVerified?.toString() || 'false',
          totalOrders: item.user?.requests?.length?.toString() || '0'
        }
      });
    };
  
    return (
      <View style={styles.card}>
        <View style={styles.imageSection}>
          {getImageUrl(item.goods) ? (
            <Image
              source={{ uri: getImageUrl(item.goods) }}
              style={styles.productImage}
              contentFit="cover"
              onError={(error) => {
                console.error('Image error:', error, {
                  url: getImageUrl(item.goods),
                  goods: item.goods
                });
              }}
            />
          ) : (
            <View style={styles.noImageContainer}>
              <ThemedText style={styles.noImageText}>No Image Available</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.productTitle}>{item.goods.name}</ThemedText>
          
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MapPin size={20} color="#64748b" />
              </View>
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Route</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {item.goodsLocation} → {item.goodsDestination}
                </ThemedText>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <DollarSign size={20} color="#64748b" />
              </View>
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Price</ThemedText>
                <ThemedText style={styles.priceValue}>
                  ${item.goods.price.toFixed(2)}
                </ThemedText>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Package size={20} color="#64748b" />
              </View>
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Quantity</ThemedText>
                <ThemedText style={styles.detailValue}>{item.quantity}</ThemedText>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Activity size={20} color="#64748b" />
              </View>
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Status</ThemedText>
                <View style={[
                  styles.statusBadge, 
                  styles[item.status.toLowerCase() as Lowercase<RequestStatus>]
                ]}>
                  <ThemedText style={styles.statusText}>{item.status}</ThemedText>
                </View>
              </View>
            </View>
          </View>

          {item.goods.description && (
            <View style={styles.descriptionCard}>
              <ThemedText style={styles.sectionTitle}>Description</ThemedText>
              <ThemedText style={styles.description}>
                {item.goods.description}
              </ThemedText>
            </View>
          )}

          {item.status === 'PENDING' && (
            <TouchableOpacity 
              style={styles.offerButton}
              onPress={handleMakeOffer}
            >
              <ThemedText style={styles.offerButtonText}>Make an Offer</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Orders & Requests"
        }} 
      />
      
      {isLoading && requests.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshing={isLoading}
          onRefresh={fetchRequests}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageSection: {
    width: '100%',
    height: 200,
    backgroundColor: '#f8fafc',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1e293b',
  },
  detailsCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pending: {
    backgroundColor: '#f59e0b',
  },
  accepted: {
    backgroundColor: '#3b82f6',
  },
  cancelled: {
    backgroundColor: '#ef4444',
  },
  rejected: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  descriptionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  offerButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  offerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noImageText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
});