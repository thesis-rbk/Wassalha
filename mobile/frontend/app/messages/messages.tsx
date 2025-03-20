import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import axiosInstance from "@/config";
import { Message, User, Profile } from "../../types";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function MessagesScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [conversations, setConversations] = useState<
    { user: User; lastMessage: Message; unreadCount: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Messages");

  const currentUserId = user?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users and their profiles
        const usersResponse = await axiosInstance.get("/api/users");
        const users: User[] = usersResponse.data.data;

        // Fetch messages for the current user
        const messagesResponse = await axiosInstance.get(
          `/api/users/messages?userId=${currentUserId}`
        );
        const messages: Message[] = messagesResponse.data.data;

        // Group messages by conversation (user)
        const conversationMap = new Map<
          number,
          { user: User; lastMessage: Message; unreadCount: number }
        >();

        messages.forEach((message: Message) => {
          let otherUserId: number;

          if (message.senderId === currentUserId) {
            otherUserId = message.receiverId;
          } else if (message.receiverId === currentUserId) {
            otherUserId = message.senderId;
          } else {
            return; // Skip messages not related to current user
          }

          const otherUser = users.find((user) => user.id === otherUserId);
          if (!otherUser) return;

          const existingConversation = conversationMap.get(otherUserId);

          if (
            !existingConversation ||
            new Date(message.time) >
              new Date(existingConversation.lastMessage.time)
          ) {
            const unreadCount =
              !message.isRead && message.senderId !== currentUserId
                ? (existingConversation?.unreadCount || 0) + 1
                : existingConversation?.unreadCount || 0;

            conversationMap.set(otherUserId, {
              user: otherUser,
              lastMessage: message,
              unreadCount,
            });
          }
        });

        setConversations(Array.from(conversationMap.values()));
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load messages. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUserId]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();

    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }

    // Otherwise show full date
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderConversation = ({
    item,
  }: {
    item: (typeof conversations)[0];
  }) => {
    const { user, lastMessage, unreadCount } = item;

    return (
      <TouchableOpacity style={styles.conversationItem}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: user.profile?.imageId
                ? `https://your-backend-url.com/images/${user.profile.imageId}`
                : "https://www.pngplay.com/wp-content/uploads/12/User-Avatar-Profile-Transparent-Clip-Art-PNG.png", // Fallback image
            }}
            style={styles.avatar}
          />
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName}>
              {user.profile?.firstName} {user.profile?.lastName}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(lastMessage.time)}
            </Text>
          </View>

          <Text
            style={[
              styles.messagePreview,
              unreadCount > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {lastMessage.content}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleNotificationPress = () => {
    router.push("/notifications");
  };
  
  const handleProfilePress = () => {
    router.push("/profile");
  };
  
  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <TopNavigation 
        title="Messages" 
        onNotificationPress={handleNotificationPress}
        onProfilePress={handleProfilePress}
      />
      
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.user.id.toString()}
        renderItem={renderConversation}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        }
      />
      
      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  listContainer: {
    padding: 16,
  },
  conversationItem: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  unreadCount: {
    color: "#ffffff",
    fontSize: 10,
    fontFamily: "Inter-Bold",
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#1e293b",
  },
  timestamp: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#94a3b8",
  },
  messagePreview: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
  },
  unreadMessage: {
    fontFamily: "Inter-Medium",
    color: "#1e293b",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: "#94a3b8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: "#ef4444",
  },
});
