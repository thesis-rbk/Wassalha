import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import axiosInstance from '@/config';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Ticket = {
  id: number;
  title: string;
  category: string;
  status: string;
};

export default function MyTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await axiosInstance.get('/api/tickets/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTickets(response.data.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      Alert.alert('Error', 'Failed to load your tickets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTicket = ({ item }: { item: Ticket }) => (
    <TouchableOpacity
      style={styles.ticketItem}
      onPress={() => router.push({ pathname: '/reporting-system/detailsTicket', params: { id: item.id.toString() } })}
    >
      <ThemedText style={styles.ticketTitle}>{item.title}</ThemedText>
      <ThemedText style={styles.ticketCategory}>{item.category.replace(/_/g, ' ')}</ThemedText>
      <ThemedText style={[styles.ticketStatus, { color: getStatusColor(item.status) }]}>
        {item.status}
      </ThemedText>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return '#FFA500';
      case 'IN_PROGRESS':
        return '#1E90FF';
      case 'RESOLVED':
        return '#32CD32';
      case 'CLOSED':
        return '#808080';
      default:
        return '#000000';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'My Tickets' }} />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>You have no tickets yet.</ThemedText>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/reporting-system/create-ticket')}
          >
            <ThemedText style={styles.backButtonText}>Back to Report Issue</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicket}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.ticketList}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.light.primary + '20',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  ticketList: {
    padding: 16,
  },
  ticketItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  ticketCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ticketStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
});