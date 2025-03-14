"use client"

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { useTheme } from "@/context/ThemeContext"
import { Colors } from "@/constants/Colors"
import { BaseButton } from "@/components/ui/buttons/BaseButton"
import { TopNavigation } from "@/components/navigation/TopNavigation"
import { jwtDecode } from "jwt-decode"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axiosInstance from "@/config"
import { TitleLarge, BodyMedium } from "@/components/Typography"
import * as ImagePicker from "expo-image-picker"
import { MaterialIcons, Feather, FontAwesome } from "@expo/vector-icons"
import { Profile } from "@/types" 

 


export default function EditProfile() {
    const { theme } = useTheme();
    const [showPicker, setShowPicker] = useState(false);
    const [profile, setProfile] = useState<Profile>({
        firstName: '',
        lastName: '',
        bio: '',
        country: '',
        phoneNumber: '',
        image: null,
        imageId: null,
    });
    const [loading, setLoading] = useState(true);

    const getInitials = () => {
        return `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`.toUpperCase();
    };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (token) {
          const decoded: any = jwtDecode(token);
          console.log("Decoded token:", decoded);
          const response = await axiosInstance.get(
            `/api/users/profile/${decoded.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setProfile(response.data.data);
        } else {
          console.error("No token found");
        }
      } catch (error) {
        console.error("Error retrieving token:", error);
      } finally {
        setLoading(false);
      }
    };

        fetchProfile();
    }, []);

    const handleImageUpload = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result.assets[0]) {
                const selectedImage = result.assets[0];
                const imageUri = selectedImage.uri;

                const imageFile = {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: 'profile-image.jpg',
                } as const;

                console.log('Selected image file:', imageFile);

                setProfile(prev => ({
                    ...prev,
                    image: imageFile,
                    imageId: imageUri,
                }));
            }
        } catch (error) {
            console.error('Error selecting image:', error);
            Alert.alert('Error', 'Failed to select image');
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('jwtToken');
            if (!token) throw new Error('No token found');

            const decoded: any = jwtDecode(token);
            const formData = new FormData();

            formData.append('firstName', profile.firstName || '');
            formData.append('lastName', profile.lastName || '');
            formData.append('bio', profile.bio || '');
            formData.append('country', profile.country || '');
            formData.append('phoneNumber', profile.phoneNumber || '');

            if (profile.image && profile.image.uri) {
                const imageFile = {
                    uri: profile.image.uri,
                    type: 'image/jpeg',
                    name: 'profile-image.jpg',
                };
                
                formData.append('image', imageFile as any);
                console.log('Appending image:', imageFile);
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                },
            };

            console.log('Sending request with formData:', 
                Object.fromEntries(formData as any));

            const response = await axiosInstance.put(
                `/api/users/profile/${decoded.id}`,
                formData,
                config
            );

            if (response.data.success) {
                await AsyncStorage.setItem('firstName', profile.firstName || '');
                await AsyncStorage.setItem('lastName', profile.lastName || '');
                await AsyncStorage.setItem('bio', profile.bio || '');
                await AsyncStorage.setItem('phoneNumber', profile.phoneNumber || '');
                
                if (response.data.data.imageId) {
                    await AsyncStorage.setItem('imageId', 
                        String(response.data.data.imageId));
                }

                Alert.alert('Success', 'Profile updated successfully');
                router.back();
            }
        } catch (error: any) {
            console.error('Network Error Details:', {
                message: error.message,
                code: error.code,
                response: error.response?.data,
                config: error.config,
            });
            Alert.alert(
                'Error',
                'Failed to update profile. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

  if (loading) {
    return <ActivityIndicator size="large" color={Colors[theme].primary} />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors[theme].background }} showsVerticalScrollIndicator={false}>
      <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <TopNavigation
          title="Edit Profile"
          onNotificationPress={() => {}}
          profileName={profile.firstName}
          onProfilePress={() => {
            console.log("Navigating to profile")
            router.push("/profile/edit")
          }}
        />

        <View style={styles.header}>
          <TitleLarge style={[styles.headerTitle, { color: Colors[theme].primary }]}>Edit Profile</TitleLarge>
          <Text style={[styles.headerSubtitle, { color: Colors[theme].primary }]}>
            Update your personal information
          </Text>
        </View>

        <View style={styles.photoSection}>
          <View style={styles.avatarContainer}>
            {profile.imageId ? (
              <Image
                source={{
                  uri:
                    profile.image?.uri || `${process.env.EXPO_PUBLIC_API_URL}/api/uploads/${profile.image?.filename}`,
                }}
                style={styles.avatar}
                onError={(error) => {
                  console.error("Image preview error:", error.nativeEvent.error)
                }}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: Colors[theme].primary }]}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: Colors[theme].primary }]}
              onPress={handleImageUpload}
            >
              <Feather name="edit-2" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.photoLimit, { color: Colors[theme].primary }]}>Tap to upload a profile picture</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <FontAwesome name="user" size={16} color={Colors[theme].primary} />
              <BodyMedium style={styles.labelText}>First name</BodyMedium>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: Colors[theme].border,
                  backgroundColor: Colors[theme].card,
                  color: Colors[theme].text,
                },
              ]}
              value={profile.firstName}
              onChangeText={(text) => setProfile((prev) => ({ ...prev, firstName: text }))}
              placeholder="Enter your first name"
              placeholderTextColor={Colors[theme].secondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <FontAwesome name="user" size={16} color={Colors[theme].primary} />
              <BodyMedium style={styles.labelText}>Last name</BodyMedium>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: Colors[theme].border,
                  backgroundColor: Colors[theme].card,
                  color: Colors[theme].text,
                },
              ]}
              value={profile.lastName}
              onChangeText={(text) => setProfile((prev) => ({ ...prev, lastName: text }))}
              placeholder="Enter your last name"
              placeholderTextColor={Colors[theme].secondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <MaterialIcons name="description" size={16} color={Colors[theme].primary} />
              <BodyMedium style={styles.labelText}>Bio</BodyMedium>
            </View>
            <TextInput
              style={[
                styles.input,
                styles.bioInput,
                {
                  borderColor: Colors[theme].border,
                  backgroundColor: Colors[theme].card,
                  color: Colors[theme].text,
                },
              ]}
              value={profile.bio}
              onChangeText={(text) => setProfile((prev) => ({ ...prev, bio: text }))}
              multiline
              placeholder="Describe yourself in 140 characters or less"
              placeholderTextColor={Colors[theme].secondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <MaterialIcons name="location-on" size={16} color={Colors[theme].primary} />
              <BodyMedium style={styles.labelText}>Country</BodyMedium>
            </View>

            {Platform.OS === "ios" ? (
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.pickerButton,
                  {
                    borderColor: Colors[theme].border,
                    backgroundColor: Colors[theme].card,
                  },
                ]}
                onPress={() => setShowPicker(true)}
              >
                <Text style={{ color: profile.country ? Colors[theme].text : Colors[theme].secondary }}>
                  {profile.country || "Select your country"}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={Colors[theme].secondary} />
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.pickerContainer,
                  {
                    borderColor: Colors[theme].border,
                    backgroundColor: Colors[theme].card,
                  },
                ]}
              >
                <Picker
                  selectedValue={profile.country}
                  style={{ color: Colors[theme].text }}
                  dropdownIconColor={Colors[theme].primary}
                  onValueChange={(itemValue) => setProfile((prev) => ({ ...prev, country: itemValue }))}
                >
                  <Picker.Item label="Select your country" value="" />
                  <Picker.Item label="USA" value="USA" />
                  <Picker.Item label="Canada" value="CANADA" />
                  <Picker.Item label="UK" value="UK" />
                  <Picker.Item label="Australia" value="AUSTRALIA" />
                  <Picker.Item label="Germany" value="GERMANY" />
                  <Picker.Item label="France" value="FRANCE" />
                  <Picker.Item label="India" value="INDIA" />
                  <Picker.Item label="Japan" value="JAPAN" />
                  <Picker.Item label="Tunisia" value="TUNISIA" />
                  <Picker.Item label="Morocco" value="MOROCCO" />
                  <Picker.Item label="Algeria" value="ALGERIA" />
                  <Picker.Item label="Turkey" value="TURKEY" />
                  <Picker.Item label="Spain" value="SPAIN" />
                  <Picker.Item label="Italy" value="ITALY" />
                  <Picker.Item label="Portugal" value="PORTUGAL" />
                  <Picker.Item label="Netherlands" value="NETHERLANDS" />
                  <Picker.Item label="Belgium" value="BELGIUM" />
                  <Picker.Item label="Sweden" value="SWEDEN" />
                  <Picker.Item label="Norway" value="NORWAY" />
                  <Picker.Item label="Denmark" value="DENMARK" />
                  <Picker.Item label="Finland" value="FINLAND" />
                  <Picker.Item label="Iceland" value="ICELAND" />
                  <Picker.Item label="Austria" value="AUSTRIA" />
                  <Picker.Item label="Switzerland" value="SWITZERLAND" />
                  <Picker.Item label="Belarus" value="BELARUS" />
                  <Picker.Item label="Russia" value="RUSSIA" />
                  <Picker.Item label="China" value="CHINA" />
                  <Picker.Item label="Brazil" value="BRAZIL" />
                  <Picker.Item label="Argentina" value="ARGENTINA" />
                  <Picker.Item label="Chile" value="CHILE" />
                  <Picker.Item label="Mexico" value="MEXICO" />
                  <Picker.Item label="Colombia" value="COLOMBIA" />
                  <Picker.Item label="Peru" value="PERU" />
                  <Picker.Item label="Venezuela" value="VENEZUELA" />
                  <Picker.Item label="Ecuador" value="ECUADOR" />
                  <Picker.Item label="Paraguay" value="PARAGUAY" />
                  <Picker.Item label="Uruguay" value="URUGUAY" />
                  <Picker.Item label="Bolivia" value="BOLIVIA" />
                  <Picker.Item label="Other" value="OTHER" />
                </Picker>
              </View>
            )}

            {showPicker && Platform.OS === "ios" && (
              <View style={styles.iosPicker}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={{ color: Colors[theme].primary, fontWeight: "bold" }}>Done</Text>
                  </TouchableOpacity>
                </View>
                <Picker
                  selectedValue={profile.country}
                  onValueChange={(itemValue) => {
                    setProfile((prev) => ({ ...prev, country: itemValue }))
                  }}
                >
                  <Picker.Item label="Select your country" value="" />
                  <Picker.Item label="USA" value="USA" />
                  <Picker.Item label="Canada" value="CANADA" />
                  <Picker.Item label="UK" value="UK" />
                  <Picker.Item label="Australia" value="AUSTRALIA" />
                  <Picker.Item label="Germany" value="GERMANY" />
                  <Picker.Item label="France" value="FRANCE" />
                  <Picker.Item label="India" value="INDIA" />
                  <Picker.Item label="Japan" value="JAPAN" />
                  <Picker.Item label="Tunisia" value="TUNISIA" />
                  <Picker.Item label="Morocco" value="MOROCCO" />
                  <Picker.Item label="Algeria" value="ALGERIA" />
                  <Picker.Item label="Turkey" value="TURKEY" />
                  <Picker.Item label="Spain" value="SPAIN" />
                  <Picker.Item label="Italy" value="ITALY" />
                  <Picker.Item label="Portugal" value="PORTUGAL" />
                  <Picker.Item label="Netherlands" value="NETHERLANDS" />
                  <Picker.Item label="Belgium" value="BELGIUM" />
                  <Picker.Item label="Sweden" value="SWEDEN" />
                  <Picker.Item label="Norway" value="NORWAY" />
                  <Picker.Item label="Denmark" value="DENMARK" />
                  <Picker.Item label="Finland" value="FINLAND" />
                  <Picker.Item label="Iceland" value="ICELAND" />
                  <Picker.Item label="Austria" value="AUSTRIA" />
                  <Picker.Item label="Switzerland" value="SWITZERLAND" />
                  <Picker.Item label="Belarus" value="BELARUS" />
                  <Picker.Item label="Russia" value="RUSSIA" />
                  <Picker.Item label="China" value="CHINA" />
                  <Picker.Item label="Brazil" value="BRAZIL" />
                  <Picker.Item label="Argentina" value="ARGENTINA" />
                  <Picker.Item label="Chile" value="CHILE" />
                  <Picker.Item label="Mexico" value="MEXICO" />
                  <Picker.Item label="Colombia" value="COLOMBIA" />
                  <Picker.Item label="Peru" value="PERU" />
                  <Picker.Item label="Venezuela" value="VENEZUELA" />
                  <Picker.Item label="Ecuador" value="ECUADOR" />
                  <Picker.Item label="Paraguay" value="PARAGUAY" />
                  <Picker.Item label="Uruguay" value="URUGUAY" />
                  <Picker.Item label="Bolivia" value="BOLIVIA" />
                  <Picker.Item label="Other" value="OTHER" />
                </Picker>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Feather name="phone" size={16} color={Colors[theme].primary} />
              <BodyMedium style={styles.labelText}>Phone Number</BodyMedium>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: Colors[theme].border,
                  backgroundColor: Colors[theme].card,
                  color: Colors[theme].text,
                },
              ]}
              value={profile.phoneNumber}
              onChangeText={(text) => setProfile((prev) => ({ ...prev, phoneNumber: text }))}
              placeholder="Enter your phone number"
              placeholderTextColor={Colors[theme].secondary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <BaseButton onPress={handleUpdateProfile} variant="primary" size="login" style={styles.saveButton}>
          Save Changes
        </BaseButton>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  photoLimit: {
    fontSize: 12,
    marginTop: 8,
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labelText: {
    marginLeft: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  bioInput: {
    height: 120,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iosPicker: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 1000,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  saveButton: {
    marginBottom: 40,
  },
})

