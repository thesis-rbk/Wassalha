import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import axios from 'axios';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { BaseButton } from '@/components/ui/buttons/BaseButton';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '@/config';
import { TitleLarge, BodyMedium } from '@/components/Typography';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type EditProfileNavigationProp = StackNavigationProp<RootStackParamList, 'profile/edit'>;

export default function EditProfile() {
    const { theme } = useTheme();
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        bio: '',
    });
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<EditProfileNavigationProp>();

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
                } else {
                    console.error('No token found');
                }
            } catch (error) {
                console.error('Error retrieving token:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleUpdateProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('jwtToken');       
            if (token) {
                const decoded: any = jwtDecode(token);
                console.log('Making PUT request to:', `hi/api/users/profile/${decoded.id}`);
                console.log('Profile data:', profile);
                const response = await axiosInstance.put(`/api/users/profile/${decoded.id}`, profile, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 200) {
                    console.log('Profile updated successfully:', response.data);
                    await AsyncStorage.setItem('firstName', profile.firstName);
                    await AsyncStorage.setItem('lastName', profile.lastName);
                    await AsyncStorage.setItem('bio', profile.bio);
                    router.back();
                } else {
                    console.error('Failed to update profile:', response.data);
                }
            } else {
                console.error('No token found');
            }
        } catch (error: any) {
            console.error('Error updating profile:', error.message);
            console.error('Error details:', error.response ? error.response.data : error.message);
        }
    };

    const handleUpdatePhoto = async () => {
        // Implement image upload logic here
    };

    if (loading) {
        return <ActivityIndicator size="large" color={Colors[theme].primary} />;
    }

    return (
        <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <TopNavigation 
                title="Edit Profile"
                onNotificationPress={() => {}} 
                profileName={profile.firstName}
                onProfilePress={() => {
                    console.log('Navigating to profile');
                    navigation.navigate('profile/edit');
                }}
            />
            <TitleLarge>Edit Profile</TitleLarge>
            <View style={styles.photoSection}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {profile.firstName ? profile.firstName[0] : ''}
                    </Text>
                </View>
                <BaseButton onPress={handleUpdatePhoto} variant="primary" size="large">
                    Update Photo
                </BaseButton>
                <Text style={styles.photoLimit}>Maximum size of 5 MB (JPG, GIF, or PNG)</Text>
            </View>

            <View style={styles.formSection}>
                <BodyMedium>First name</BodyMedium>
                <TextInput
                    style={[styles.input, { borderColor: Colors[theme].primary }]}
                    value={profile.firstName}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, firstName: text }))}
                    placeholder="Enter your first name"
                    placeholderTextColor={Colors[theme].secondary}
                />

                <BodyMedium>Last name</BodyMedium>
                <TextInput
                    style={[styles.input, { borderColor: Colors[theme].primary }]}
                    value={profile.lastName}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, lastName: text }))}
                    placeholder="Enter your last name"
                    placeholderTextColor={Colors[theme].secondary}
                />

                <BodyMedium>Bio</BodyMedium>
                <TextInput
                    style={[styles.input, styles.bioInput, { borderColor: Colors[theme].primary }]}
                    value={profile.bio}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
                    multiline
                    placeholder="Describe yourself in 140 characters or less"
                    placeholderTextColor={Colors[theme].secondary}
                />
            </View>

            <BaseButton onPress={handleUpdateProfile} variant="primary" size="login">
                Save Changes
            </BaseButton>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        color: 'white',
        fontSize: 40,
        fontWeight: 'bold',
    },
    photoLimit: {
        color: '#666',
        fontSize: 12,
    },
    formSection: {
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    bioInput: {
        height: 100,
        textAlignVertical: 'top',
    },
}); 