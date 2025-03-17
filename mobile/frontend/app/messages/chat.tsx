import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Send, ArrowLeft } from 'lucide-react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { sendMessage as apiSendMessage } from '@/services/chatService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@/config';

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const chatId = parseInt(params.chatId as string);
  const orderId = params.orderId;
  const goodsName = params.goodsName;
  const context = params.context;

  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id.toString();
  
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Auto-scroll to latest message
  const flatListRef = useRef<FlatList>(null);

  // Fetch messages when the screen loads
  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  // Function to fetch messages from API
  const fetchMessages = async () => {
    if (!chatId) return;
    
    setLoading(true);
    
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`${BACKEND_URL}/api/chats/${chatId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      if (data && data.data) {
        setMessages(data.data);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Get other participant's name
  const getPartnerName = () => {
    return 'Chat';  // Simplified for now
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !chatId) return;
    
    // Add message to local state first for immediate UI feedback
    const tempMessage = {
      id: `temp-${Date.now()}`,
      chatId: chatId,
      senderId: user?.id,
      content: newMessage,
      time: new Date().toISOString(),
      isRead: false
    };
    
    setMessages([tempMessage, ...messages]);
    
    // Clear input
    setNewMessage('');
    
    // Send to API
    try {
      await apiSendMessage(chatId, newMessage);
      
      // Refetch messages to get the server-generated message
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error - maybe show an alert
    }
  };

  // Render message item
  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId?.toString() === userId;
    
    return (
      <View style={[
        styles.messageBubble,
        isMyMessage ? styles.myMessage : styles.theirMessage
      ]}>
        <ThemedText style={[
          styles.messageText,
          isMyMessage ? styles.myMessageText : styles.theirMessageText
        ]}>
          {item.content}
        </ThemedText>
        <ThemedText style={styles.messageTime}>
          {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </ThemedText>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ThemedView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <ThemedText style={styles.headerName}>{getPartnerName()}</ThemedText>
              {orderId && goodsName && (
                <ThemedText style={styles.headerSubtitle}>
                  Order #{orderId} - {goodsName}
                </ThemedText>
              )}
            </View>
          </View>
          
          {/* Context Banner (shown for pickup chats) */}
          {context === 'pickup' && (
            <View style={styles.contextBanner}>
              <ThemedText style={styles.contextText}>
                This chat is for coordinating pickup details for Order #{orderId}
              </ThemedText>
            </View>
          )}
          
          {/* Messages */}
          {loading && messages.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <ThemedText style={styles.loadingText}>Loading messages...</ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>Failed to load messages: {error}</ThemedText>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id.toString()}
              inverted={true}
              contentContainerStyle={styles.messagesList}
            />
          )}
          
          {/* Message input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSend}
              disabled={!newMessage.trim()}
            >
              <Send size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#3b82f6',
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  contextBanner: {
    padding: 12,
    backgroundColor: '#e0f2fe',
    borderBottomWidth: 1,
    borderBottomColor: '#bfdbfe',
  },
  contextText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#ffffff',
  },
  theirMessageText: {
    color: '#1e293b',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
});