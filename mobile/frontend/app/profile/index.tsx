import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Text, ScrollView, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '@/config';
import { useRouter } from 'expo-router';
import { BaseButton } from '@/components/ui/buttons/BaseButton';
import { Ionicons } from '@expo/vector-icons';
import CountryFlag from "react-native-country-flag";
import { InfoItemProps, ProfileImage } from '@/types';
import { Crown, Shield, ShieldCheck } from 'lucide-react-native';
import { ProfileState } from '@/types/ProfileState';
import { TabBar } from '@/components/navigation/TabBar';

const { width } = Dimensions.get('window');

const countryToCode: { [key: string]: string } = {
  "USA": "US",
  "FRANCE": "FR",
  "SPAIN": "ES",
  "GERMANY": "DE",
  "ITALY": "IT",
  "UK": "GB",
  "CANADA": "CA",
  "AUSTRALIA": "AU",
  "JAPAN": "JP",
  "CHINA": "CN",
  "BRAZIL": "BR",
  "INDIA": "IN",
  "RUSSIA": "RU",
  "MEXICO": "MX",
  "BOLIVIA": "BO",
  "MOROCCO": "MA",
  "TUNISIA": "TN",
  "ALGERIA": "DZ",
  "TURKEY": "TR",
  "PORTUGAL": "PT",
  "NETHERLANDS": "NL",
  "BELGIUM": "BE",
  "SWEDEN": "SE",
  "NORWAY": "NO",
  "DENMARK": "DK",
  "FINLAND": "FI",
  "ICELAND": "IS",
  "AUSTRIA": "AT",
  "SWITZERLAND": "CH",
  "BELARUS": "BY",
  "ARGENTINA": "AR",
  "CHILE": "CL",
  "COLOMBIA": "CO",
  "PERU": "PE",
  "VENEZUELA": "VE",
  "ECUADOR": "EC",
  "PARAGUAY": "PY",
  "URUGUAY": "UY",
  "OTHER": "XX"
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (token) {
          const decoded: any = jwtDecode(token);
          const response = await axiosInstance.get(`/api/users/profile/${decoded.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Profile response:', response.data.data);
          setProfile(response.data.data);
          await AsyncStorage.setItem('firstName', response.data.data.firstName || '');
          await AsyncStorage.setItem('lastName', response.data.data.lastName || '');
          await AsyncStorage.setItem('bio', response.data.data.bio || '');
        } else {
          console.error("No token found");
        }
      } catch (error) {
        console.error("Error retrieving profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color={Colors[theme].primary} />;
  }

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    if (tab === "create") {
      router.push("/verification/CreateSponsorPost");
    } else {
      router.push(tab as any);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <ScrollView
        style={[styles.container, { backgroundColor: Colors[theme].background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.headerBackground, { backgroundColor: Colors[theme].primary }]} />

        {/* Profile Image Section */}
        <View style={styles.profileImageContainer}>
          <View style={styles.imageWrapper}>
            {profile.isSponsor && (
              <View style={styles.sponsorBadge}>
                <Crown size={14} color="#ffffff" />
              </View>
            )}
            {profile.image?.filename ? (
              <>
                <Image
                  source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/api/uploads/${profile.image.filename}` }}
                  style={styles.profileImage}
                />
                <View
                  style={[
                    styles.onlineIndicator,
                    { backgroundColor: profile.isOnline ? "#22c55e" : "#64748b" }
                  ]}
                />
              </>
            ) : (
              <>
                <View style={[styles.profileImage, { backgroundColor: Colors[theme].secondary }]}>
                  <Text style={[styles.avatarText, { color: Colors[theme].text }]}>
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </Text>
                </View>
                <View
                  style={[
                    styles.onlineIndicator,
                    { backgroundColor: profile.isOnline ? "#22c55e" : "#64748b" }
                  ]}
                />
              </>
            )}
          </View>
        </View>

        {/* Profile Info Card */}
        <View style={[styles.card, { backgroundColor: Colors[theme].card }]}>
          {/* Name and Verification */}
          <View style={styles.nameSection}>
            <Text style={[styles.userName, { color: Colors[theme].text }]}>
              {`${profile.firstName} ${profile.lastName}`}
            </Text>

            {/* Add Sponsor Badge */}
            {profile.isSponsor && (
              <View style={[styles.badge, { backgroundColor: '#fef3c7', borderColor: '#fbbf24' }]}>
                <Crown size={16} color="#d97706" />
                <Text style={{ color: '#d97706', fontSize: 12, marginLeft: 4 }}>Sponsor</Text>
              </View>
            )}

            {/* Verification Badge */}
            {profile.isVerified ? (
              <View style={[styles.badge, { backgroundColor: '#dcfce7', borderColor: '#86efac' }]}>
                <ShieldCheck size={16} color="#16a34a" />
                <Text style={{ color: '#16a34a', fontSize: 12, marginLeft: 4 }}>Verified</Text>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }]}>
                <Shield size={16} color="#dc2626" />
                <Text style={{ color: '#dc2626', fontSize: 12, marginLeft: 4 }}>Unverified</Text>
              </View>
            )}
          </View>

          <Text style={[styles.onlineStatus, { color: Colors[theme].text }]}>
            {profile.isOnline ? "Online now" : "Currently offline"}
          </Text>

          <View style={[styles.divider, { backgroundColor: Colors[theme].border }]} />

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <InfoItem
              icon="document-text-outline"
              label="Bio"
              value={profile.bio || "No bio provided"}
              theme={theme}
            />
            <InfoItem
              icon="location-outline"
              label="Country"
              value={profile.country || "Not specified"}
              theme={theme}
              isCountry={true}
            />
            <InfoItem
              icon="call-outline"
              label="Phone"
              value={profile.phoneNumber || "Not provided"}
              theme={theme}
            />
            <InfoItem
              icon="person-outline"
              label="Gender"
              value={profile.gender || "Not specified"}
              theme={theme}
            />
            <InfoItem
              icon="star-outline"
              label="Review"
              value={profile.review || "No reviews yet"}
              theme={theme}
            />
            <InfoItem
              icon="pricetags-outline"
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
              size="login"
              style={styles.button}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </BaseButton>

            <BaseButton
              onPress={() => router.push('/profile/change')}
              size="login"
              variant="secondary"
              style={[styles.button, styles.secondaryButton]}
            >
              <Text style={[styles.buttonText, { color: Colors[theme].primary }]}>Change Password</Text>
            </BaseButton>
          </View>
        </View>
      </ScrollView>

      {/* TabBar fixed at the bottom */}
      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

// InfoItem component
const InfoItem = ({ icon, label, value, theme, isCountry = false }: InfoItemProps) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={Colors[theme as keyof typeof Colors].text} style={styles.infoIcon} />
    <View style={styles.infoContent}>
      <Text style={[styles.infoLabel, { color: Colors[theme as keyof typeof Colors].text }]}>{label}</Text>
      <View style={styles.valueContainer}>
        {isCountry && value !== "Not specified" && (
          <CountryFlag
            isoCode={countryToCode[value?.toUpperCase() as keyof typeof countryToCode] || value}
            size={20}
            style={styles.flag}
          />
        )}
        <Text style={[styles.infoValue, { color: Colors[theme as keyof typeof Colors].text }]}>{value}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Add padding to ensure content isn't hidden behind the TabBar
  },
  headerBackground: {
    height: 180,
    width: '100%',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: -60,
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    top: 70,
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#ffffff',
    zIndex: 1,
  },
  card: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  onlineStatus: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginVertical: 20,
    backgroundColor: '#e0e0e0',
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 2,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: Colors.light.primary, // Adjust based on your theme
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContent: {
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flag: {
    borderRadius: 4,
  },
  sponsorBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#ffffff',
    zIndex: 1,
  },
});

export default ProfilePage;