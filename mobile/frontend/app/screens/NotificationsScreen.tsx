import React, { useEffect, useState } from "react";

import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useNotification } from "@/context/NotificationContext";
import {
  NotificationType,
  NotificationStatus,
} from "@/types/NotificationProcess";
import {
  Bell,
  CheckCircle,
  XCircle,
  Package,
  Trash2,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Swipeable } from "react-native-gesture-handler";

import { GestureHandlerRootView } from "react-native-gesture-handler";

// Add these constants at the top of your file
const SUCCESS_COLOR = "#4CAF50"; // Green color for success
const ERROR_COLOR = "#F44336"; // Red color for error
const TINT_COLOR = "#008098"; // Use the same color as your primary

export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get notifications from Redux
  const { items: notifications } = useSelector(
    (state: RootState) => state.notifications
  );

  // Use the notification context
  const { fetchNotifications, markAsRead, deleteNotification } =
    useNotification();

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
      setError("Failed to load notifications");
      console.error("Error loading notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchNotifications();
    } catch (err) {
      console.error("Error refreshing notifications:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle notification read status
  const handleNotificationPress = async (id: number) => {
    await markAsRead(id);
  };

  // Handle notification deletion
  const handleDelete = async (id: number) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNotification(id);
            } catch (err) {
              console.error("Error deleting notification:", err);
            }
          },
        },
      ]
    );
  };

  // Render right swipe actions (delete)
  const renderRightActions = (id: number) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDelete(id)}
      >
        <Trash2 color="white" size={24} />
      </TouchableOpacity>
    );
  };

  // Render a notification item
  const renderNotification = ({ item }: { item: any }) => {
    const isUnread = item.status === NotificationStatus.UNREAD;

    // Determine icon based on notification type
    let Icon = Bell;
    let iconColor = Colors[colorScheme].text;

    if (item.type === NotificationType.ACCEPTED) {
      Icon = CheckCircle;
      iconColor = SUCCESS_COLOR; // Use constant instead of Colors.success
    } else if (item.type === NotificationType.REJECTED) {
      Icon = XCircle;
      iconColor = ERROR_COLOR; // Use constant instead of Colors.error
    } else if (item.type === NotificationType.REQUEST) {
      Icon = Package;
      iconColor = Colors[colorScheme].primary; // Use theme-specific primary color
    }

    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <TouchableOpacity
          style={[styles.notificationItem, isUnread && styles.unreadItem]}
          onPress={() => handleNotificationPress(item.id)}
        >
          <View style={styles.iconContainer}>
            <Icon color={iconColor} size={24} />
          </View>
          <View style={styles.contentContainer}>
            <ThemedText style={[styles.title, isUnread && styles.unreadText]}>
              {item.title || "Notification"}
            </ThemedText>
            <ThemedText style={styles.message}>{item.message}</ThemedText>
            {item.createdAt && (
              <ThemedText style={styles.timestamp}>
                {new Date(item.createdAt).toLocaleDateString()}{" "}
                {new Date(item.createdAt).toLocaleTimeString()}
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // Debug log to see what's happening
  console.log("Notifications data:", notifications);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: TINT_COLOR }]}
              onPress={loadNotifications}
            >
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {isLoading && !refreshing && notifications.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={TINT_COLOR} />
            <ThemedText style={styles.loadingText}>
              Loading notifications...
            </ThemedText>
          </View>
        ) : notifications.length > 0 ? (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Bell color={Colors[colorScheme].text} size={48} />
            <ThemedText style={styles.emptyText}>
              No notifications yet
            </ThemedText>
            <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: TINT_COLOR }]}
              onPress={onRefresh}
            >
              <ThemedText style={styles.refreshButtonText}>Refresh</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  unreadItem: {
    backgroundColor: "rgba(0, 122, 255, 0.05)",
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: "700",
  },
  message: {
    fontSize: 14,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    marginVertical: 16,
    textAlign: "center",
  },
  refreshButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: TINT_COLOR,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "500",
  },
  errorContainer: {
    padding: 16,
    alignItems: "center",
  },
  errorText: {
    color: ERROR_COLOR,
    marginBottom: 12,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: TINT_COLOR,
    borderRadius: 4,
  },
  retryButtonText: {
    color: "white",
  },
  deleteAction: {
    backgroundColor: ERROR_COLOR,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
});
