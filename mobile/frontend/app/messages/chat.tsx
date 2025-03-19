import React, { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "@/config";
import { Message } from "@/types";
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
  SafeAreaView,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Send, ArrowLeft, Paperclip, FileText, Download, Image as ImageIcon, File } from "lucide-react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { sendMessage as apiSendMessage } from "@/services/chatService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "@/config";
import { getSocket, connectSocket } from "@/services/socketService";
import { Socket } from "socket.io-client";
import * as DocumentPicker from "expo-document-picker";

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const chatId = parseInt(params.chatId as string);
  const orderId = params.orderId;
  const goodsName = params.goodsName;
  const context = params.context;

  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id.toString();

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Auto-scroll to latest message
  const flatListRef = useRef<FlatList>(null);

  // Socket initialization - following the pattern from NotificationContext
  useEffect(() => {
    let mounted = true;
    
    const initializeSocket = async () => {
      if (!user?.id) {
        console.log('👤 No user logged in, skipping chat socket setup');
        return;
      }
      
      try {
        console.log('🔄 Setting up chat socket for user:', user.id);
        
        // Get socket instance but with explicit userId in the query
        const chatSocket = await getSocket('chat', { userId: user.id });
        
        if (mounted && chatSocket) {
          setSocket(chatSocket);
          
          // Make sure socket.io knows our user ID
          chatSocket.auth = { userId: user.id };
          
          // Join chat room
          if (chatSocket.connected) {
            console.log(`Joining chat room: chat_${chatId} as user ${user.id}`);
            chatSocket.emit('join_chat', chatId);
          }
          
          // Re-join chat room on reconnect
          chatSocket.on('connect', () => {
            console.log(`Socket reconnected, joining chat room: chat_${chatId}`);
            chatSocket.emit('join_chat', chatId);
          });
          
          // Setup listeners
          chatSocket.on('receive_message', (newMessage) => {
            console.log('Received new message:', newMessage);
            setMessages(prevMessages => {
              const exists = prevMessages.some(msg => msg.id === newMessage.id);
              if (!exists) {
                return [newMessage, ...prevMessages];
              }
              return prevMessages;
            });
          });
          
          chatSocket.on('error', (error) => {
            console.error('❌ Socket error:', error);
          });
        }
      } catch (error) {
        console.error('❌ Error initializing chat socket:', error);
      }
    };
    
    initializeSocket();
    
    // Cleanup
    return () => {
      mounted = false;
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [user?.id, chatId]);
  
  // Fetch messages from API
  const fetchMessages = useCallback(async () => {
    if (!chatId) return;

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const response = await axiosInstance.get(
        `/api/chats/${chatId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setMessages(response.data.data);
      }

      setError(null);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [chatId]);
  
  // Load messages when component mounts
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Get other participant's name
  const getPartnerName = () => {
    return "Chat"; // Simplified for now
  };

  // Send a text message
  const handleSend = async () => {
    if (!newMessage.trim() || !chatId) return;

    // Add message to local state first for immediate UI feedback
    const tempMessage = {
      id: `temp-${Date.now()}`,
      chatId: chatId,
      senderId: user?.id,
      content: newMessage,
      time: new Date().toISOString(),
      isRead: false,
    };

    setMessages([tempMessage, ...messages]);

    // Clear input
    setNewMessage("");

    // Send via socket
    try {
      if (socket && socket.connected) {
        console.log('Sending message via socket:', {
          chatId: parseInt(chatId),
          content: newMessage,
          type: 'text'
        });
        
        socket.emit('send_message', {
          chatId: parseInt(chatId),
          content: newMessage,
          type: 'text'
        });
      } else {
        // Fallback to REST API
        console.log('Socket not available, using REST API');
        await apiSendMessage(chatId, newMessage);
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  /**
   * Handle document picking and upload
   */
  const handleDocumentPick = async () => {
    try {
      console.log('Opening document picker...');
      
      // Launch document picker
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: '*/*',
      });
      
      console.log('Document picker result:', result);
      
      if (result.canceled) {
        console.log('Document picking was cancelled');
        return;
      }
      
      const document = result.assets[0];
      console.log('Selected document:', document);
      
      // Upload the document
      await uploadDocument(document);
      
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert(
        'Document Error',
        'There was a problem selecting the document. Please try again.'
      );
    }
  };
  
  /**
   * Upload a document to the chat and create a message
   */
  const uploadDocument = async (document: any) => {
    if (!document || !document.uri) {
      Alert.alert('Error', 'Invalid document');
      return;
    }
    
    setIsUploading(true);
    
    try {
      console.log('Preparing to upload document...');
      
      // Get the auth token
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Append the file
      formData.append('file', {
        uri: document.uri,
        type: document.mimeType || 'application/octet-stream',
        name: document.name || 'document'
      } as any);
      
      console.log('Uploading document:', {
        name: document.name,
        type: document.mimeType
      });
      
      // Upload the file
      const response = await fetch(`${BACKEND_URL}/api/chats/${chatId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }
      
      console.log('Upload successful:', result);
      
      // Step 2: Now create a message with this media
      if (socket && socket.connected) {
        console.log('Sending media message via socket:', {
          chatId: parseInt(chatId),
          content: `Sent a file: ${document.name || 'document'}`,
          type: 'document',
          mediaId: parseInt(result.mediaId)
        });
        
        socket.emit('send_message', {
          chatId: parseInt(chatId),
          content: `Sent a file: ${document.name || 'document'}`,
          type: 'document',
          mediaId: parseInt(result.mediaId)
        });
        
        // Wait a bit and refresh messages
        setTimeout(() => {
          fetchMessages();
        }, 1000);
      } else {
        // If socket is not available, create message with REST API
        console.log('Socket not available, creating message with REST API');
        await axiosInstance.post(
          `/api/chats/${chatId}/messages`,
          {
            content: `Sent a file: ${document.name || 'document'}`,
            type: 'document',
            mediaId: parseInt(result.mediaId)
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        // Refresh messages to show the new one
        fetchMessages();
      }
      
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert(
        'Upload Failed',
        'Could not upload the document. Please try again later.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Render messages with file support
  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId?.toString() === userId;
    
    // Determine if this message contains a file
    const hasFile = item.type === 'document' || item.type === 'image' || item.media;
    
    return (
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.theirMessage,
        ]}
      >
        {/* For text messages */}
        {(!hasFile || item.content) && (
          <ThemedText
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.content}
          </ThemedText>
        )}
        
        {/* For file attachments */}
        {hasFile && item.media && (
          <TouchableOpacity 
            style={styles.fileContainer}
            onPress={() => handleFileOpen(item.media)}
          >
            {/* File icon based on type */}
            <View style={styles.fileIconContainer}>
              {item.media.type === 'IMAGE' ? (
                <ImageIcon size={24} color={isMyMessage ? "#ffffff" : "#3b82f6"} />
              ) : item.media.type === 'DOCUMENT' ? (
                <FileText size={24} color={isMyMessage ? "#ffffff" : "#3b82f6"} />
              ) : (
                <File size={24} color={isMyMessage ? "#ffffff" : "#3b82f6"} />
              )}
            </View>
            
            {/* File details */}
            <View style={styles.fileDetails}>
              <ThemedText 
                style={[
                  styles.fileName, 
                  isMyMessage ? styles.myMessageText : styles.theirMessageText
                ]}
                numberOfLines={1}
              >
                {item.media.filename || 'File attachment'}
              </ThemedText>
              
              <View style={styles.fileMetaRow}>
                {/* Extension badge if available */}
                {item.media.extension && (
                  <View style={styles.extensionBadge}>
                    <Text style={styles.extensionText}>
                      {item.media.extension}
                    </Text>
                  </View>
                )}
                
                {/* Show download icon */}
                <Download 
                  size={14} 
                  color={isMyMessage ? "rgba(255,255,255,0.7)" : "#64748b"} 
                />
              </View>
            </View>
          </TouchableOpacity>
        )}
        
        {/* Timestamp */}
        <ThemedText style={[
          styles.messageTime,
          isMyMessage ? styles.myMessageTime : styles.theirMessageTime
        ]}>
          {new Date(item.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </ThemedText>
      </View>
    );
  };

  // Handle file opening
  const handleFileOpen = async (media: any) => {
    try {
      if (!media || !media.url) {
        Alert.alert('Error', 'File URL not available');
        return;
      }
      
      // Construct the full URL
      const fileUrl = media.url.startsWith('http') 
        ? media.url 
        : `${BACKEND_URL}${media.url}`;
      
      console.log('Opening file:', fileUrl);
      
      // Check if the URL can be opened
      const canOpen = await Linking.canOpenURL(fileUrl);
      
      if (canOpen) {
        await Linking.openURL(fileUrl);
      } else {
        Alert.alert(
          'Cannot Open File',
          'Your device cannot open this type of file.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Copy URL', 
              onPress: () => {
                // Implement clipboard copy here if needed
                Alert.alert('URL Copied', 'File URL copied to clipboard');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', 'Could not open the file');
    }
  };

  // UI implementation (with document upload button)
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
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
              <ThemedText style={styles.headerName}>
                {getPartnerName()}
              </ThemedText>
              {orderId && goodsName && (
                <ThemedText style={styles.headerSubtitle}>
                  Order #{orderId} - {goodsName}
                </ThemedText>
              )}
            </View>
          </View>

          {/* Context Banner */}
          {context === "pickup" && (
            <View style={styles.contextBanner}>
              <ThemedText style={styles.contextText}>
                This chat is for coordinating pickup details for Order #
                {orderId}
              </ThemedText>
            </View>
          )}

          {/* Messages */}
          {loading && messages.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <ThemedText style={styles.loadingText}>
                Loading messages...
              </ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>
                Failed to load messages: {error}
              </ThemedText>
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

          {/* Message input with document picker button */}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={handleDocumentPick}
              disabled={isUploading}
            >
              <Paperclip 
                size={22} 
                color={isUploading ? "#a0aec0" : "#3b82f6"} 
              />
            </TouchableOpacity>
            
            <TextInput
              style={[styles.input, isUploading && styles.disabledInput]}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder={isUploading ? "Uploading..." : "Type a message..."}
              placeholderTextColor={isUploading ? "#a0aec0" : "#9ca3af"}
              multiline
              editable={!isUploading}
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                (isUploading || !newMessage.trim()) && styles.disabledButton
              ]}
              onPress={handleSend}
              disabled={isUploading || !newMessage.trim()}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Send size={22} color="#ffffff" />
              )}
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
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#3b82f6",
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  contextBanner: {
    padding: 12,
    backgroundColor: "#e0f2fe",
    borderBottomWidth: 1,
    borderBottomColor: "#bfdbfe",
  },
  contextText: {
    fontSize: 14,
    color: "#1e40af",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#3b82f6",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e2e8f0",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: "#ffffff",
  },
  theirMessageText: {
    color: "#1e293b",
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-end",
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledInput: {
    opacity: 0.7,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 10,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  extensionBadge: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  extensionText: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirMessageTime: {
    color: '#64748b',
  },
});
