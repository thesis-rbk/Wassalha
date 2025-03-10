import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  MapPin, 
  Calendar, 
  Package, 
  DollarSign, 
  Box, 
  Info, 
  User, 
  Star, 
  Shield, 
  MessageCircle, 
  Award, 
  Users,
  Bell
} from 'lucide-react-native';
import { BACKEND_URL } from '@/config';
import axiosInstance from '@/config';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { TitleLarge, BodyMedium } from "@/components/Typography";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { User as UserType, Profile, Reputation } from '@/types';
import { ReputationDisplayProps } from '@/types/ReputationDisplayProps';
import { useRoleDetection } from '@/hooks/useRoleDetection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode as atob } from 'base-64';

export default function InitializationSp() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  const { role, loading: roleLoading } = useRoleDetection(
    currentUser?.id ? parseInt(currentUser.id) : undefined
  );
  console.log('🔍 Auth Debug:', {
    currentUser: currentUser ? 'Exists' : 'Null',
    userId: currentUser?.id,
    userEmail: currentUser?.email,
    token: AsyncStorage.getItem('jwtToken').then(token => 
      console.log('JWT Token:', token ? 'Exists' : 'Missing')
    )
  });

  React.useEffect(() => {
    fetchRequestDetails();
  }, [params.id]);

  React.useEffect(() => {
    async function loadUserFromToken() {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (token) {
          // Try to decode the token to get user info
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('Token payload loaded:', payload);
              
              if (payload.id) {
                setCurrentUser({
                  id: payload.id.toString(),
                  name: payload.name || 'User from token',
                  email: payload.email || ''
                });
              }
            } catch (e) {
              console.error('Error decoding token:', e);
            }
          }
        }
      } catch (e) {
        console.error('Error loading user from token:', e);
      }
    }
    
    loadUserFromToken();
  }, []);

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
      // Comment out the actual API call for now
      /*
      const response = await axiosInstance.post('/api/offers', {
        requestId: Array.isArray(params.id) ? params.id[0] : params.id,
        price: parseFloat(Array.isArray(offerDetails.price) ? offerDetails.price[0] : offerDetails.price),
        deliveryDate: offerDetails.deliveryDate,
        message: offerDetails.message,
        serviceProviderId: currentUser?.id,
        serviceOwnerId: params.requesterId
      });
      */
      
      // For testing purposes, just show a mock success message
      console.log('Would have submitted offer with data:', {
        requestId: Array.isArray(params.id) ? params.id[0] : params.id,
        price: parseFloat(Array.isArray(offerDetails.price) ? offerDetails.price[0] : offerDetails.price),
        deliveryDate: offerDetails.deliveryDate,
        message: offerDetails.message,
        serviceProviderId: currentUser?.id,
        serviceOwnerId: params.requesterId
      });
      
      // Navigate to role test screen
      Alert.alert(
        'Testing',
        'Navigating to role test screen',
        [
          {
            text: 'OK',
            onPress: () => router.push('../role-test')
          }
        ]
      );
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

  const UserAvatar = ({ user }: { user: UserType }) => {
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
            <BodyMedium style={styles.initials}>
              {getInitials(user?.name)}
            </BodyMedium>
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
            <BodyMedium style={styles.ratingScore}>
              {Number(reputation.score).toFixed(1)}
            </BodyMedium>
          </View>
          <BodyMedium style={styles.ratingCount}>
            {reputation.totalRatings} ratings
          </BodyMedium>
        </View>

        {/* Level Badge */}
        <View style={styles.reputationItem}>
          <View style={styles.levelBadge}>
            <Award size={16} color="#7c3aed" />
            <BodyMedium style={styles.levelText}>
              Level {reputation.level}
            </BodyMedium>
          </View>
        </View>

        {/* Verification Badge */}
        {isVerified && (
          <View style={styles.reputationItem}>
            <View style={styles.verifiedBadgeInline}>
              <Shield size={16} color="#22c55e" />
              <BodyMedium style={styles.verifiedText}>Verified</BodyMedium>
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
        <BodyMedium>Loading...</BodyMedium>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header matching create-order.tsx */}
      <View style={styles.header}>
        <TitleLarge style={styles.headerTitle}>Request Details</TitleLarge>
        <View style={styles.headerIcons}>
          <Bell size={24} color={Colors[colorScheme].primary} />
          <MessageCircle size={24} color={Colors[colorScheme].primary} />
          <User size={24} color={Colors[colorScheme].primary} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `${BACKEND_URL}/api/uploads/${requestDetails.goods.image?.filename}` }}
            style={styles.productImage}
            contentFit="cover"
            onError={(error) => console.error("Image loading error:", error)}
          />
        </View>

        {/* Request Details */}
        <View style={styles.detailsContainer}>
          <TitleLarge style={styles.title}>{requestDetails.goods.name}</TitleLarge>
          
          {/* Price and Category */}
          <View style={styles.priceCategory}>
            <View style={styles.priceContainer}>
              <DollarSign size={20} color={Colors[colorScheme].primary} />
              <BodyMedium style={styles.price}>
                ${requestDetails.goods.price.toFixed(2)}
              </BodyMedium>
            </View>
            <BodyMedium style={styles.category}>
              {requestDetails.goods.category?.name || "Uncategorized"}
            </BodyMedium>
          </View>

          {/* Delivery Details */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MapPin size={20} color={Colors[colorScheme].primary} />
              <View style={styles.infoContent}>
                <BodyMedium style={styles.infoLabel}>Route</BodyMedium>
                <BodyMedium style={styles.infoValue}>
                  {requestDetails.goodsLocation} → {requestDetails.goodsDestination}
                </BodyMedium>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Calendar size={20} color={Colors[colorScheme].primary} />
              <View style={styles.infoContent}>
                <BodyMedium style={styles.infoLabel}>Delivery Date</BodyMedium>
                <BodyMedium style={styles.infoValue}>
                  {new Date(requestDetails.date).toLocaleDateString()}
                </BodyMedium>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Package size={20} color={Colors[colorScheme].primary} />
              <View style={styles.infoContent}>
                <BodyMedium style={styles.infoLabel}>Quantity</BodyMedium>
                <BodyMedium style={styles.infoValue}>{requestDetails.quantity}</BodyMedium>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Box size={20} color={Colors[colorScheme].primary} />
              <View style={styles.infoContent}>
                <BodyMedium style={styles.infoLabel}>Original Box</BodyMedium>
                <BodyMedium style={styles.infoValue}>
                  {requestDetails.withBox ? 'Required' : 'Not Required'}
                </BodyMedium>
              </View>
            </View>
          </View>

          {/* Product Description */}
          {requestDetails.goods.description && (
            <View style={styles.descriptionCard}>
              <View style={styles.sectionHeader}>
                <Info size={20} color={Colors[colorScheme].primary} />
                <BodyMedium style={styles.sectionTitle}>Description</BodyMedium>
              </View>
              <BodyMedium style={styles.description}>
                {requestDetails.goods.description}
              </BodyMedium>
            </View>
          )}

          {/* Requester Information */}
          <View style={styles.requesterSection}>
            <TitleLarge style={styles.sectionTitle}>Request by</TitleLarge>
            
            <View style={styles.requesterCard}>
              <View style={styles.requesterHeader}>
                <UserAvatar user={requestDetails.user} />
                <View style={styles.requesterInfo}>
                  <BodyMedium style={styles.requesterName}>
                    {requestDetails.user.name}
                  </BodyMedium>
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
                  <BodyMedium style={styles.securityText}>
                    🔒 Contact information will be available after offer acceptance
                  </BodyMedium>
                </View>
              </BlurView>

              <BaseButton 
                size="large"
                onPress={() => Alert.alert(
                  'Contact Available After Acceptance',
                  'You will be able to message and coordinate with the requester once they accept your offer.'
                )}
                style={styles.contactButton}
              >
                <MessageCircle size={20} color="#ffffff" />
                <BodyMedium style={styles.contactButtonText}>
                  Contact after acceptance
                </BodyMedium>
              </BaseButton>
            </View>
          </View>

          {/* Make Offer Button */}
          {showOfferForm ? (
            <View style={styles.offerFormContainer}>
              <TitleLarge style={styles.formTitle}>Make an Offer</TitleLarge>
              
              <View style={styles.formField}>
                <BodyMedium style={styles.label}>Your Price</BodyMedium>
                <TextInput
                  style={styles.input}
                  value={offerDetails.price.toString()}
                  onChangeText={(text) => setOfferDetails(prev => ({...prev, price: text}))}
                  keyboardType="numeric"
                  placeholder="Enter your price"
                />
              </View>

              <View style={styles.formField}>
                <BodyMedium style={styles.label}>Estimated Delivery Date</BodyMedium>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <BodyMedium>
                    {offerDetails.deliveryDate.toLocaleDateString()}
                  </BodyMedium>
                </TouchableOpacity>

                <DateTimePickerModal
                  isVisible={showDatePicker}
                  mode="date"
                  onConfirm={(date) => {
                    setShowDatePicker(false);
                    setOfferDetails(prev => ({...prev, deliveryDate: date}));
                  }}
                  onCancel={() => setShowDatePicker(false)}
                  minimumDate={new Date()}
                />
              </View>

              <View style={styles.formField}>
                <BodyMedium style={styles.label}>Message to Requester</BodyMedium>
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
                  <BodyMedium style={styles.cancelButtonText}>Cancel</BodyMedium>
                </TouchableOpacity>
                
                <BaseButton 
                  size="large"
                  onPress={handleSubmitOffer}
                  style={styles.submitButton}
                >
                  <BodyMedium style={styles.submitButtonText}>Submit Offer</BodyMedium>
                </BaseButton>
              </View>
            </View>
          ) : (
            <BaseButton
              size="large"
              onPress={handleMakeOffer}
              style={styles.makeOfferButton}
            >
              <BodyMedium style={styles.makeOfferButtonText}>Make an Offer</BodyMedium>
            </BaseButton>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: { 
    fontSize: 20, 
    color: Colors.light.primary 
  },
  headerIcons: { 
    flexDirection: "row", 
    gap: 16 
  },
  scrollView: { 
    flex: 1 
  },
  scrollContent: { 
    padding: 16, 
    paddingBottom: 32 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#fff",
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
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
    color: Colors.light.primary,
    marginLeft: 4,
  },
  category: {
    fontSize: 16,
    color: Colors.light.text,
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
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
    color: Colors.light.text,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
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
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
  },
  requesterSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  requesterCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
    marginVertical: 16,
  },
  securityNote: {
    padding: 12,
    alignItems: 'center',
  },
  securityText: {
    fontSize: 13,
    color: Colors.light.secondary,
  },
  contactButton: {
    backgroundColor: Colors.light.primary,
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
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: Colors.light.text,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    flex: 1,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  makeOfferButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    marginTop: 24,
    width: "100%",
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
    color: Colors.light.text,
  },
  requestCount: {
    fontSize: 14,
    color: Colors.light.text,
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
    color: Colors.light.text,
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