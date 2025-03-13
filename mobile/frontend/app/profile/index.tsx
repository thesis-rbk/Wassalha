import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '@/config';
import { useRouter } from 'expo-router';
import { BaseButton } from '@/components/ui/buttons/BaseButton';
import { TitleLarge, BodyMedium } from '@/components/Typography';
import { Ionicons } from '@expo/vector-icons';
import CountryFlag from "react-native-country-flag";
<<<<<<< HEAD
import { InfoItemProps, ProfileState, ProfileImage } from '@/types';
const { width } = Dimensions.get('window');

const countryToCode: { [key: string]: string } = {
  "USA": "US",
  "FRANCE": "FR",
=======

const { width } = Dimensions.get('window');

const countryToCode = {
  "USA": "US",
  "FRANCE": "FR", 
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
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
<<<<<<< HEAD
  "TUNISIA": "TN",
=======
  "TUNISIA": "TN", 
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
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

<<<<<<< HEAD
// Add a type definition for the profile state


const ProfilePage = () => {
  const { theme } = useTheme();
  const [profile, setProfile] = useState<ProfileState>({
=======
const ProfilePage = () => {
  const { theme } = useTheme();
  const [profile, setProfile] = useState({
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
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
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
          await AsyncStorage.setItem('firstName', response.data.data.firstName);
          await AsyncStorage.setItem('lastName', response.data.data.lastName);
          await AsyncStorage.setItem('bio', response.data.data.bio);
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

  return (
<<<<<<< HEAD
    <ScrollView
=======
    <ScrollView 
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerBackground, { backgroundColor: Colors[theme].primary }]} />
<<<<<<< HEAD

=======
      
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
      {/* Profile Image Section */}
      <View style={styles.profileImageContainer}>
        <View style={styles.imageWrapper}>
          {profile.image?.filename ? (
            <>
<<<<<<< HEAD
              <Image
                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/api/uploads/${profile.image.filename}` }}
                style={styles.profileImage}
              />
              <View
                style={[
                  styles.onlineIndicator,
                  { backgroundColor: profile.isOnline ? "#22c55e" : "#64748b" }
                ]}
=======
              <Image 
                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/api/uploads/${profile.image.filename}` }}
                style={styles.profileImage} 
              />
              <View 
                style={[
                  styles.onlineIndicator, 
                  { backgroundColor: profile.isOnline ? "#22c55e" : "#64748b" }
                ]} 
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
              />
            </>
          ) : (
            <>
              <View style={[styles.profileImage, { backgroundColor: Colors[theme].secondary }]}>
                <Text style={[styles.avatarText, { color: Colors[theme].text }]}>
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </Text>
              </View>
<<<<<<< HEAD
              <View
                style={[
                  styles.onlineIndicator,
                  { backgroundColor: profile.isOnline ? "#22c55e" : "#64748b" }
                ]}
=======
              <View 
                style={[
                  styles.onlineIndicator, 
                  { backgroundColor: profile.isOnline ? "#22c55e" : "#64748b" }
                ]} 
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
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
          {profile.isVerified ? (
            <View style={[styles.badge, { backgroundColor: '#dcfce7', borderColor: '#86efac' }]}>
              <Ionicons name="checkmark" size={12} color="#16a34a" />
              <Text style={{ color: '#16a34a', fontSize: 12 }}>Verified</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }]}>
              <Ionicons name="close" size={12} color="#dc2626" />
              <Text style={{ color: '#dc2626', fontSize: 12 }}>Unverified</Text>
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
<<<<<<< HEAD
          <BaseButton
=======
          <BaseButton 
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
            onPress={() => router.push('/profile/edit')}
            size="login"
          >
            Edit Profile
          </BaseButton>
<<<<<<< HEAD

          <BaseButton
=======
          
          <BaseButton 
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
            onPress={() => router.push('/profile/change')}
            size="login"
            variant="secondary"
          >
            Change Password
          </BaseButton>
        </View>
      </View>
    </ScrollView>
  );
};

// InfoItem component
<<<<<<< HEAD

const InfoItem = ({ icon, label, value, theme, isCountry = false }: InfoItemProps) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={Colors[theme as keyof typeof Colors].text} style={styles.infoIcon} />
    <View style={styles.infoContent}>
      <Text style={[styles.infoLabel, { color: Colors[theme as keyof typeof Colors].text }]}>{label}</Text>
      <View style={styles.valueContainer}>
        {isCountry && value !== "Not specified" && (
          <CountryFlag
            isoCode={countryToCode[value?.toUpperCase() as keyof typeof countryToCode] || value}
=======
const InfoItem = ({ icon, label, value, theme, isCountry = false }) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon} size={20} color={Colors[theme].text} style={styles.infoIcon} />
    <View style={styles.infoContent}>
      <Text style={[styles.infoLabel, { color: Colors[theme].text }]}>{label}</Text>
      <View style={styles.valueContainer}>
        {isCountry && value !== "Not specified" && (
          <CountryFlag
            isoCode={countryToCode[value?.toUpperCase()] || value}
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
            size={20}
            style={styles.flag}
          />
        )}
<<<<<<< HEAD
        <Text style={[styles.infoValue, { color: Colors[theme as keyof typeof Colors].text }]}>{value}</Text>
=======
        <Text style={[styles.infoValue, { color: Colors[theme].text }]}>{value}</Text>
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  onlineStatus: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginVertical: 20,
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
  },
  buttonsContainer: {
    gap: 12,
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
});

export default ProfilePage;
<<<<<<< HEAD
=======

export default ProfilePage;
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
