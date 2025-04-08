import React, { useState, useEffect } from "react";
import { StyleSheet, Modal, View } from "react-native";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { ThemedText } from "@/components/ThemedText";
import { FontAwesome5 } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { SafeLocation } from "@/types/Pickup";
import { PickupMapProps } from "@/types/Pickup";
import { useStatus } from '@/context/StatusContext';

// Custom Map Style mimicking Facebook's color scheme
const facebookMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#F0F2F5" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#1C2526" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#E4E6EB" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#E4E6EB" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1877F2" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#A3BFFA" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#D9DCE1" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#F0F2F5" }] },
];

export default function PickupMap({ setCoordinates, setManualAddress }: PickupMapProps) {
  const colorScheme = useColorScheme() ?? "light";
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SafeLocation | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { show, hide } = useStatus();

  const safeLocations: SafeLocation[] = [
    { name: "Tunis-Carthage International Airport", latitude: 36.851, longitude: 10.2272 },
    { name: "Sousse Central Post Office", latitude: 35.8256, longitude: 10.6412 },
    { name: "Djerba Midoun Police Station", latitude: 33.8076, longitude: 10.9975 },
    { name: "Hammamet Bus Station", latitude: 36.4, longitude: 10.6167 },
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
      width: "100%",
      height: "100%",
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      width: "90%",
      height: "80%",
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 10,
      padding: 10,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 10,
    },
    confirmButton: {
      backgroundColor: Colors[colorScheme].primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 5,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    cancelButton: {
      backgroundColor: Colors[colorScheme].secondary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 5,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    buttonTextSmall: {
      color: Colors[colorScheme].text,
      fontSize: 14,
    },
  });

  const fetchCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        show({
          type: "error",
          title: "Permission Denied",
          message: "Permission to access location was denied",
          primaryAction: {
            label: "OK",
            onPress: hide
          }
        });
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setCurrentPosition({ latitude, longitude });
    } catch (error) {
      console.error("Error fetching current location:", error);
      show({
        type: "error",
        title: "Error",
        message: "Failed to get current location",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
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
      show({
        type: "error",
        title: "Error",
        message: "Please select a location before confirming",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
    }
  };

  return (
    <>
      <BaseButton variant="secondary" onPress={handlePickOnMap} style={styles.mapButton}>
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
                latitude: currentPosition?.latitude || 36.81897,
                longitude: currentPosition?.longitude || 10.16579,
                latitudeDelta: 5.0,
                longitudeDelta: 5.0,
              }}
              customMapStyle={facebookMapStyle}
            >
              {currentPosition && (
                <Marker coordinate={currentPosition} title="Your Location" pinColor="#1877F2" />
              )}
              {safeLocations.map((location) => (
                <Marker
                  key={location.name}
                  coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                  title={location.name}
                  onPress={() => handleMarkerPress(location)}
                  pinColor={selectedLocation?.name === location.name ? "#1877F2" : "#E4E6EB"}
                />
              ))}
              {currentPosition && selectedLocation && (
                <MapViewDirections
                  origin={currentPosition}
                  destination={{ latitude: selectedLocation.latitude, longitude: selectedLocation.longitude }}
                  apikey={GOOGLE_KEY || ""}
                  strokeWidth={3}
                  strokeColor="#1877F2"
                  mode="DRIVING"
                  onError={(error: Error) => console.error("Directions error:", error)}
                />
              )}
            </MapView>
            <View style={styles.buttonRow}>
              <BaseButton variant="primary" onPress={handleConfirm} style={styles.confirmButton}>
                <FontAwesome5 name="check" size={14} color={Colors[colorScheme].text} />
                <ThemedText style={styles.buttonTextSmall}>Confirm</ThemedText>
              </BaseButton>
              <BaseButton
                variant="secondary"
                onPress={() => setMapModalVisible(false)}
                style={styles.cancelButton}
              >
                <FontAwesome5 name="times" size={14} color={Colors[colorScheme].text} />
                <ThemedText style={styles.buttonTextSmall}>Cancel</ThemedText>
              </BaseButton>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}