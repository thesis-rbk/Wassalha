import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { Send } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

/**
 * Props for the MessageInput component
 * @property onSend - Callback function when a message is sent
 * @property onTyping - Callback function when user is typing
 * @property disabled - Whether the input is disabled
 */
interface MessageInputProps {
  onSend: (text: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
}

/**
 * MessageInput - Component for typing and sending chat messages
 * 
 * This component provides:
 * - Text input for typing messages
 * - Send button
 * - Typing indicator functionality
 * - Auto-growing input for multiline messages
 */
export default function MessageInput({ onSend, onTyping, disabled = false }: MessageInputProps) {
  // State for the message text
  const [text, setText] = useState('');
  
  // Reference to the input element
  const inputRef = useRef<TextInput>(null);
  
  // Get color scheme for theming
  const colorScheme = useColorScheme() ?? 'light';

  // Track last typing notification time to avoid sending too many
  const lastTypingRef = useRef<number>(0);
  
  /**
   * Handle text changes in the input
   * Also triggers typing indicator with throttling
   */
  const handleChangeText = (value: string) => {
    setText(value);
    
    // Only send typing indicator if callback provided
    if (onTyping) {
      const now = Date.now();
      
      // Throttle typing notifications to max 1 per second
      if (now - lastTypingRef.current > 1000) {
        onTyping();
        lastTypingRef.current = now;
      }
    }
  };
  
  /**
   * Handle sending a message
   * Clears the input after sending
   */
  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
      
      // Focus back on input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  
  /**
   * Focus the input when component mounts
   */
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    );
    
    // Clean up listener
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);
  
  return (
    <View style={styles.container}>
      {/* Text input field */}
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          { backgroundColor: Colors[colorScheme].background }
        ]}
        value={text}
        onChangeText={handleChangeText}
        placeholder="Type a message..."
        placeholderTextColor={Colors[colorScheme].text + '80'} // Semi-transparent
        multiline
        numberOfLines={1}
        maxLength={1000} // Reasonable limit for message length
        editable={!disabled}
      />
      
      {/* Send button */}
      <TouchableOpacity
        style={[
          styles.sendButton,
          {
            backgroundColor: text.trim() && !disabled
              ? Colors[colorScheme].primary
              : Colors[colorScheme].primary + '50' // Semi-transparent when disabled
          }
        ]}
        onPress={handleSend}
        disabled={!text.trim() || disabled}
        activeOpacity={0.7}
      >
        <Send size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb', // Light gray border
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100, // Prevent huge inputs
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
});