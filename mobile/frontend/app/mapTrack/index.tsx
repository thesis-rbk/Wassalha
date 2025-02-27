import React, { useState, useEffect, useRef } from "react";
import { FlightData } from "../../types/FlightData"; 

import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import io from "socket.io-client";

const BACKEND_URL = "http://192.168.11.186:4000";
console.log("🚀 Connecting to backend at:", BACKEND_URL);

const socket = io(BACKEND_URL, { transports: ["websocket"] });

socket.on("connect", () => console.log("✅ Connected to backend via Socket.IO"));
socket.on("disconnect", () => console.log("❌ Disconnected from backend"));



export default function TrackingApp() {
  const [identifier, setIdentifier] = useState("");
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    console.log("🎯 Setting up socket listeners...");

    socket.on("flightUpdate", (data: FlightData) => {
      console.log("🛬 Received flight update:", data);
      setFlightData(data);

      if (mapRef.current && data.lat && data.lon) {
        mapRef.current.animateToRegion({
          latitude: data.lat,
          longitude: data.lon,
          latitudeDelta: 5,
          longitudeDelta: 5,
        });
      }
    });

    return () => {
      console.log("🔄 Cleaning up socket listeners...");
      socket.off("flightUpdate");
    };
  }, []);

  const trackItem = () => {
    console.log("🛠️ Button Clicked! Tracking:", identifier);
    socket.emit("trackFlight", identifier);
  };

  // ❌ Function to remove flight info
  const clearFlightData = () => {
    setFlightData(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.inputContainer}>
        <Text style={styles.title}>✈️ Flight Tracker</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Flight Number (e.g., KQA113)"
          value={identifier}
          onChangeText={setIdentifier}
        />
        <Button title="Track Flight" onPress={trackItem} />
      </View>

      {/* Flight Information Display */}
      {flightData && (
        <View style={styles.flightInfo}>
          <View style={styles.flightInfoHeader}>
            <Text style={styles.flightTitle}>Flight Details</Text>
            {/* ❌ Close Button to Remove Flight Info */}
            <TouchableOpacity onPress={clearFlightData}>
              <Text style={styles.closeButton}>❌</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.flightText}>🛫 Airline: {flightData.airline}</Text>
          <Text style={styles.flightText}>📍 Departure: {flightData.departure}</Text>
          <Text style={styles.flightText}>📍 Arrival: {flightData.arrival}</Text>
          <Text style={styles.flightText}>
            ⏳ Estimated Arrival: {flightData.estimatedArrival}
          </Text>
          <Text style={styles.flightText}>🚀 Altitude: {flightData.altitude}m</Text>
          <Text style={styles.flightText}>💨 Speed: {flightData.speed} km/h</Text>
        </View>
      )}

      {/* Map Display */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
      >
        {flightData && (
          <Marker coordinate={{ latitude: flightData.lat, longitude: flightData.lon }}>
            <Callout>
              <Text style={styles.markerText}>{flightData.airline}</Text>
              <Text style={styles.markerText}>{flightData.departure} ➝ {flightData.arrival}</Text>
            </Callout>
          </Marker>
        )}
      </MapView>
    </ScrollView>
  );
}

// ✅ Styling for better UI & layout fix
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: 20,
  },
  inputContainer: {
    width: "90%",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#007bff",
  },
  input: {
    height: 40,
    borderColor: "#ced4da",
    borderWidth: 1,
    width: "100%",
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    borderRadius: 5,
  },
  flightInfo: {
    width: "90%",
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  flightInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  flightTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 20,
    color: "red",
    fontWeight: "bold",
  },
  flightText: {
    fontSize: 16,
    marginBottom: 5,
  },
  map: {
    width: "100%",
    height: 400, // Ensures map is properly displayed
    borderRadius: 10,
    marginTop: 10,
  },
  markerText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
