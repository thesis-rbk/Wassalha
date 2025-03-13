import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth'; // Assuming you have this hook
import { NotificationType, NotificationStatus } from '@/store/notificationsSlice';
import { Bell, CheckCircle, XCircle, Package } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const { user } = useAuth();
  const { notifications, fetchNotifications, markAsRead } = useNotifications(user?.id?.toString());

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ACCEPTED:
        return <CheckCircle size={24} color={Colors[colorScheme].success} />;
      case NotificationType.REJECTED:
        return <XCircle size={24} color={Colors[colorScheme].error} />;
      case NotificationType.REQUEST:
        return <Package size={24} color={Colors[colorScheme].primary} />;
      default:
        return <Bell size={24} color={Colors[colorScheme].text} />;
    }
  };

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        item.status === NotificationStatus.UNREAD && styles.unreadNotification
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.iconContainer}>
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.contentContainer}>
        <ThemedText style={styles.notificationTitle}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.notificationMessage}>
          {item.message}
        </ThemedText>
        {item.createdAt && (
          <ThemedText style={styles.timestamp}>
            {formatDate(item.createdAt)}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={48} color={Colors[colorScheme].text} />
            <ThemedText style={styles.emptyText}>
              No notifications yet
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  listContent: {
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  unreadNotification: {
    backgroundColor: '#f8fafc',
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
}); 