import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
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

const PickupRequests: React.FC = () => {
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
      <View style={styles.item}>
        <Text>Order #{item.orderId} - {item.pickupType}</Text>
        <Text>Location: {item.location}, {item.address}</Text>
        <Text>Status: {item.status}</Text>
        <Text>Scheduled: {new Date(item.scheduledTime).toLocaleString()}</Text>

        {userIsRequester && item.userconfirmed ? (
          <Text style={styles.waitingText}>Waiting for your traveler to confirm</Text>
        ) : userIsTraveler && item.travelerconfirmed ? (
          <Text style={styles.waitingText}>Waiting for your requester to confirm</Text>
        ) : (
          <>
            <Button title="Accept" onPress={() => handleAccept(item.id)} />
            <Button title="Suggest Another" onPress={() => handleSuggest(item.id)} />
          </>
        )}
      </View>
    );
  };

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
  waitingText: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
  },
});

export default PickupRequests;