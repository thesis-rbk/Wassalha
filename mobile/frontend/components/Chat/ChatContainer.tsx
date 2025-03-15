import React, { useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useChat } from '@/hooks/useChat';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Props for the ChatContainer component
 * @property chatId - ID of the current chat
 * @property userId - ID of the current user
 */
interface ChatContainerProps {
  chatId: number;
  userId: string;
}

/**
 * ChatContainer - A complete chat interface component
 * 
 * This component combines message list and input to create
 * a full chat experience with loading states, typing indicators,
 * and automatic read receipts.
 */
export default function ChatContainer({ chatId, userId }: ChatContainerProps) {
  // Get chat data and functions from our useChat hook
  const { 
    messages, 
    activeChat, 
    loading, 
    isTyping,
    error,
    fetchChatMessages,
    sendMessage,
    markMessageAsRead,
    sendTypingIndicator,
    fetchChatDetails
  } = useChat(chatId, userId);
  
  // Reference to FlatList for scrolling
  const flatListRef = useRef<FlatList>(null);
  
  // Get color scheme for theming
  const colorScheme = useColorScheme() ?? 'light';
  
  // Fetch messages when component mounts
  useEffect(() => {
    if (chatId) {
      fetchChatDetails(chatId);
      fetchChatMessages(chatId);
    }
  }, [chatId, fetchChatMessages]);
  
  // Mark messages as read when they are viewed
  useEffect(() => {
    if (messages && messages.length > 0) {
      messages.forEach(message => {
        // Only mark others' messages that aren't read yet
        if (message.senderId.toString() !== userId && !message.isRead) {
          markMessageAsRead(typeof message.id === 'string' ? parseInt(message.id) : message.id);
        }
      });
    }
  }, [messages, userId, markMessageAsRead]);
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      // Small delay to ensure rendering is complete
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [messages.length]);
  
  // Handle sending a message
  const handleSendMessage = (text: string) => {
    sendMessage(text);
  };
  
  // Loading state
  if (loading && messages.length === 0) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
        <ThemedText style={styles.loadingText}>Loading messages...</ThemedText>
      </ThemedView>
    );
  }
  
  // Error state
  if (error && messages.length === 0) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>
          Something went wrong: {error}
        </ThemedText>
      </ThemedView>
    );
  }
  
  // Render a message item
  const renderMessage = ({ item }: { item: any }) => {
    const isSender = item.senderId.toString() === userId;
    
    return (
      <MessageBubble
        content={item.content || item.text || ''}
        time={item.time}
        isRead={item.isRead}
        isSender={isSender}
      />
    );
  };
  
  return (
    <ThemedView style={styles.container}>
      {/* Messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        inverted // Display newest messages at the bottom
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No messages yet. Start the conversation!
            </ThemedText>
          </ThemedView>
        }
      />
      
      {/* Typing indicator */}
      {isTyping && (
        <ThemedView style={styles.typingContainer}>
          <ThemedText style={styles.typingText}>
            {activeChat && (
              activeChat.requesterId.toString() === userId
                ? activeChat.provider?.name
                : activeChat.requester?.name
            )} is typing...
          </ThemedText>
        </ThemedView>
      )}
      
      {/* Message input */}
      <MessageInput 
        onSend={handleSendMessage} 
        onTyping={sendTypingIndicator}
        disabled={loading} 
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    flexGrow: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444', // Red color for error
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#9ca3af', // Gray color
  },
  typingContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6b7280', // Medium gray
  },
});