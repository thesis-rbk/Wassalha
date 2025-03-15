import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import ChatContainer from '@/components/Chat/ChatContainer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function ChatTest() {
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  
  // Basic state
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [testMode, setTestMode] = useState<'list' | 'chat'>('list');
  
  // Get chat hook
  const { 
    chats, 
    loading, 
    error, 
    fetchUserChats 
  } = useChat(undefined, user?.id?.toString());
  
  // Fetch chats on mount
  useEffect(() => {
    if (user?.id) {
      fetchUserChats();
    }
  }, [user?.id, fetchUserChats]);
  
  // Simple render for list view
  if (testMode === 'list') {
    return (
      <ThemedView style={styles.container}>
        <ScrollView style={styles.scrollContainer}>
          <ThemedText style={styles.title}>Chat Test</ThemedText>
          
          {/* Direct Test Button */}
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: Colors[colorScheme].primary }]} 
            onPress={() => {
              setActiveChatId(1); // Use the chat we created manually
              setTestMode('chat');
            }}
          >
            <ThemedText style={styles.buttonText}>
              Open Test Chat (ID: 1)
            </ThemedText>
          </TouchableOpacity>
          
          {/* Show loading state */}
          {loading && (
            <ActivityIndicator 
              size="large" 
              color={Colors[colorScheme].primary} 
              style={styles.loader} 
            />
          )}
          
          {/* Show error if any */}
          {error && (
            <ThemedText style={styles.errorText}>
              Error: {error}
            </ThemedText>
          )}
          
          {/* Show chats list */}
          {chats.map(chat => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatItem}
              onPress={() => {
                setActiveChatId(chat.id);
                setTestMode('chat');
              }}
            >
              <ThemedText style={styles.chatTitle}>
                Chat #{chat.id}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>
    );
  }
  
  // Chat view
  if (testMode === 'chat' && activeChatId && user?.id) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.chatHeaderContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              setTestMode('list');
              setActiveChatId(null);
            }}
          >
            <ThemedText style={styles.backButtonText}>← Back</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.chatHeader}>Chat #{activeChatId}</ThemedText>
        </View>
        
        <ChatContainer 
          chatId={activeChatId} 
          userId={user.id.toString()} 
        />
      </ThemedView>
    );
  }
  
  // Fallback view
  return (
    <ThemedView style={styles.container}>
      <ThemedText>Loading...</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: '#ef4444',
    marginVertical: 10,
  },
  chatItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 10,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
  },
  chatHeader: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});