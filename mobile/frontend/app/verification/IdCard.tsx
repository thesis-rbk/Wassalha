import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axiosInstance from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const IdCard = () => {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);

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
      <View style={styles.content}>
        {image ? (
          <View style={styles.cardFrame}>
            <Image source={{ uri: image }} style={styles.image} />
          </View>
        ) : (
          <View style={styles.cardFrame}>
            <ThemedText style={styles.instruction}>No image selected</ThemedText>
          </View>
        )}
        <ThemedText style={styles.title}>ID Card</ThemedText>
        <ThemedText style={styles.instruction}>
          Make sure that all the information on the document is visible and easy to read.
        </ThemedText>

        <TouchableOpacity style={styles.button} onPress={handleDocumentReadable}>
          <ThemedText style={styles.buttonText}>Document is readable</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.retakeButton} onPress={handleRetakePhoto}>
          <ThemedText style={styles.retakeButtonText}>Retake photo</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFrame: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.light.primary,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: Colors.light.secondary,
  },
  button: {
    backgroundColor: '#FFD700', // Gold color
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    color: 'black',
  },
  retakeButton: {
    backgroundColor: '#E8E8E8', // Light gray color
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  retakeButtonText: {
    fontSize: 18,
    color: 'black',
  },
});

export default IdCard;
