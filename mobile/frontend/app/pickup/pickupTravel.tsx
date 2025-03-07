// PickupRequests.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import axiosInstance from '../../config'; // Import your custom axiosInstance

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
  travelerId: number;
}

const PickupRequests: React.FC = () => {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const userId = 2; // Hardcoded for this example

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async (): Promise<void> => {
    try {
      // Use axiosInstance instead of axios
      const response = await axiosInstance.get<{ success: boolean; data: Pickup[] }>(`/api/pickup/${userId}`);
      setPickups(response.data.data);
    //   console.log('Pickups:', response);
    } catch (error) {
      console.error('Error fetching pickups:', error);
    }
  };

  const handleAccept = async (pickupId: number): Promise<void> => {
    try {
      await axiosInstance.post('/api/pickup/accept', { pickupId });
      alert('Pickup accepted!');
      fetchPickups(); // Refresh the list
    } catch (error) {
      console.error('Error accepting pickup:', error);
    }
  };

  const handleSuggest = async (pickupId: number): Promise<void> => {
    const suggestedType: Pickup['pickupType'] = 'PICKUPPOINT'; // Example suggestion, could be dynamic
    try {
      await axiosInstance.post('/api/pickup/suggest', { pickupId, suggestedType });
      alert(`Suggested ${suggestedType} for pickup!`);
      fetchPickups(); // Refresh the list
    } catch (error) {
      console.error('Error suggesting pickup:', error);
    }
  };

  const renderItem = ({ item }: { item: Pickup }) => (
    <View style={styles.item}>
      <Text>Order #{item.orderId} - {item.pickupType}</Text>
      <Text>Location: {item.location}, {item.address}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Scheduled: {new Date(item.scheduledTime).toLocaleString()}</Text>
      <Button title="Accept" onPress={() => handleAccept(item.id)} />
      <Button title="Suggest Another" onPress={() => handleSuggest(item.id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pickups}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={<Text>No pickup requests found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  item: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
});

export default PickupRequests;