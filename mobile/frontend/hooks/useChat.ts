import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  setChats, 
  setActiveChat, 
  clearActiveChat, 
  setMessages, 
  addMessage,
  setMessageRead,
  setLoading,
  setError
} from '@/store/chatSlice';
import { getSocket } from '@/services/socketService';
import { BACKEND_URL } from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Socket } from 'socket.io-client';
import { Message } from '@/types/Message';
import axiosInstance from '@/config';

/**
 * Custom hook for chat functionality
 * @param chatId - Optional ID of the active chat
 * @param userId - Optional ID of the current user
 * @returns Chat state and functions for interacting with chats
 */
export function useChat(chatId?: number, userId?: string) {
  // Access Redux dispatch function to update state
  const dispatch = useDispatch();
  
  // Get current chat state from Redux store
  const { chats, activeChat, messages, loading, error } = useSelector(
    (state: RootState) => state.chat
  );
  
  // Local state for typing indicators
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Get socket connection for chat namespace
  const [socket, setSocket] = useState<Socket | null>(null);
  
  useEffect(() => {
    if (userId) {
      getSocket('chat').then(socket => {
        if (socket) setSocket(socket);
      });
    }
  }, [userId]);
  
  // Socket connection & event listeners
  useEffect(() => {
    // Skip if required data is missing
    if (!chatId || !userId || !socket) return;
    
    console.log(`🔌 Joining chat ${chatId}...`);
    
    // Join the chat room on the server
    socket.emit('join_chat', chatId.toString());
    
    // Handle incoming messages from other users
    const handleNewMessage = (message: any) => {
      console.log('📥 New message received:', message);
      
      // Ensure message has chatId property for frontend use
      const enhancedMessage: Message = {
        ...message,
        chatId: message.chatId || message.chat?.id,
      };
      
      // Add the message to Redux state
      dispatch(addMessage(enhancedMessage));
    };
    
    // Handle when another user reads your message
    const handleMessageRead = (data: {messageId: number, chatId: number}) => {
      console.log('👀 Message marked as read:', data);
      // Update read status in Redux
      dispatch(setMessageRead(data));
    };
    
    // Handle typing indicators from other users
    const handleTyping = (data: {chatId: number, userId: number}) => {
      // Only show indicator if it's from the other user in this chat
      if (data.chatId === chatId && data.userId.toString() !== userId) {
        setIsTyping(true);
        
        // Clear any existing timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }
        
        // Automatically hide the indicator after 3 seconds
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
        
        setTypingTimeout(timeout as any);
      }
    };
    
    // Register event listeners
    socket.on('receive_message', handleNewMessage);
    socket.on('message_read', handleMessageRead);
    socket.on('user_typing', handleTyping);
    
    // Clean up listeners when component unmounts or chatId/userId changes
    return () => {
      // Remove all event listeners
      socket.off('receive_message', handleNewMessage);
      socket.off('message_read', handleMessageRead);
      socket.off('user_typing', handleTyping);
      
      // Clear any pending timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [chatId, userId, socket, dispatch, typingTimeout]);
  
  useEffect(() => {
    if (chatId) {
      fetchChatDetails(chatId);
      fetchChatMessages(chatId);
    }
  }, [chatId]);
  
  // API Functions
  
  /**
   * Fetches all chats for the current user
   */
  const fetchUserChats = useCallback(async () => {
    if (!userId) return;
    
    // Show loading state
    dispatch(setLoading(true));
    
    try {
      // Get authentication token
      const token = await AsyncStorage.getItem('jwtToken');
      
      // Use axiosInstance instead of fetch
      const response = await axiosInstance.get('/api/chats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update Redux store with chat list
      if (Array.isArray(response.data)) {
        // Add chatId property for frontend convenience
        const enhancedChats = response.data.map(chat => ({
          ...chat,
          // If lastMessage exists, ensure it has chatId
          ...(chat.lastMessage && {
            lastMessage: {
              ...chat.lastMessage,
              chatId: chat.lastMessage.chatId || chat.id,
            }
          })
        }));
        dispatch(setChats(enhancedChats));
      } else {
        console.warn('API response is not an array:', response.data);
        dispatch(setChats([]));
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      dispatch(setError((error as Error).message));
      dispatch(setChats([]));
    } finally {
      // Hide loading state
      dispatch(setLoading(false));
    }
  }, [userId, dispatch]);
  
  /**
   * Fetches details for a specific chat
   * @param chatId - ID of the chat to fetch
   */
  const fetchChatDetails = useCallback(async (chatId: number) => {
    if (!chatId) return;
    
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await axiosInstance.get(`/api/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Set as active chat in Redux
      dispatch(setActiveChat(response.data));
    } catch (error) {
      console.error('Error fetching chat details:', error);
      dispatch(setError((error as Error).message));
    }
  }, [dispatch]);
  
  /**
   * Fetches messages for a specific chat with pagination
   * @param chatId - ID of the chat
   * @param page - Page number for pagination
   * @param limit - Number of messages per page
   */
  const fetchChatMessages = useCallback(async (chatId: number, page = 1, limit = 20) => {
    if (!chatId) return;
    
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await axiosInstance.get(`/api/chats/${chatId}/messages?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Store messages in Redux by chat ID
      if (response.data && response.data.data) {
        // Add chatId to each message for frontend use
        const enhancedMessages = response.data.data.map((message: any) => ({
          ...message,
          chatId: message.chatId || chatId,
        }));
        
        dispatch(setMessages({ chatId, messages: enhancedMessages }));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      dispatch(setError((error as Error).message));
    }
  }, [dispatch]);
  
  /**
   * Sends a message in the current chat
   * @param content - Message content
   * @param type - Message type (default: 'text')
   * @returns true if successful, false otherwise
   */
  const sendMessage = useCallback((content: string, type = 'text') => {
    // Verify we have all required data
    if (!chatId || !userId || !socket || !activeChat) {
      console.error('❌ Cannot send message - missing required data:', { 
        chatId, 
        userId, 
        socketConnected: !!socket, 
        activeChatExists: !!activeChat 
      });
      return false;
    }
    
    // Determine recipient based on who's sending the message
    const receiverId = activeChat.requesterId.toString() === userId
      ? activeChat.providerId
      : activeChat.requesterId;
    
    // Prepare message data
    const messageData = {
      chatId,
      senderId: parseInt(userId),
      receiverId,
      content,
      type
    };
    
    // Send message via socket
    socket.emit('send_message', messageData);
    
    // Add a simple message object to Redux so it shows immediately
    const clientMessage: Message = {
      id: Date.now(), // Simple temporary ID
      chatId: chatId,
      chat: { id: chatId } as any, // Simplified chat object
      senderId: parseInt(userId),
      receiverId: receiverId,
      sender: { id: parseInt(userId) } as any, // Simplified sender
      content: content,
      type: type,
      isRead: false,
      time: new Date().toISOString(),
      isSender: true,
      text: content
    };
    
    dispatch(addMessage(clientMessage));
    
    return true;
  }, [chatId, userId, socket, activeChat, dispatch]);
  
  /**
   * Marks a message as read
   * @param messageId - ID of the message to mark as read
   */
  const markMessageAsRead = useCallback((messageId: number) => {
    if (!chatId || !socket) return;
    
    socket.emit('mark_read', { messageId, chatId });
  }, [chatId, socket]);
  
  /**
   * Sends a typing indicator to other users
   * Called when user is typing a message
   */
  const sendTypingIndicator = useCallback(() => {
    if (!chatId || !userId || !socket) return;
    
    socket.emit('typing', { chatId, userId: parseInt(userId) });
  }, [chatId, userId, socket]);
  
  // Return all state and functions needed for chat functionality
  return {
    chats,                  // List of all user's chats
    activeChat,             // Currently selected chat
    messages: chatId && messages[chatId] ? messages[chatId] : [], // Messages for active chat
    loading,                // Loading state
    error,                  // Error state
    isTyping,               // If other user is typing
    fetchUserChats,         // Function to get all chats
    fetchChatDetails,       // Function to get a specific chat
    fetchChatMessages,      // Function to get messages
    sendMessage,            // Function to send a message
    markMessageAsRead,      // Function to mark message as read
    sendTypingIndicator     // Function to send typing indicator
  };
}