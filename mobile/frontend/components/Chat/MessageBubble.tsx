import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

/**
 * Props for the MessageBubble component
 * @property content - The actual message text
 * @property time - Timestamp when message was sent
 * @property isRead - Whether the message has been read by recipient
 * @property isSender - Whether current user is the sender (affects styling)
 */
interface MessageBubbleProps {
  content: string;
  time: string;
  isRead: boolean;
  isSender: boolean;
}

/**
 * MessageBubble - Displays a single chat message
 * 
 * This component renders an individual message in the chat UI with:
 * - Different styling for sent vs received messages
 * - Timestamp information
 * - Read receipts for sent messages
 * 
 * Used inside a chat message list to display all conversation messages.
 */
export default function MessageBubble({ content, time, isRead, isSender }: MessageBubbleProps) {
  // Get the current color scheme (light/dark)
  const colorScheme = useColorScheme() ?? 'light';
  
  /**
   * Formats timestamp into a readable time
   * Converts ISO string to hours:minutes format
   */
  const formatTime = (timestamp: string) => {
    if (!timestamp) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <View style={[
      styles.container,
      // Position sender messages on right, receiver on left
      isSender ? styles.senderContainer : styles.receiverContainer
    ]}>
      {/* Message content */}
      <ThemedText style={[
        styles.messageText,
        // Different text color for sender vs receiver
        isSender ? styles.senderText : styles.receiverText
      ]}>
        {content}
      </ThemedText>
      
      {/* Time and read status container */}
      <View style={styles.timeContainer}>
        {/* Message timestamp */}
        <ThemedText style={[
          styles.timeText,
          isSender ? styles.senderTimeText : styles.receiverTimeText
        ]}>
          {formatTime(time)}
        </ThemedText>
        
        {/* Read receipts (only shown for sender's messages) */}
        {isSender && (
          <ThemedText style={[
            styles.readStatus,
            // Different style for read vs delivered
            isRead ? styles.readStatusRead : styles.readStatusDelivered
          ]}>
            {isRead ? '✓✓' : '✓'} {/* Double check for read, single for delivered */}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

// Styles for the message bubble
const styles = StyleSheet.create({
  container: {
    maxWidth: '80%', // Limit width to leave space on screen
    borderRadius: 16, // Rounded corners
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  // Sender messages appear on the right with blue background
  senderContainer: {
    alignSelf: 'flex-end', // Right align
    backgroundColor: '#3b82f6', // Blue background
  },
  // Receiver messages appear on the left with gray background
  receiverContainer: {
    alignSelf: 'flex-start', // Left align
    backgroundColor: '#f3f4f6', // Light gray background
  },
  messageText: {
    fontSize: 16,
  },
  // White text for sender (against blue background)
  senderText: {
    color: 'white',
  },
  // Dark text for receiver (against light background)
  receiverText: {
    color: '#1f2937', // Dark gray
  },
  // Container for time and read status
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Right align time and status
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    marginRight: 4,
  },
  // Semi-transparent white for sender's time (on blue background)
  senderTimeText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Gray for receiver's time
  receiverTimeText: {
    color: '#6b7280', // Medium gray
  },
  readStatus: {
    fontSize: 12,
  },
  // Semi-transparent white for delivered status
  readStatusDelivered: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Green for read status
  readStatusRead: {
    color: '#34d399', // Green color
  },
});