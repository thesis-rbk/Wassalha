import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import axiosInstance from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

const FRAME_SIZE = 250;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;



const TakeSelfie = () => {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceInFrame, setFaceInFrame] = useState(false);
  const cameraRef = useRef<any>(null);
  const frameRef = useRef({
    x: (SCREEN_WIDTH - FRAME_SIZE) / 2,
    y: (SCREEN_HEIGHT - FRAME_SIZE) / 2,
    width: FRAME_SIZE,
    height: FRAME_SIZE,
  });
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleFaceDetected = ({ faces }: { faces: any[] }) => {
    if (faces && faces.length > 0) {
      setFaceDetected(true);
      const face = faces[0];
      const frame = frameRef.current;
      
      const isInFrame = 
        face.bounds.x > frame.x &&
        face.bounds.y > frame.y &&
        (face.bounds.x + face.bounds.width) < (frame.x + frame.width) &&
        (face.bounds.y + face.bounds.height) < (frame.y + frame.height);

      setFaceInFrame(isInFrame);

      if (isInFrame && !image && !manualMode) {
        setTimeout(() => takePicture(), 1500);
      }
    } else {
      setFaceDetected(false);
      setFaceInFrame(false);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
      });
      setImage(photo.uri);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Error', 'Please take a selfie first');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('No token found');

      const decoded: any = jwtDecode(token);
      const formData = new FormData();

      const imageFile = {
        uri: image,
        type: 'image/jpeg',
        name: 'selfie.jpg',
      } as any;

      formData.append('selfie', imageFile);

      Alert.alert('Uploading', 'Please wait while we upload your selfie...');

      const response = await axiosInstance.post(
        `/api/users/verify-selfie/${decoded.id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Selfie verified successfully', [
          { text: 'OK', onPress: () => router.push('/verification/CreditCardVerification') }
        ]);
      }
    } catch (error: any) {
      console.error('Error submitting selfie:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to verify selfie. Please try again.'
      );
    }
  };

  if (hasPermission === null) {
    return <ThemedView><ThemedText>Requesting camera permission...</ThemedText></ThemedView>;
  }
  if (hasPermission === false) {
    return <ThemedView><ThemedText>No access to camera</ThemedText></ThemedView>;
  }

  return (
    <ThemedView style={styles.container}>
      {!image ? (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
            onFacesDetected={handleFaceDetected}
            faceDetectorSettings={{
              minDetectionInterval: 300,
              detectLandmarks: "none",
              mode: "fast",
              tracking: true,
            }}
          >
            <View style={styles.overlay}>
              <View style={[styles.faceFrame, faceInFrame ? styles.frameMatch : styles.frameNoMatch]}>
                <View style={styles.cardShape}>
                  {faceDetected && (
                    <MaterialIcons 
                      name="face" 
                      size={40} 
                      color={faceInFrame ? "green" : "yellow"} 
                    />
                  )}
                  <ThemedText style={styles.guideText}>
                    {faceInFrame 
                      ? (manualMode ? "Ready to capture!" : "Perfect! Taking photo...") 
                      : "Position your face in the circle"}
                  </ThemedText>
                </View>
              </View>
              
              {manualMode && (
                <TouchableOpacity 
                  style={styles.manualCaptureButton} 
                  onPress={takePicture}
                >
                  <Ionicons name="camera" size={40} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </CameraView>
        </View>
      ) : (
        <Image source={{ uri: image }} style={styles.camera} />
      )}

      <View style={styles.buttonContainer}>
        {!image ? (
          <TouchableOpacity 
            style={styles.switchModeButton} 
            onPress={() => setManualMode(!manualMode)}
          >
            <ThemedText style={styles.buttonText}>
              {manualMode ? "Auto Mode" : "Manual Mode"}
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={() => setImage(null)}>
              <ThemedText style={styles.buttonText}>Retake</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonActive]} onPress={handleSubmit}>
              <ThemedText style={styles.buttonText}>Submit</ThemedText>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
  },
  camera: {
    flex: 1,
    width: '100%',
    backgroundColor: '#333',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 125,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonContainer: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: Colors.light.primary,
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '45%',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: Colors.light.primary,
  },
  buttonInactive: {
    backgroundColor: Colors.light.secondary,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  frameMatch: {
    borderColor: 'green',
  },
  frameNoMatch: {
    borderColor: 'white',
  },
  guideText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  manualCaptureButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchModeButton: {
    backgroundColor: Colors.light.primary,
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '90%',
    alignItems: 'center',
  },
  cardShape: {
    width: '90%',
    height: '90%',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});

export default TakeSelfie; 