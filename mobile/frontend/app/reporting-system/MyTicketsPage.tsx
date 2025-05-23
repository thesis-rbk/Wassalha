import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import axiosInstance from '@/config';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ticket } from '@/types/Ticket';
import { useStatus } from '@/context/StatusContext';

import Header from '@/components/navigation/headers';
export default function MyTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { show, hide } = useStatus();

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
      show({
        type: "error",
        title: "Error",
        message: "Failed to load your tickets. Please try again.",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
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
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Tickets" subtitle="View all your previous tickets" showBackButton={true} />
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'My Tickets' }} />
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : tickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>You have no tickets yet.</ThemedText>
            <ThemedText style={styles.buttonDescription}>
              Need assistance? Create a new ticket to get help from our support team.
            </ThemedText>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/reporting-system/create-ticket')}
            >
              <ThemedText style={styles.createButtonText}>Create a New Ticket</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <FlatList
              data={tickets}
              renderItem={renderTicket}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.ticketList}
              showsVerticalScrollIndicator={false}
            />

            {/* Create button is now outside the FlatList */}
            <View style={styles.fixedButtonWrapper}>
              <ThemedText style={styles.buttonDescription}>
                Need more assistance? Our support team is ready to help.
              </ThemedText>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/reporting-system/create-ticket')}
              >
                <ThemedText style={styles.createButtonText}>Create a New Ticket</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
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
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  createButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '90%',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  ticketList: {
    paddingTop: 12,
    paddingBottom: 150, // Increased padding to make room for the button
  },
  ticketItem: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  ticketCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  ticketStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  // Changed from buttonWrapper to fixedButtonWrapper
  fixedButtonWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonDescription: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
});