import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { io } from "socket.io-client";
import { BACKEND_URL } from "@/config";
import { Chat, User } from "@/types";

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const { chatId, orderId, senderId, recieverId } = params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const scrollViewRef = useRef(null);

  interface Message {
    id: number | string;
    chat: Chat;
    receiverId: number;
    senderId: number;
    sender: User;
    type: string;
    content?: string;
    mediaId?: number;
    isRead: boolean;
    text: string;
    time: string;
  }

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(`${BACKEND_URL}/chat`, {
      query: { senderId, chatId },
    });

    newSocket.on("connect", () => {
      console.log("Connected to chat socket");
    });

    // newSocket.on("receive_message", (message: Message) => {
    //   setMessages((prevMessages) => [...prevMessages, message]);
    //   scrollToBottom();
    // });

    // setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [senderId, chatId]);

  // Scroll to the bottom of the chat
  //   const scrollToBottom = () => {
  //     if (scrollViewRef.current) {
  //       scrollViewRef.current.scrollToEnd({ animated: true });
  //     }
  //   };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        chatId,
        content: newMessage,
        type: "text",
      };

      //   Send message via socket
      //   socket.emit("send_message", messageData);

      // Clear the input field
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        // onContentSizeChange={scrollToBottom}
      >
        {messages.map((message: Message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.senderId === parseInt(senderId.toString())
                ? styles.myMessage
                : styles.otherMessage,
            ]}
          >
            <Text style={styles.messageText}>{message.content}</Text>
            <Text style={styles.messageTime}>
              {new Date(message.time).toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    paddingBottom: 80, // Space for the input container
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#3b82f6",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e2e8f0",
  },
  messageText: {
    fontSize: 16,
    color: "#1e293b",
  },
  messageTime: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 8,
  },
  sendButton: {
    padding: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
