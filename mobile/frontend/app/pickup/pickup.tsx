import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Modal } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { InputField } from "@/components/InputField";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";
import axiosInstance from "../../config";
import * as Location from 'expo-location';
import { useRouter } from "expo-router";

export default function Pickup() {
    const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [pickupType, setPickupType] = useState<"AIRPORT" | "DELIVERY" | "IN_PERSON" | "PICKUPPOINT" | "">("");
  const [step, setStep] = useState<"select" | "form">("select");
  const [airportName, setAirportName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [pickupDescription, setPickupDescription] = useState("");
  const orderId = 1;
  const [scheduledTime, setScheduledTime] = useState("");
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOptionInfo, setSelectedOptionInfo] = useState("");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 20,
    },
    logo: {
      width: 150,
      height: 150,
      alignSelf: "center",
      marginBottom: 20,
    },
    headerText: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 8,
      color: Colors[colorScheme].text,
    },
    subText: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 32,
      color: Colors[colorScheme].text + "80",
    },
    actionButton: {
      marginTop: 20,
    },
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
    pickupOptionsContainer: {
      gap: 12,
      marginBottom: 20,
    },
    pickupOption: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme].text + '40',
    },
    optionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    selectedOption: {
      borderColor: Colors[colorScheme].primary,
      backgroundColor: Colors[colorScheme].primary + '20',
    },
    optionText: {
      flex: 1,
      marginLeft: 12,
      color: Colors[colorScheme].text,
      fontSize: 16,
    },
    descriptionText: {
      marginTop: 8,
      marginLeft: 32,
      fontSize: 14,
      color: Colors[colorScheme].text + '80',
    },
    formContainer: {
      marginBottom: 20,
    },
    locationButton: {
      marginTop: 10,
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    formActions: {
      marginTop: 20,
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'space-between',
    },
    backButton: {
      flex: 1,
    },
    confirmButton: {
      flex: 1,
    },
    contactInput: {
      marginTop: 15,
      marginBottom: 10,
    },
    modalView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      backgroundColor: Colors[colorScheme].background,
      padding: 20,
      borderRadius: 10,
      width: "80%",
      maxHeight: "80%",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 15,
      color: Colors[colorScheme].text,
    },
    modalText: {
      fontSize: 16,
      marginBottom: 15,
      color: Colors[colorScheme].text, // Black/default theme color
    },
    importantTextSafe: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 15,
      color: '#00CC00', // Green for safe processes
    },
    importantTextRisk: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 15,
      color: '#FF0000', // Red for risky processes
    },
    modalButtonContainer: {
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'space-between',
    },
  });

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const { latitude, longitude } = location.coords;
      setCoordinates({ latitude, longitude });
      
      let address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      const displayAddress = address[0]?.name || address[0]?.street || "Current Location";
      setManualAddress(displayAddress);
    } catch (error) {
      console.error('Error getting location:', error);
      alert("Error getting location");
    }
  };

  const handlePickupSelection = (type: "AIRPORT" | "DELIVERY" | "IN_PERSON" | "PICKUPPOINT") => {
    let info = "";
    const travelerConfirmationNote = "Note: Your selection requires confirmation from the traveler. After choosing this option, please wait for their acceptance. The traveler may also suggest an alternative pickup method if needed.";
    
    switch(type) {
      case 'AIRPORT':
        info = "Airport Pickup Process: Our staff has an employee stationed at the airport. The traveler delivers your package to our employee. Visit the designated pickup zone at the specified airport with your QR code to collect it. Check your package contents and confirm receipt with our staff. Requires traveler confirmation.\n\n" +
               "IMPORTANT: This process is managed by our team for your convenience and safety.";
        break;
      case 'DELIVERY':
        info = "Home Delivery Process: Provide your address or use current location. Our delivery team brings the package to you. Receive a QR code for verification, inspect your package upon arrival, and confirm delivery completion. Requires traveler confirmation.\n\n" +
               "IMPORTANT: This process is fully managed and guaranteed by us - no risk to you!";
        break;
      case 'IN_PERSON':
        info = "In-Person Pickup Terms: You arrange directly with the traveler for pickup. Agree on a meeting location and time with the traveler. Bring your QR code for identification, verify your package contents, and confirm receipt. Requires traveler confirmation.\n\n" +
               "IMPORTANT: This process excludes us from the delivery arrangement. You are fully responsible for what happens during the handover. Our app is not liable for any issues.\n\n" +
               "Advice: Choose a public place to meet the traveler to minimize any potential risks.";
        break;
      case 'PICKUPPOINT':
        info = "Designated Pickup Point Process: Choose a specific pickup location. The package is delivered to the point by the traveler. Visit within specified hours with your QR code, check your package, and confirm collection. Requires traveler confirmation. Provide clear instructions for smooth pickup.\n\n" +
               "IMPORTANT: This process is managed by us once the package reaches the point - safe process!";
        break;
    }
    setSelectedOptionInfo(info);
    setModalVisible(true);
    setPickupType(type);
  };

  const handleConfirmPickup = async () => {
    let payload;
    const basePayload = {
      orderId,
      pickupType: pickupType,
      contactPhoneNumber: contact,
      scheduledTime: new Date().toISOString().replace(/T/, ' ').replace(/Z/, ''),
      coordinates: coordinates ? `${coordinates.latitude},${coordinates.longitude}` : "",
      qrCode: ""
    };

    switch(pickupType) {
      case 'AIRPORT':
        payload = { ...basePayload, location: airportName, address: "Airport Pickup Zone" };
        break;
      case 'DELIVERY':
        payload = { ...basePayload, location: manualAddress ? 'manual' : 'current', address: manualAddress || "Current Location" };
        break;
      case 'IN_PERSON':
        payload = { ...basePayload, location: 'in_person', address: manualAddress || currentLocation };
        break;
      case 'PICKUPPOINT':
        payload = { ...basePayload, location: 'custom_point', address: manualAddress, description: pickupDescription };
        break;
      default:
        alert('Please select a valid pickup type');
        return;
    }

    try {
      console.log("Submitting payload:", payload);
      await axiosInstance.post('/api/pickup/add', payload);
      alert('Pickup scheduled successfully! Awaiting traveler confirmation.');
      setStep('select');
    } catch (error) {
      console.error('Pickup error:', error);
      alert('Failed to schedule pickup');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 'select' ? (
          <>
            {/* <Image
              source={require("@/assets/images/11.jpeg")}
              style={styles.logo}
              resizeMode="contain"
            /> */}

            <ThemedText style={styles.headerText}>Schedule Pickup</ThemedText>
            <ThemedText style={styles.subText}>Choose your pickup method</ThemedText>

            <View style={styles.pickupOptionsContainer}>
              <TouchableOpacity 
                style={[styles.pickupOption, pickupType === 'AIRPORT' && styles.selectedOption]}
                onPress={() => handlePickupSelection('AIRPORT')}
              >
                <View style={styles.optionHeader}>
                  <FontAwesome5
                    name="plane"
                    size={20}
                    color={pickupType === 'AIRPORT' ? Colors[colorScheme].primary : Colors[colorScheme].text}
                  />
                  <ThemedText style={styles.optionText}>
                    Airport Pickup Point 
                    {pickupType === 'AIRPORT' && <FontAwesome5 name="check" size={16} style={{ marginLeft: 8 }} />}
                  </ThemedText>
                </View>
                <ThemedText style={styles.descriptionText}>
                  Meet our staff at a designated airport pickup zone.
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.pickupOption, pickupType === 'DELIVERY' && styles.selectedOption]}
                onPress={() => handlePickupSelection('DELIVERY')}
              >
                <View style={styles.optionHeader}>
                  <FontAwesome5
                    name="home"
                    size={20}
                    color={pickupType === 'DELIVERY' ? Colors[colorScheme].primary : Colors[colorScheme].text}
                  />
                  <ThemedText style={styles.optionText}>
                    Home Delivery
                    {pickupType === 'DELIVERY' && <FontAwesome5 name="check" size={16} style={{ marginLeft: 8 }} />}
                  </ThemedText>
                </View>
                <ThemedText style={styles.descriptionText}>
                  We'll deliver your package to your address.
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.pickupOption, pickupType === 'IN_PERSON' && styles.selectedOption]}
                onPress={() => handlePickupSelection('IN_PERSON')}
              >
                <View style={styles.optionHeader}>
                  <FontAwesome5
                    name="user"
                    size={20}
                    color={pickupType === 'IN_PERSON' ? Colors[colorScheme].primary : Colors[colorScheme].text}
                  />
                  <ThemedText style={styles.optionText}>
                    In-Person Pickup
                    {pickupType === 'IN_PERSON' && <FontAwesome5 name="check" size={16} style={{ marginLeft: 8 }} />}
                  </ThemedText>
                </View>
                <ThemedText style={styles.descriptionText}>
                  Arrange pickup directly with the traveler.
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.pickupOption, pickupType === 'PICKUPPOINT' && styles.selectedOption]}
                onPress={() => handlePickupSelection('PICKUPPOINT')}
              >
                <View style={styles.optionHeader}>
                  <FontAwesome5
                    name="map-marker"
                    size={20}
                    color={pickupType === 'PICKUPPOINT' ? Colors[colorScheme].primary : Colors[colorScheme].text}
                  />
                  <ThemedText style={styles.optionText}>
                    Designated Pickup Point
                    {pickupType === 'PICKUPPOINT' && <FontAwesome5 name="check" size={16} style={{ marginLeft: 8 }} />}
                  </ThemedText>
                </View>
                <ThemedText style={styles.descriptionText}>
                  Collect from a pre-arranged location.
                </ThemedText>
                <BaseButton
                variant="primary"
                onPress={() => {router.push("/pickup/pickupTravel")}}
                style={styles.confirmButton}
              >
                traveler request
              </BaseButton>
              <BaseButton
                variant="primary"
                onPress={() => {router.push("/pickup/pickupUser")}}
                style={styles.confirmButton}
              >
                user request
              </BaseButton>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.formContainer}>
            <ThemedText style={styles.headerText}>
              {pickupType === 'AIRPORT' && 'Enter Airport Details'}
              {pickupType === 'DELIVERY' && 'Delivery Information'}
              {pickupType === 'PICKUPPOINT' && 'Pickup Point Details'}
            </ThemedText>

            {pickupType === 'AIRPORT' && (
              <>
                <ThemedText style={styles.modalText}>
                  Airport Pickup Process: Our airport employee receives your package from the traveler. Visit the pickup zone with your QR code to collect it. Requires traveler confirmation.
                </ThemedText>
                <ThemedText style={styles.importantTextSafe}>
                  IMPORTANT: This process is managed by our team for your convenience and safety.
                </ThemedText>
                <InputField
                  label="Airport Name"
                  placeholder="Enter airport name"
                  value={airportName}
                  onChangeText={setAirportName}
                />
              </>
            )}

            {pickupType === 'DELIVERY' && (
              <>
                <ThemedText style={styles.modalText}>
                  Home Delivery Process: We deliver to your door. Provide your address or use current location. Requires traveler confirmation.
                </ThemedText>
                <ThemedText style={styles.importantTextSafe}>
                  IMPORTANT: This process is fully managed and guaranteed by us - no risk to you!
                </ThemedText>
                <InputField
                  label="Manual Address"
                  placeholder="Enter your address"
                  value={manualAddress}
                  onChangeText={setManualAddress}
                />
                <BaseButton
                  variant="secondary"
                  onPress={getCurrentLocation}
                  style={styles.locationButton}
                >
                  <FontAwesome5 name="location-arrow" size={16} />
                  <ThemedText style={styles.buttonText}>Use Current Location</ThemedText>
                </BaseButton>
              </>
            )}

            {pickupType === 'PICKUPPOINT' && (
              <>
                <ThemedText style={styles.modalText}>
                  Designated Pickup Point Process: Specify a location for traveler drop-off. Collect with QR code. Requires traveler confirmation. Provide clear instructions for smooth pickup.
                </ThemedText>
                <ThemedText style={styles.importantTextSafe}>
                  IMPORTANT: This process is managed by us once the package reaches the point - safe process!
                </ThemedText>
                <InputField
                  label="Address"
                  placeholder="Enter pickup point address"
                  value={manualAddress}
                  onChangeText={setManualAddress}

                />
                <InputField
                  label="Description"
                  placeholder="Add special instructions"
                  value={pickupDescription}
                  onChangeText={setPickupDescription}
                  multiline
                />
                <BaseButton
                  variant="secondary"
                  onPress={() => console.log("Open map picker")}
                  style={styles.mapButton}
                >
                  <FontAwesome5 name="map-marked-alt" size={16} />
                  <ThemedText style={styles.buttonText}>Pick on Map</ThemedText>
                </BaseButton>
              </>
            )}

            <InputField
              label="Contact Number"
              placeholder="Enter contact number"
              value={contact}
              onChangeText={setContact}
              keyboardType="phone-pad"
              style={styles.contactInput}
            />

            <View style={styles.formActions}>
              <BaseButton
                variant="secondary"
                onPress={() => setStep('select')}
                style={styles.backButton}
              >
                Back
              </BaseButton>
              <BaseButton
                variant="primary"
                onPress={handleConfirmPickup}
                style={styles.confirmButton}
              >
                Confirm
              </BaseButton>
            </View>
          </View>
        )}

        {pickupType === 'IN_PERSON' && step === 'select' && (
          <BaseButton
            variant="primary"
            size="login"
            style={styles.actionButton}
            onPress={handleConfirmPickup}
          >
            Confirm Pickup
          </BaseButton>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              {pickupType} Information
            </ThemedText>
            <ScrollView>
              <ThemedText style={styles.modalText}>
                {selectedOptionInfo.split('\n\n')[0]} {/* Process steps in black */}
              </ThemedText>
              <ThemedText style={pickupType === 'IN_PERSON' ? styles.importantTextRisk : styles.importantTextSafe}>
                {selectedOptionInfo.split('\n\n')[1]} {/* IMPORTANT in green or red */}
              </ThemedText>
              {pickupType === 'IN_PERSON' && (
                <ThemedText style={styles.modalText}>
                  {selectedOptionInfo.split('\n\n')[2]} {/* Advice for In-Person in black */}
                </ThemedText>
              )}
              {pickupType === 'PICKUPPOINT' && (
                <ThemedText style={styles.modalText}>
                  {selectedOptionInfo.split('\n\n')[2]} {/* Tip for Pickup Point in black */}
                </ThemedText>
              )}
            </ScrollView>
            <View style={styles.modalButtonContainer}>
              <BaseButton
                variant="secondary"
                onPress={() => {
                  setModalVisible(false);
                  setPickupType(""); // Reset selection
                }}
                style={styles.backButton}
              >
                Back
              </BaseButton>
              <BaseButton
                variant="primary"
                onPress={() => {
                  setModalVisible(false);
                  if (pickupType !== 'IN_PERSON') setStep('form');
                }}
                style={styles.confirmButton}
              >
                Understood
              </BaseButton>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}