import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const IdCard = () => {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);

  const handleDocumentReadable = () => {
    // Logic for when the document is readable
    console.log("Document is readable");
    // Navigate to the next step or page
    ; // Adjust the route as needed
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
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <ThemedText style={styles.instruction}>No image selected</ThemedText>
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
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.primary,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: Colors.secondary,
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
