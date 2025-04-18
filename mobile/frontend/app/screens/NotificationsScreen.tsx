import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useNotification } from "@/context/NotificationContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TabBar } from "@/components/navigation/TabBar";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import {
  NotificationType,
  NotificationStatus,
  Notification,
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
import { useStatus } from '@/context/StatusContext';

const SUCCESS_COLOR = "#4CAF50";
const ERROR_COLOR = "#F44336";
const TINT_COLOR = "#008098";

export default function NotificationsScreen() {
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? "light";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  console.log("params from NotificationsScreen:", params);

  // Get notifications from Redux
  const notifications = useSelector(
    (state: RootState) => state.notifications.items as Notification[]
  );

  const { fetchNotifications, markAsRead, deleteNotification } =
    useNotification();
  const router = useRouter();
  const { show, hide } = useStatus();

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    // Navigate based on tab
    if (tab === "create") {
      router.push("/verification/CreateSponsorPost");
    } else if (tab === "notifications") {
      // Stay on this screen or reload if needed
      // router.push('/notifications'); // Already here
    } else {
      // Navigate to other main tabs like home, profile etc.
      router.push(`./${tab}`);
    }
  };

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

  // --- Handle notification press for marking read AND navigation ---
  const handleNotificationPress = async (item: Notification) => {
    try {
      // 1. Mark as read (only if currently unread)
      if (item.status === NotificationStatus.UNREAD) {
        await markAsRead(item.id);
      }

      // 2. Determine navigation based on notification data
      let type = item.type;
      type = type || "";

      // Check if navigation data is present
      if (type) {
        let targetPath = "home";

        switch (type) {
          case "REQUEST":
            targetPath = `/orders&requests/order`;
            break;
          case "ACCEPTED":
            targetPath = `/orders&requests/order`;
            break;
          case "REJECTED":
            targetPath = `/orders&requests/order`;
            break;
          case "ORDER_CREATED":
            targetPath = `/orders&requests/order`;
            break;
          case "PAYMENT_INITIATED":
            targetPath = `/orders&requests/order`;
            break;
          case "PAYMENT_SUCCESS":
            targetPath = `/orders&requests/order`;
            break;
          case "PAYMENT_FAILED":
            targetPath = `/orders&requests/order`;
            break;
          case "PAYMENT_REFUNDED":
            targetPath = `/orders&requests/order`;
            break;
          case "PICKUP_SCHEDULE":
            targetPath = `/orders&requests/order`;
            break;
          case "DELIVERY_COMPLETED":
            targetPath = `/orders&requests/order`;
            break;
          case "SYSTEM_ALERT":
            targetPath = `/home`;
            break;
          //MORE CASES HERE
          default:
            console.warn(
              `Unhandled notification: ${type} for notification ID ${item.id}`
            );
            // targetPath = "/home"; // Fallback to home?
            break;
        }
        // --- End navigation logic definition ---

        if (targetPath) {
          console.log(`Navigating to: ${targetPath}`);
          router.push(targetPath as any);
        } else {
          console.log(
            `Notification ${item.id} is actionable but no target path defined for message ${type}.`
          );
        }
      } else {
        // Notification might be purely informational or lack navigation context
        console.log(
          `Notification ${item.id} has no specific navigation action.`
        );
      }
    } catch (err) {
      console.error("Error handling notification press:", err);
    }
  };

  const handleDelete = async (id: number) => {
    show({
      type: "error",
      title: "Delete Notification",
      message: "Are you sure you want to delete this notification?",
      primaryAction: {
        label: "Delete",
        onPress: async () => {
          try {
            await deleteNotification(id);
            hide();
          } catch (err) {
            console.error("Error deleting notification:", err);
            show({
              type: "error",
              title: "Error",
              message: "Failed to delete notification.",
              primaryAction: {
                label: "OK",
                onPress: hide
              }
            });
          }
        }
      },
      secondaryAction: {
        label: "Cancel",
        onPress: hide
      }
    });
  };

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
  const renderNotification = ({ item }: { item: Notification }) => {
    const isUnread = item.status === NotificationStatus.UNREAD;

    let Icon = Bell;
    let iconColor = Colors[colorScheme].text;

    if (item.type === NotificationType.ACCEPTED) {
      Icon = CheckCircle;
      iconColor = SUCCESS_COLOR;
    } else if (item.type === NotificationType.REJECTED) {
      Icon = XCircle;
      iconColor = ERROR_COLOR;
    } else if (item.type === NotificationType.REQUEST) {
      Icon = Package;
      iconColor = Colors[colorScheme].primary;
    }

    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <TouchableOpacity
          style={[styles.notificationItem, isUnread && styles.unreadItem]}
          onPress={() => handleNotificationPress(item)}
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={styles.container}>
          <TopNavigation title="Notifications" />

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
                style={[styles.refreshButton, { backgroundColor: "#007BFF" }]}
                onPress={onRefresh}
              >
                <ThemedText style={styles.refreshButtonText}>
                  Refresh
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
        </ThemedView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    fontSize: 24,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 80,
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  unreadItem: {
    backgroundColor: "rgba(0, 122, 255, 0.08)",
  },
  iconContainer: {
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: "bold",
  },
  message: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
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
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    marginVertical: 20,
    textAlign: "center",
    opacity: 0.7,
  },
  refreshButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 15,
  },
  errorContainer: {
    padding: 16,
    alignItems: "center",
    backgroundColor: `${ERROR_COLOR}20`,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: ERROR_COLOR,
    marginBottom: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "500",
  },
  deleteAction: {
    backgroundColor: ERROR_COLOR,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
});
