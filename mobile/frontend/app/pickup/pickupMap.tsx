import React, { useState, useEffect } from "react";
import { StyleSheet, Alert, Modal, View } from "react-native";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { ThemedText } from "@/components/ThemedText";
import { FontAwesome5 } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import {SafeLocation} from "@/types/Pickup";
import {PickupMapProps} from "@/types/Pickup";



export default function PickupMap({ setCoordinates, setManualAddress }: PickupMapProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SafeLocation | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ latitude: number; longitude: number } | null>(null);

  // Predefined safe locations in Tunisia
  const safeLocations: SafeLocation[] = [
    { name: "Tunis-Carthage International Airport", latitude: 36.8510, longitude: 10.2272 },
    { name: "Sousse Central Post Office", latitude: 35.8256, longitude: 10.6412 },
    { name: "Djerba Midoun Police Station", latitude: 33.8076, longitude: 10.9975 },
    { name: "Hammamet Bus Station", latitude: 36.4000, longitude: 10.6167 },
    { name: "Sfax City Center Mall", latitude: 34.7406, longitude: 10.7603 },
  ];

  const styles = StyleSheet.create({
    mapButton: {
      marginTop: 20,
      flexDirection: "row",
      gap: 10,
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].googleButton,
    },
    buttonText: {
      color: Colors[colorScheme].text,
    },
    mapContainer: {
      flex: 1,
    },
    map: {
      width: '100%',
      height: '100%',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '90%',
      height: '80%',
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 10,
      padding: 10,
    },
    confirmButton: {
      marginTop: 10,
      backgroundColor: Colors[colorScheme].primary,
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
    },
    confirmButtonText: {
      color: Colors[colorScheme].text,
      fontSize: 16,
    },
  });

  // Fetch current location when the map opens
  const fetchCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setCurrentPosition({ latitude, longitude });
    } catch (error) {
      console.error('Error fetching current location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const handlePickOnMap = async () => {
    await fetchCurrentLocation();
    setMapModalVisible(true);
  };

  const handleMarkerPress = (location: SafeLocation) => {
    setSelectedLocation(location);
  };

  const handleConfirm = async () => {
    if (selectedLocation) {
      const { latitude, longitude, name } = selectedLocation;
      setCoordinates({ latitude, longitude });
      setManualAddress(name);
      setMapModalVisible(false);
    } else {
      Alert.alert('Error', 'Please select a location before confirming');
    }
  };

  return (
    <>
      <BaseButton
        variant="secondary"
        onPress={handlePickOnMap}
        style={styles.mapButton}
      >
        <FontAwesome5 name="map-marked-alt" size={16} />
        <ThemedText style={styles.buttonText}>Pick on Map</ThemedText>
      </BaseButton>

      <Modal
        animationType="slide"
        transparent={true}
        visible={mapModalVisible}
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: currentPosition?.latitude || 36.81897, // Center on current position or Tunisia if unavailable
                longitude: currentPosition?.longitude || 10.16579,
                latitudeDelta: 5.0,
                longitudeDelta: 5.0,
              }}
            >
              {/* Current Position Marker */}
              {currentPosition && (
                <Marker
                  coordinate={currentPosition}
                  title="Your Location"
                  pinColor="blue"
                />
              )}

              {/* Safe Locations Markers */}
              {safeLocations.map((location) => (
                <Marker
                  key={location.name}
                  coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                  title={location.name}
                  onPress={() => handleMarkerPress(location)}
                  pinColor={selectedLocation?.name === location.name ? 'green' : 'red'}
                />
              ))}

              {/* Route from Current Position to Selected Location */}
              {currentPosition && selectedLocation && (
                <MapViewDirections
                  origin={currentPosition}
                  destination={{ latitude: selectedLocation.latitude, longitude: selectedLocation.longitude }}
                  apikey="YOUR_GOOGLE_MAPS_API_KEY" // Replace with your Google Maps API key
                  strokeWidth={3}
                  strokeColor="blue"
                  mode="DRIVING" // Can be WALKING, BICYCLING, TRANSIT, etc.
                  onError={(error) => console.error('Directions error:', error)}
                />
              )}
            </MapView>
            <BaseButton
              variant="primary"
              onPress={handleConfirm}
              style={styles.confirmButton}
            >
              <ThemedText style={styles.confirmButtonText}>Confirm Selection</ThemedText>
            </BaseButton>
            <BaseButton
              variant="secondary"
              onPress={() => setMapModalVisible(false)}
              style={{ marginTop: 10 }}
            >
              <ThemedText>Cancel</ThemedText>
            </BaseButton>
          </View>
        </View>
      </Modal>
    </>
  );
}