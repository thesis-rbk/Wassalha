import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode'
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';
import { API_URL } from '@/config';
import { BaseButton } from '@/components/ui/buttons/BaseButton';
import { TitleLarge, BodyMedium } from '@/components/Typography'; // Import Typography components

// Define the navigation prop type
type ProfilePageNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfilePage = () => {
  const { theme } = useTheme();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    joinedDate: '',
    shopperRating: 0,
    travelerRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<ProfilePageNavigationProp>();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (token) {
          const decoded: any = jwtDecode(token);
          const response = await axios.get(`${API_URL}/api/users/profile/${decoded.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setProfile(response.data.data);
          await AsyncStorage.setItem('firstName', response.data.data.firstName);
          await AsyncStorage.setItem('lastName', response.data.data.lastName);
          await AsyncStorage.setItem('bio', response.data.data.bio);
          
          // Log the stored values for debugging
          const storedFirstName = await AsyncStorage.getItem('firstName');
          console.log('Stored first name:', storedFirstName);
          console.log('Profile:', response.data.data);
        } else {
          console.error('No token found');
        }
      } catch (error) {
        console.error('Error retrieving profile:', error);
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
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <TopNavigation 
        title="Profile" 
        onNotificationPress={() => {}} 
        onProfilePress={() => navigation.navigate('profile/edit')} 
      />
      <View style={styles.header}>
        <View style={styles.avatar}>
          {/* <Text style={styles.avatarText}>{profile.firstName ? profile.firstName[0] : ''}</Text> */}
          <TitleLarge>{profile.firstName ? profile.firstName[0] : ''}</TitleLarge>
        </View>
        <TitleLarge>{`${profile.firstName} ${profile.lastName}`}</TitleLarge>
        <BodyMedium>Joined in {profile.joinedDate}</BodyMedium>
      </View>
      <BodyMedium>shopperRating: {profile.shopperRating},</BodyMedium>
      <BodyMedium>travelerRating: {profile.travelerRating},</BodyMedium>
      <BodyMedium>Bio: {profile.bio}</BodyMedium>
      <View style={styles.ratings}>
        <BodyMedium>Shopper: {profile.shopperRating} ★</BodyMedium>
        <BodyMedium>Traveler: {profile.travelerRating} ★</BodyMedium>
      </View>
      <View style={styles.verifiedInfo}>
       
        <BaseButton variant="primary" size="login" onPress={() => {}}>Verify Phone Number</BaseButton>
      </View>

      <BaseButton variant="primary" size="login" onPress={() => navigation.navigate('profile/edit')}>
        Edit Profile
      </BaseButton>
      
      <View style={styles.verifiedInfo}>
        <BaseButton variant="primary" size="login" onPress={() => navigation.navigate('profile/change')}>Change Password</BaseButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
   
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  ratings: {
    marginVertical: 20,
  },
  verifiedInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
  },
  verifiedText: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  verifiedDetail: {
    marginBottom: 8,
  },
});

export default ProfilePage; 