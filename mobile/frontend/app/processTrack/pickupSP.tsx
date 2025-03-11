import { useRouter } from "expo-router";
import ProgressBar from "../../components/ProgressBar";
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import axiosInstance from '../../config';
import Pickups from '../pickup/pickup';
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pickup } from "../../types/Pickup";
export default function PickupTraveler() {
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
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedPickupId, setSelectedPickupId] = useState<number | null>(null);

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
    console.log('pickup id: ', pickupId);
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
            ? { ...pickup, status: 'IN_PROGRESS', travelerconfirmed: true } // Update travelerconfirmed instead of userconfirmed
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
    console.log('Suggest pickuppppppppppppppppppppppppppppppp', pickupId);
    setShowPickup(true);
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

  const handleUpdateStatus = async (pickupId: number, newStatus: Pickup['status']): Promise<void> => {
    console.log('Updating status for pickupId:', pickupId, 'to', newStatus);

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const validStatuses: Pickup['status'][] = [
        'SCHEDULED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'DELAYED',
        'DELIVERED',
      ];

      if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid status selected');
      }

      await axiosInstance.put(
        '/api/pickup/status',
        { pickupId, newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', `Pickup status updated to ${newStatus} successfully!`);
      setPickups(prevPickups =>
        prevPickups.map(pickup =>
          pickup.id === pickupId ? { ...pickup, status: newStatus } : pickup
        )
      );
      fetchPickups();
      setStatusModalVisible(false);
    } catch (error) {
      console.error('Error updating pickup status:', error);
      Alert.alert('Error', 'Failed to update pickup status. Please try again.');
    }
  };

  const openStatusModal = (pickupId: number) => {
    setSelectedPickupId(pickupId);
    setStatusModalVisible(true);
  };

  const isRequester = (pickup: Pickup) => userId !== pickup.order.travelerId;

  const renderItem = ({ item }: { item: Pickup }) => {
    const userIsRequester = isRequester(item);

    return (
      <View style={styles.item}>
        <Text>Order #{item.orderId} - {item.pickupType}</Text>
        <Text>Location: {item.location}, {item.address}</Text>
        <Text>Status: {item.status}</Text>
        <Text>Scheduled: {new Date(item.scheduledTime).toLocaleString()}</Text>

        {item.userconfirmed && !item.travelerconfirmed && (
          <Text style={styles.waitingText}>Waiting for your confirmation as traveler</Text>
        )}

        {!item.userconfirmed && item.travelerconfirmed && (
          <Text style={styles.waitingText}>Waiting for requester to confirm</Text>
        )}

        {item.userconfirmed && item.travelerconfirmed && (
          <>
            <Text style={styles.successText}>Pickup Accepted! Package on the way.</Text>
            <Text>Current Status: {item.status}</Text>
            <Button title="Update Status" onPress={() => openStatusModal(item.id)} />
          </>
        )}

        {!item.userconfirmed && !item.travelerconfirmed && (
          <Text style={styles.waitingText}>Waiting for requester to suggest a pickup</Text>
        )}

        {item.userconfirmed && !item.travelerconfirmed && (
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

  const statusOptions: Pickup['status'][] = [
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'DELAYED',
    'DELIVERED',
  ];

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
        <Pickups pickupId={pickupId} />
      ) : (
        <FlatList
          data={pickups}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={<Text>No pickup requests found.</Text>}
        />
      )}

      {/* Status Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={statusModalVisible}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select New Status</Text>
            <ScrollView style={styles.statusList}>
              {statusOptions.map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    pickups.find(p => p.id === selectedPickupId)?.status === status && styles.selectedStatusOption,
                  ]}
                  onPress={() => selectedPickupId && handleUpdateStatus(selectedPickupId, status)}
                >
                  <Text style={styles.statusText}>{status}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button title="Cancel" onPress={() => setStatusModalVisible(false)} color="#FF4444" />
          </View>
        </View>
      </Modal>
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
    color: '#ff9800', // Orange for warning
    fontWeight: 'bold',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statusList: {
    maxHeight: 200,
  },
  statusOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedStatusOption: {
    backgroundColor: '#e0f7fa',
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
});