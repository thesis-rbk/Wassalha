import { useRouter } from "expo-router";
import ProgressBar from "../../components/ProgressBar";
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet,ScrollView } from 'react-native';
import axiosInstance from '../../config';

// Define the pickup type
interface Pickup {
  id: number;
  orderId: number;
  pickupType: 'AIRPORT' | 'IN_PERSON' | 'PICKUPPOINT' | 'DELIVERY';
  location: string;
  address: string;
  coordinates: string;
  contactPhoneNumber: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED' | 'DELIVERED';
  scheduledTime: string;
  travelerconfirmed: boolean;
  userconfirmed: boolean;
  order: {
    travelerId: number;
  };
}
export default function PickupScreen() {
  const router = useRouter();

  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization" },
    { id: 2, title: "Verification", icon: "verification" },
    { id: 3, title: "Payment", icon: "payment" },
    { id: 4, title: "Pickup", icon: "pickup" },
  ];
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const userId = 2; // Hardcoded for now, replace with dynamic user ID later

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: Pickup[] }>(`/api/pickup/${userId}`);
      setPickups(response.data.data);
      console.log('Pickups:', response.data.data);
    } catch (error) {
      console.error('Error fetching pickups:', error);
    }
  };

  const handleAccept = async (pickupId: number): Promise<void> => {
    try {
      await axiosInstance.post('/api/pickup/accept', { pickupId });
      alert('Pickup accepted!');
      fetchPickups();
    } catch (error) {
      console.error('Error accepting pickup:', error);
    }
  };

  const handleSuggest = async (pickupId: number): Promise<void> => {
    const suggestedType: Pickup['pickupType'] = 'PICKUPPOINT';
    try {
      await axiosInstance.post('/api/pickup/suggest', { pickupId, suggestedType });
      alert(`Suggested ${suggestedType} for pickup!`);
      fetchPickups();
    } catch (error) {
      console.error('Error suggesting pickup:', error);
    }
  };

  const isTraveler = (pickup: Pickup) => userId === pickup.order.travelerId;

  const renderItem = ({ item }: { item: Pickup }) => {
    const userIsTraveler = isTraveler(item);
    const userIsRequester = !userIsTraveler;

    return (
      <><View style={styles.item}>
        <Text>Order #{item.orderId} - {item.pickupType}</Text>
        <Text>Location: {item.location}, {item.address}</Text>
        <Text>Status: {item.status}</Text>
        <Text>Scheduled: {new Date(item.scheduledTime).toLocaleString()}</Text>

        {userIsRequester && item.userconfirmed ? (
          <Text style={styles.waitingText}>Waiting for your traveler to confirm</Text>
        ) : (
          <>
            <Button title="Accept" onPress={() => handleAccept(item.id)} />
            <Button title="Suggest Another" onPress={() => handleSuggest(item.id)} />
          </>
        )}
      </View>
       <View style={styles.container}>
            <FlatList
              data={pickups}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              ListEmptyComponent={<Text>No pickup requests found.</Text>}
            />
          </View></>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Pickup Option</Text>
        <Text style={styles.subtitle}>
          Choose how you'd like to receive your item.
        </Text>

        <ProgressBar currentStep={4} steps={progressSteps} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: "#64748b",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
  },
  summaryCard: {
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#1e293b",
    marginBottom: 16,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#64748b",
  },
  orderValue: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#1e293b",
  },
  travelerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  travelerImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  priceValue: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: "#16a34a",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },
  totalLabel: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#1e293b",
  },
  totalValue: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#16a34a",
  },
  paymentCard: {
    marginTop: 16,
  },
  paymentOptions: {
    flexDirection: "row",
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 12,
    minWidth: 120,
  },
  selectedPaymentOption: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  paymentOptionText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  paypalText: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#64748b",
  },
  selectedPaymentOptionText: {
    color: "#3b82f6",
  },
  cardForm: {
    marginTop: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
  },
  inputLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#64748b",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  paypalContainer: {
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  paypalInstructions: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  securityText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  escrowNote: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  escrowText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  payButton: {
    marginTop: 8,
  },
  item: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  waitingText: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
  },
});
