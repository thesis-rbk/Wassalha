import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import axiosInstance from '@/config';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Send } from 'lucide-react-native';
import { Ticket } from '@/types/Ticket';
import { TicketMessage } from '@/types/TicketMessage';
import { useStatus } from '@/context/StatusContext';

import Header from '@/components/navigation/headers';
export default function TicketDetailsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { show, hide } = useStatus();

  useEffect(() => {
    if (id) {
      fetchTicketDetails();
      fetchTicketMessages();
    }
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await axiosInstance.get(`/api/tickets/get/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTicket(response.data.data);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      show({
        type: "error",
        title: "Error",
        message: "Failed to load ticket details.",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
    }
  };

  const fetchTicketMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await axiosInstance.get(`/api/tickets/${id}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error fetching ticket messages:', error);
      show({
        type: "error",
        title: "Error",
        message: "Failed to load ticket messages.",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitMessage = async () => {
    if (!newMessage.trim()) {
      show({
        type: "error",
        title: "Error",
        message: "Message cannot be empty",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await axiosInstance.post(
        `/api/tickets/${id}/messages`,
        { content: newMessage, mediaIds: [] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newMsg = response.data.data;
      setMessages((prevMessages) => [...prevMessages, newMsg]);
      setNewMessage('');
      show({
        type: "success",
        title: "Success",
        message: "Message sent successfully",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
    } catch (error) {
      console.error('Error submitting message:', error);
      show({
        type: "error",
        title: "Error",
        message: "Failed to send message. Please try again.",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMessage = ({ item }: { item: TicketMessage }) => (
    <View style={styles.commentContainer}>
      <ThemedText style={styles.commentAuthor}>
        {item.isAdmin ? 'Admin' : item.sender.name}
      </ThemedText>
      <ThemedText style={styles.commentContent}>{item.content}</ThemedText>
      <ThemedText style={styles.commentTimestamp}>
        {new Date(item.createdAt).toLocaleString()}
      </ThemedText>
      {item.media.length > 0 && (
        <View style={styles.mediaContainer}>
          {item.media.map((media) => (
            <ThemedText key={media.id} style={styles.mediaLink}>
              {media.url}
            </ThemedText>
          ))}
        </View>
      )}
    </View>
  );

  if (isLoading || !ticket) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Ticket Details' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header title='Ticket Details' subtitle='View and respond to ticket messages' showBackButton={true} />
      <Stack.Screen options={{ title: `Ticket #${ticket.id}` }} />
      <FlatList
        ListHeaderComponent={
          <View style={styles.ticketHeader}>
            <ThemedText style={styles.ticketTitle}>{ticket.title}</ThemedText>
            <ThemedText style={styles.ticketDescription}>{ticket.description}</ThemedText>
            <ThemedText style={styles.ticketInfo}>
              Category: {ticket.category.replace(/_/g, ' ')}
            </ThemedText>
            <ThemedText style={[styles.ticketInfo, { color: getStatusColor(ticket.status) }]}>
              Status: {ticket.status}
            </ThemedText>
            <ThemedText style={styles.ticketInfo}>
              Created: {new Date(ticket.createdAt).toLocaleDateString()}
            </ThemedText>
          </View>
        }
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messageList}
        ListFooterComponent={
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Add a comment..."
              placeholderTextColor="#666"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              editable={!isSubmitting}
            />
            <TouchableOpacity
              style={[styles.sendButton, isSubmitting && styles.sendButtonDisabled]}
              onPress={handleSubmitMessage}
              disabled={isSubmitting || !newMessage.trim()}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Send size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        }
      />
    </ThemedView>
  );
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return '#FFA500';
    case 'IN_PROGRESS':
      return '#1E90FF';
    case 'RESOLVED':
      return '#32CD32';
    case 'CLOSED':
      return '#808080';
    default:
      return '#000000';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  ticketTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 8,
  },
  ticketDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  ticketInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.light.primary + '20',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  messageList: {
    padding: 16,
    paddingBottom: 80,
  },
  commentContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  mediaContainer: {
    marginTop: 8,
  },
  mediaLink: {
    fontSize: 14,
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});