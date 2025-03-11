import { useRouter } from "expo-router";
import ProgressBar from "../../components/ProgressBar";
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ScrollView } from 'react-native';
import axiosInstance from '../../config';
import Pickups from '../pickup/pickup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Pickup } from "../../types/Pickup";


export default function PickupOwner() {
  const router = useRouter();

  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization" },
    { id: 2, title: "Verification", icon: "verification" },
    { id: 3, title: "Payment", icon: "payment" },
    { id: 4, title: "Pickup", icon: "pickup" },
  ];

  const [pickupId, setPickupId] = useState<number>(0);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [showPickup, setShowPickup] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;

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
    console.log('pickup iiid: ', pickupId);
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axiosInstance.put(
        '/api/pickup/accept',
        { pickupId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Pickup accepted!');
      setPickups(prevPickups =>
        prevPickups.map(pickup =>
          pickup.id === pickupId
            ? { ...pickup, status: 'IN_PROGRESS', userconfirmed: true }
            : pickup
        )
      );
      fetchPickups();
    } catch (error) {
      console.error('Error accepting pickup:', error);
      alert('Failed to accept pickup. Please try again.');
    }
  };

  const handleSuggest = async (pickupId: number): Promise<void> => {
    setPickupId(pickupId);
    setShowPickup(true);
    // Optionally fetch pickups here if you want to refresh immediately after opening Pickup
    // await fetchPickups();
  };

  const handleCancel = async (pickupId: number): Promise<void> => {
    console.log('Cancel pickup', pickupId);
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axiosInstance.put(
        '/api/pickup/status',
        { pickupId, newStatus: 'CANCELLED' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Pickup cancelled!');
      setPickups(prevPickups =>
        prevPickups.map(pickup =>
          pickup.id === pickupId
            ? { ...pickup, status: 'CANCELLED' }
            : pickup
        )
      );
      fetchPickups();
    } catch (error) {
      console.error('Error cancelling pickup:', error);
      alert('Failed to cancel pickup. Please try again.');
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

        {item.userconfirmed && !item.travelerconfirmed && (
          <Text style={styles.waitingText}>Waiting for traveler to confirm</Text>
        )}

        {item.userconfirmed && item.travelerconfirmed && (
          <Text style={styles.successText}>Pickup Accepted! Package on the way.</Text>
        )}

        {!item.userconfirmed && item.travelerconfirmed && (
          <>
            {item.status === 'CANCELLED' ? (
              <>
                <Text style={styles.cancelledText}>Pickup Cancelled</Text>
                <Text style={styles.warningText}>
                  This pickup was cancelled. Please suggest a new pickup method to proceed.
                </Text>
                <Button
                  title="Suggest Another"
                  onPress={() => handleSuggest(item.id)}
                  color="#2196F3"
                />
              </>
            ) : (
              <>
                <Button title="Accept" onPress={() => handleAccept(item.id)} />
                <Button title="Suggest Another" onPress={() => handleSuggest(item.id)} />
                <Button title="Cancel" onPress={() => handleCancel(item.id)} />
              </>
            )}
          </>
        )}
      </View>
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

      {showPickup ? (
        <Pickups pickupId={pickupId} /> // Removed onClose prop
      ) : (
        <FlatList
          data={pickups}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={<Text>No pickup requests found.</Text>}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
  successText: {
    color: 'green',
    fontWeight: 'bold',
    marginTop: 5,
  },
  cancelledText: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: 5,
  },
  warningText: {
    color: '#ff9800',
    fontWeight: 'bold',
    marginTop: 5,
  },
});