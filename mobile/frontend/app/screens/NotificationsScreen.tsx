import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsScreen() {
  const { notifications } = useNotifications();

  const renderNotification = ({ item }: { item: any }) => (
    <View style={styles.notificationItem}>
      <ThemedText style={styles.notificationTitle}>{item.title}</ThemedText>
      <ThemedText style={styles.notificationMessage}>{item.message}</ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No notifications yet</ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    color: '#64748b',
  },
}); 