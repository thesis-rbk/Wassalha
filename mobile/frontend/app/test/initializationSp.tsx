import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { MapPin, Calendar, Package, DollarSign, Box, Info, User as UserIcon, Star, Shield, MessageCircle, Award, Users } from 'lucide-react-native';
import { BACKEND_URL } from '@/config';
import axiosInstance from '@/config';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/hooks/useAuth';
import { User, Profile, Reputation } from '@/types';
import { ReputationDisplayProps } from '@/types/ReputationDisplayProps';

export default function InitializationSp() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  
  // Log received params
  console.log('InitializationSp received params:', params);

  const [requestDetails, setRequestDetails] = React.useState<any>({
    goods: {
      name: params.goodsName,
      price: Number(params.price),
      description: params.description,
      image: { 
        filename: typeof params.imageUrl === 'string' 
          ? params.imageUrl.split('/').pop() 
          : null 
      }
    },
    quantity: Number(params.quantity),
    goodsLocation: params.location,
    goodsDestination: params.destination,
    withBox: params.withBox === 'true',
    user: {
      name: params.requesterName || 'Anonymous',
      profile: {
        isVerified: params.requesterVerified === 'true'
      },
      reputation: {
        score: Number(params.requesterRating)
      }
    }
  });
  const [loading, setLoading] = React.useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerDetails, setOfferDetails] = useState({
    price: params.price, // Initial price from request
    deliveryDate: new Date(),
    message: ''
  });

  React.useEffect(() => {
    fetchRequestDetails();
  }, [params.id]);

  const fetchRequestDetails = async () => {
    try {
      console.log('Fetching details for request:', params.id);
      const response = await axiosInstance.get(`/api/requests/${params.id}`);
      setRequestDetails((prev: typeof requestDetails) => ({
        ...response.data.data,
        goods: {
          ...response.data.data.goods,
          image: response.data.data.goods.image || prev.goods.image
        }
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching request details:', error);
      Alert.alert('Error', 'Failed to load request details');
      setLoading(false);
    }
  };

  const handleMakeOffer = () => {
    setShowOfferForm(true);
  };

  const handleSubmitOffer = async () => {
    try {
      const response = await axiosInstance.post('/api/offers', {
        requestId: Array.isArray(params.id) ? params.id[0] : params.id,
        price: parseFloat(Array.isArray(offerDetails.price) ? offerDetails.price[0] : offerDetails.price),
        deliveryDate: offerDetails.deliveryDate,
        message: offerDetails.message,
        serviceProviderId: currentUser?.id,
        serviceOwnerId: params.requesterId
      });

      if (response.data.success) {
        Alert.alert(
          'Success',
          'Your offer has been sent to the requester',
          [
            {
              text: 'OK',
              onPress: () => router.back() // Go back to requests list
            }
          ]
        );
      }
    } catch (error) {
      console.error('Offer submission error:', error);
      Alert.alert('Error', 'Failed to submit offer');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const getRandomGradient = (initials: string) => {
    // Generate consistent colors based on initials
    const colors = [
      ['#FF6B6B', '#845EC2'],
      ['#4D8076', '#2C73D2'],
      ['#845EC2', '#D65DB1'],
      ['#FF9671', '#FFC75F'],
      ['#008F7A', '#4FFBDF'],
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const UserAvatar = ({ user }: { user: User }) => {
    return (
      <View style={styles.avatarContainer}>
        {user?.profile?.imageId ? (
          <Image
            source={{ uri: `${BACKEND_URL}/api/uploads/${user.profile.imageId}` }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <LinearGradient
            colors={['#007AFF', '#00C6FF']}
            style={styles.avatar}
          >
            <ThemedText style={styles.initials}>
              {getInitials(user?.name)}
            </ThemedText>
          </LinearGradient>
        )}
        {user?.profile?.isVerified && (
          <View style={styles.verifiedBadge} />
        )}
      </View>
    );
  };

  const ReputationDisplay = ({ reputation, isVerified }: { reputation: ReputationDisplayProps; isVerified: boolean }) => {
    return (
      <View style={styles.reputationContainer}>
        {/* Rating Score */}
        <View style={styles.reputationItem}>
          <View style={styles.ratingHeader}>
            <Star size={16} color="#f59e0b" fill="#f59e0b" />
            <ThemedText style={styles.ratingScore}>
              {Number(reputation.score).toFixed(1)}
            </ThemedText>
          </View>
          <ThemedText style={styles.ratingCount}>
            {reputation.totalRatings} ratings
          </ThemedText>
        </View>

        {/* Level Badge */}
        <View style={styles.reputationItem}>
          <View style={styles.levelBadge}>
            <Award size={16} color="#7c3aed" />
            <ThemedText style={styles.levelText}>
              Level {reputation.level}
            </ThemedText>
          </View>
        </View>

        {/* Verification Badge */}
        {isVerified && (
          <View style={styles.reputationItem}>
            <View style={styles.verifiedBadgeInline}>
              <Shield size={16} color="#22c55e" />
              <ThemedText style={styles.verifiedText}>Verified</ThemedText>
            </View>
          </View>
        )}
      </View>
    );
  };

  console.log('InitializationSp requestDetails:', requestDetails);

  if (loading || !requestDetails) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `${BACKEND_URL}/api/uploads/${requestDetails.goods.image?.filename}` }}
          style={styles.productImage}
          contentFit="cover"
        />
      </View>

      {/* Request Details */}
      <View style={styles.detailsContainer}>
        <ThemedText style={styles.title}>{requestDetails.goods.name}</ThemedText>
        
        {/* Price and Category */}
        <View style={styles.priceCategory}>
          <View style={styles.priceContainer}>
            <DollarSign size={20} color="#16a34a" />
            <ThemedText style={styles.price}>
              ${requestDetails.goods.price.toFixed(2)}
            </ThemedText>
          </View>
          <ThemedText style={styles.category}>
            {requestDetails.goods.category?.name}
          </ThemedText>
        </View>

        {/* Delivery Details */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MapPin size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Route</ThemedText>
              <ThemedText style={styles.infoValue}>
                {requestDetails.goodsLocation} → {requestDetails.goodsDestination}
              </ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Delivery Date</ThemedText>
              <ThemedText style={styles.infoValue}>
                {new Date(requestDetails.date).toLocaleDateString()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Package size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Quantity</ThemedText>
              <ThemedText style={styles.infoValue}>{requestDetails.quantity}</ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Box size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Original Box</ThemedText>
              <ThemedText style={styles.infoValue}>
                {requestDetails.withBox ? 'Required' : 'Not Required'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Product Description */}
        {requestDetails.goods.description && (
          <View style={styles.descriptionCard}>
            <View style={styles.sectionHeader}>
              <Info size={20} color="#64748b" />
              <ThemedText style={styles.sectionTitle}>Description</ThemedText>
            </View>
            <ThemedText style={styles.description}>
              {requestDetails.goods.description}
            </ThemedText>
          </View>
        )}

        {/* Requester Information */}
        <View style={styles.requesterSection}>
          <ThemedText style={styles.sectionTitle}>Request by</ThemedText>
          
          <View style={styles.requesterCard}>
            <View style={styles.requesterHeader}>
              <UserAvatar user={requestDetails.user} />
              <View style={styles.requesterInfo}>
                <ThemedText style={styles.requesterName}>
                  {requestDetails.user.name}
                </ThemedText>
                <ReputationDisplay 
                  reputation={{
                    score: Number(params.requesterRating),
                    level: Number(params.requesterLevel),
                    totalRatings: Number(params.requesterTotalRatings)
                  }}
                  isVerified={params.requesterVerified === 'true'}
                />
              </View>
            </View>

            <BlurView intensity={85} tint="light" style={styles.blurredSection}>
              <View style={styles.securityNote}>
                <ThemedText style={styles.securityText}>
                  🔒 Contact information will be available after offer acceptance
                </ThemedText>
              </View>
            </BlurView>

            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => Alert.alert(
                'Contact Available After Acceptance',
                'You will be able to message and coordinate with the requester once they accept your offer.'
              )}
            >
              <MessageCircle size={20} color="#ffffff" />
              <ThemedText style={styles.contactButtonText}>
                Contact after acceptance
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Make Offer Button */}
        {showOfferForm ? (
          <View style={styles.offerFormContainer}>
            <ThemedText style={styles.formTitle}>Make an Offer</ThemedText>
            
            <View style={styles.formField}>
              <ThemedText style={styles.label}>Your Price</ThemedText>
              <TextInput
                style={styles.input}
                value={offerDetails.price.toString()}
                onChangeText={(text) => setOfferDetails(prev => ({...prev, price: text}))}
                keyboardType="numeric"
                placeholder="Enter your price"
              />
            </View>

            <View style={styles.formField}>
              <ThemedText style={styles.label}>Estimated Delivery Date</ThemedText>
              <DateTimePicker
                value={offerDetails.deliveryDate}
                onChange={(event, date) => 
                  setOfferDetails(prev => ({...prev, deliveryDate: date || prev.deliveryDate}))
                }
                minimumDate={new Date()}
              />
            </View>

            <View style={styles.formField}>
              <ThemedText style={styles.label}>Message to Requester</ThemedText>
              <TextInput
                style={[styles.input, styles.messageInput]}
                value={offerDetails.message}
                onChangeText={(text) => setOfferDetails(prev => ({...prev, message: text}))}
                multiline
                placeholder="Add any additional details about your offer"
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowOfferForm(false)}
              >
                <ThemedText style={styles.buttonText}>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmitOffer}
              >
                <ThemedText style={styles.buttonText}>Submit Offer</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.makeOfferButton}
            onPress={handleMakeOffer}
          >
            <ThemedText style={styles.makeOfferButtonText}>Make an Offer</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f8fafc',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  priceCategory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#16a34a',
    marginLeft: 4,
  },
  category: {
    fontSize: 16,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  descriptionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  requesterSection: {
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  requesterCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  requesterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: 'white',
  },
  blurredSection: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  securityNote: {
    padding: 12,
    alignItems: 'center',
  },
  securityText: {
    fontSize: 13,
    color: '#64748b',
  },
  contactButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  offerFormContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  makeOfferButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  makeOfferButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  requesterInfo: {
    marginLeft: 12,
  },
  requesterName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  requestCount: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  reputationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  reputationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
  },
  ratingCount: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7c3aed',
  },
  verifiedBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#22c55e',
  },
}); 