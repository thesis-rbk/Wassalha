import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useNotification } from '@/context/NotificationContext';
import { NotificationType, NotificationStatus } from '@/types/NotificationProcess';
import { Bell, CheckCircle, XCircle, Package, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Swipeable } from 'react-native-gesture-handler';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get notifications from Redux
  const { items: notifications } = useSelector((state: RootState) => state.notifications);
  
  // Use the notification context
  const { fetchNotifications, markAsRead, deleteNotification } = useNotification();

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  // Function to load notifications with loading state
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await fetchNotifications();
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of your component remains the same...
}
