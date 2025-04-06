import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Text, ScrollView, Dimensions, SafeAreaView, Platform, RefreshControl } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '@/config';
import { useRouter } from 'expo-router';
import { BaseButton } from '@/components/ui/buttons/BaseButton';
import CountryFlag from "react-native-country-flag";
import { ProfileImage } from '@/types';
import { Crown, Shield, ShieldCheck, MapPin, Phone, User as User2, Star, Tags, FileText, CreditCard as Edit2, Key } from 'lucide-react-native';
import { ProfileState } from '@/types/ProfileState';
import { TabBar } from '@/components/navigation/TabBar';

const { width } = Dimensions.get('window');

const countryToCode: { [key: string]: string } = {
  "USA": "US", "FRANCE": "FR", "SPAIN": "ES", "GERMANY": "DE", "ITALY": "IT",
  "UK": "GB", "CANADA": "CA", "AUSTRALIA": "AU", "JAPAN": "JP", "CHINA": "CN",
  "BRAZIL": "BR", "INDIA": "IN", "RUSSIA": "RU", "MEXICO": "MX", "BOLIVIA": "BO",
  "MOROCCO": "MA", "TUNISIA": "TN", "ALGERIA": "DZ", "TURKEY": "TR", "PORTUGAL": "PT",
  "NETHERLANDS": "NL", "BELGIUM": "BE", "SWEDEN": "SE", "NORWAY": "NO", "DENMARK": "DK",
  "FINLAND": "FI", "ICELAND": "IS", "AUSTRIA": "AT", "SWITZERLAND": "CH", "BELARUS": "BY",
  "ARGENTINA": "AR", "CHILE": "CL", "COLOMBIA": "CO", "PERU": "PE", "VENEZUELA": "VE",
  "ECUADOR": "EC", "PARAGUAY": "PY", "URUGUAY": "UY", "OTHER": "XX"
};

const ProfilePage = () => {
  const { theme } = useTheme();
  const [profile, setProfile] = useState<ProfileState>({
    firstName: '',
    lastName: '',
    bio: '',
    country: '',
    phoneNumber: '',
    imageId: null,
    image: null,
    gender: '',
    review: '',
    isAnonymous: false,
    isBanned: false,
    isVerified: false,
    isOnline: false,
    preferredCategories: '',
    referralSource: '',
    isSponsor: false,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (token) {
        const decoded: any = jwtDecode(token);
        const response = await axiosInstance.get(`/api/users/profile/${decoded.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data.data);
        await AsyncStorage.setItem('firstName', response.data.data.firstName || '');
        await AsyncStorage.setItem('lastName', response.data.data.lastName || '');
        await AsyncStorage.setItem('bio', response.data.data.bio || '');
      }
    } catch (error) {
      console.error("Error retrieving profile:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    if (tab === "create") {
      router.push("/verification/CreateSponsorPost");
    } else {
      router.push(tab as any);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors[theme].background }]}>
        <ActivityIndicator size="large" color={Colors[theme].primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <ScrollView
        style={[styles.container, { backgroundColor: Colors[theme].background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors[theme].primary]}
            tintColor={Colors[theme].primary}
          />
        }
      >
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <View style={styles.imageWrapper}>
              {profile.isSponsor && (
                <View style={styles.sponsorBadge}>
                  <Crown size={14} color="#ffffff" strokeWidth={2.5} />
                </View>
              )}
              {profile.image?.filename ? (
                <Image
                  source={{ uri: `http://192.168.1.16:5000/api/uploads/${profile.image.filename}` }}
                  style={styles.profileImage}
                  onError={(error) => {
                    console.error("Image loading error:", error.nativeEvent.error);
                    console.log("Attempted image URL:", `http://192.168.1.16:5000/api/uploads/${profile.image?.filename}`);
                  }}
                />
              ) : (
                <View style={[styles.profileImage, styles.avatarFallback]}>
                  <Text style={styles.avatarText}>
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </Text>
                </View>
              )}
              <View style={[styles.onlineIndicator, { backgroundColor: profile.isOnline ? "#22c55e" : "#64748b" }]} />
            </View>
          </View>

          {/* Name and Badges */}
          <View style={styles.userInfoContainer}>
            <Text style={[styles.userName, { color: Colors[theme].text }]}>
              {`${profile.firstName} ${profile.lastName}`}
            </Text>
            <View style={styles.badgesContainer}>
              {profile.isSponsor && (
                <View style={[styles.badge, styles.sponsorBadgeCard]}>
                  <Crown size={16} color="#ffffff" />
                  <Text style={styles.badgeText}>Sponsor</Text>
                </View>
              )}
              {profile.isVerified ? (
                <View style={[styles.badge, styles.verifiedBadge]}>
                  <ShieldCheck size={16} color="#ffffff" />
                  <Text style={styles.badgeText}>Verified</Text>
                </View>
              ) : (
                <View style={[styles.badge, styles.unverifiedBadge]}>
                  <Shield size={16} color="#ffffff" />
                  <Text style={styles.badgeText}>Unverified</Text>
                </View>
              )}
            </View>
            <Text style={[styles.onlineStatus, { color: Colors[theme].secondary }]}>
              {profile.isOnline ? "● Online now" : "● Currently offline"}
            </Text>
          </View>
        </View>

        {/* Profile Info Card */}
        <View style={[styles.card, { backgroundColor: Colors[theme].card }]}>
          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <InfoItem
              Icon={FileText}
              label="Bio"
              value={profile.bio || "No bio provided"}
              theme={theme}
            />
            <InfoItem
              Icon={MapPin}
              label="Country"
              value={profile.country || "Not specified"}
              theme={theme}
              isCountry={true}
            />
            <InfoItem
              Icon={Phone}
              label="Phone"
              value={profile.phoneNumber || "Not provided"}
              theme={theme}
            />
            <InfoItem
              Icon={User2}
              label="Gender"
              value={profile.gender || "Not specified"}
              theme={theme}
            />
            <InfoItem
              Icon={Star}
              label="Review"
              value={profile.review || "No reviews yet"}
              theme={theme}
            />
            <InfoItem
              Icon={Tags}
              label="Preferred Categories"
              value={profile.preferredCategories || "None selected"}
              theme={theme}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: Colors[theme].border }]} />

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <BaseButton
              onPress={() => router.push('/profile/edit')}
              size="large"
              variant="primary"
              style={styles.actionButton}
            >
              <View style={styles.buttonContent}>
                <Edit2 size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Edit Profile</Text>
              </View>
            </BaseButton>

            <BaseButton
              onPress={() => router.push('/profile/change')}
              size="large"
              variant="secondary"
              style={styles.actionButton}
            >
              <View style={styles.buttonContent}>
                <Key size={20} color={Colors[theme].primary} />
                <Text style={[styles.buttonText, { color: Colors[theme].primary }]}>Change Password</Text>
              </View>
            </BaseButton>
          </View>
        </View>
      </ScrollView>

      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

interface ProfileInfoItemProps {
  Icon: React.ElementType;
  label: string;
  value: string;
  theme: 'light' | 'dark';
  isCountry?: boolean;
}

const InfoItem: React.FC<ProfileInfoItemProps> = ({ Icon, label, value, theme, isCountry = false }) => {
  return (
    <View style={styles.infoItem}>
      <View style={[styles.iconContainer, { backgroundColor: Colors.light.primary + '15' }]}>
        <Icon size={20} color={Colors.light.primary} strokeWidth={2} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: Colors.light.secondary }]}>{label}</Text>
        <View style={styles.valueContainer}>
          {isCountry && value !== "Not specified" && (
            <CountryFlag
              isoCode={countryToCode[value?.toUpperCase()] || value}
              size={20}
              style={styles.flag}
            />
          )}
          <Text style={[styles.infoValue, { color: Colors.light.text }]}>{value}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  profileHeader: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: Colors.light.primary + '10',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.background,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#ffffff',
    zIndex: 1,
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  sponsorBadgeCard: {
    backgroundColor: '#F59E0B',
  },
  verifiedBadge: {
    backgroundColor: '#10B981',
  },
  unverifiedBadge: {
    backgroundColor: '#EF4444',
  },
  onlineStatus: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  card: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    backgroundColor: Colors.light.card,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  divider: {
    height: 1,
    marginVertical: 20,
    opacity: 0.1,
  },
  infoGrid: {
    gap: 18,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.primary + '15',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '500',
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flag: {
    borderRadius: 4,
  },
  buttonsContainer: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    width: '100%',
    borderRadius: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  sponsorBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#ffffff',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default ProfilePage;