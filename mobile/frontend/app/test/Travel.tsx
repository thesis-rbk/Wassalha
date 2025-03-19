import React from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MessageCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { navigateToChat } from "@/services/chatService";

export default function Travel() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  // Function to open a test chat with the provided IDs
  const openTestChat = async () => {
    if (!user?.id) {
      Alert.alert("Error", "You need to be logged in to chat");
      return;
    }

    try {
      // Using the IDs provided: 44 and 45
      const requesterId = user.id;
      const providerId = 2; // The traveler/provider ID you provided
      const goodsId = 3; // The goods ID you provided

      console.log("Opening test chat with:", {
        requesterId,
        providerId: 2,
        goodsId: 3,
      });

      await navigateToChat(requesterId, providerId, goodsId, router, {
        orderId: 1, // Using a default order ID
        goodsName: "Test Item",
      });
    } catch (error) {
      console.error("Error opening test chat:", error);
      Alert.alert(
        "Chat Error",
        "Failed to open chat. Error: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.comingSoonText}>
        Travel Page Coming Soon
      </ThemedText>

      {/* Functional chat button using IDs 44 and 45 */}
      <TouchableOpacity style={styles.chatButton} onPress={openTestChat}>
        <MessageCircle size={20} color="white" style={styles.chatIcon} />
        <ThemedText style={styles.chatButtonText}>
          Open Test Chat (IDs: 44, 45)
        </ThemedText>
      </TouchableOpacity>

      <ThemedText style={styles.demoText}>
        This button opens a chat with providerId: 44 and goodsId: 45
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  comingSoonText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6", // Primary blue
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatIcon: {
    marginRight: 8,
  },
  chatButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  demoText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
    opacity: 0.7,
    maxWidth: "80%",
  },
});
