import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, Dimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Shield, Upload, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axiosInstance from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { verificationStyles as globalStyles } from '@/styles/verification';
import { VerificationCard } from '@/components/verification/VerificationCard';
import { FileText } from 'lucide-react-native';
import { TabBar } from "@/components/navigation/TabBar";

const { width } = Dimensions.get('window');
const CARD_ASPECT_RATIO = 1.586; // Standard ID card aspect ratio

const IdCard = () => {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("verification");

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    if (tabName !== "verification") {
      router.push(`/${tabName}`);
    }
  };

  const handleDocumentReadable = async () => {
    if (!image) {
      Alert.alert('Error', 'Please take a photo first');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('No token found');

      const decoded: any = jwtDecode(token);
      const formData = new FormData();

      // Create file object from image URI
      const imageFile = {
        uri: image,
        type: 'image/jpeg',
        name: 'id-card.jpg',
      };

      formData.append('idCard', imageFile as any);

      const response = await axiosInstance.post(
        `/api/users/verify-id/${decoded.id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'ID Card verified successfully');
        router.push('/verification/TakeSelfie');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to verify ID Card');
    }
  };

  const handleRetakePhoto = () => {
    // Logic for retaking the photo
    console.log("Retake photo");
    pickImage();
  };

  const pickImage = async () => {
    // Request permission to access the camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera is required!");
      return;
    }

    // Launch the camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Set the image URI
    }
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.header}
      >
        <Shield size={32} color="#FFF" />
        <ThemedText style={styles.headerTitle}>ID Verification</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Take a clear photo of your government-issued ID
        </ThemedText>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.guideCard}>
          <Camera size={24} color={Colors.light.primary} />
          <ThemedText style={styles.guideTitle}>Document Guidelines</ThemedText>
          <View style={styles.bulletPoints}>
            <BulletPoint text="Place your ID within the frame" />
            <BulletPoint text="Ensure good lighting" />
            <BulletPoint text="Avoid glare and shadows" />
            <BulletPoint text="Show all corners clearly" />
          </View>
        </View>

        <View style={styles.cardContainer}>
          {image ? (
            <>
              <Image source={{ uri: image }} style={styles.cardImage} />
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']}
                style={styles.cardOverlay}
              >
                <TouchableOpacity 
                  style={styles.retakeButton} 
                  onPress={handleRetakePhoto}
                >
                  <RefreshCw size={20} color="#FFF" />
                  <ThemedText style={styles.retakeText}>Retake</ThemedText>
                </TouchableOpacity>
              </LinearGradient>
            </>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Upload size={32} color={Colors.light.primary} />
              <ThemedText style={styles.uploadText}>Take Photo</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, !image && styles.submitButtonDisabled]}
          onPress={handleDocumentReadable}
          disabled={!image}
        >
          <ThemedText style={styles.submitButtonText}>
            Continue
          </ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.securityNote}>
          🔒 Your data is encrypted and secure
        </ThemedText>
      </ScrollView>

      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </ThemedView>
  );
};

const BulletPoint = ({ text }: { text: string }) => (
  <View style={styles.bulletPoint}>
    <View style={styles.bullet} />
    <ThemedText style={styles.bulletText}>{text}</ThemedText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  guideCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 16,
    color: '#1E293B',
  },
  bulletPoints: {
    width: '100%',
    gap: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginRight: 12,
  },
  bulletText: {
    fontSize: 15,
    color: '#64748B',
  },
  cardContainer: {
    width: width - 40,
    height: (width - 40) / CARD_ASPECT_RATIO,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderStyle: 'dashed',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  uploadButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 16,
    color: Colors.light.primary,
    marginTop: 12,
    fontWeight: '600',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 8,
  },
  retakeText: {
    color: '#FFF',
    marginLeft: 8,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  securityNote: {
    textAlign: 'center',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
});

export default IdCard;
