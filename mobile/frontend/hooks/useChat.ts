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
  // Only creates/gets socket if userId exists
  const [socket, setSocket] = useState<Socket | null>(null);
  
  useEffect(() => {
    if (userId) {
      getSocket('chat').then(socket => {
        setSocket(socket);
      });
    }
  }, [userId]);
  
  // ====== SOCKET CONNECTION & EVENT LISTENERS ======
  useEffect(() => {
    // Skip if required data is missing
    if (!chatId || !userId || !socket) return;
    
    console.log(`🔌 Joining chat ${chatId}...`);
    
    // Join the chat room on the server
    socket.emit('join_chat', chatId.toString());
    
    // ====== DEFINE EVENT HANDLERS ======
    
    // Handle incoming messages from other users
    const handleNewMessage = (message: any) => {
      console.log('📥 New message received:', message);
      // Add the message to Redux state
      dispatch(addMessage(message));
      console.log('After adding message, messages:', getState().chat.messages);
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
        
        setTypingTimeout(timeout);
      }
    };
    
    // ====== REGISTER EVENT LISTENERS ======
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
  }, [chatId, fetchChatDetails, fetchChatMessages]);
  
  // ====== API FUNCTIONS ======
  
  /**
   * Fetches all chats for the current user
   * Used when displaying a list of conversations
   */
  const fetchUserChats = useCallback(async () => {
    if (!userId) return;
    
    // Show loading state
    dispatch(setLoading(true));
    
    try {
      // Get authentication token
      const token = await AsyncStorage.getItem('jwtToken');
      
      // Make API request
      const response = await fetch(`${BACKEND_URL}/api/chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      
      const data = await response.json();
      
      // Update Redux store with chat list
      if (Array.isArray(data)) {
        dispatch(setChats(data));
      } else {
        console.warn('API response is not an array:', data);
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
      const response = await fetch(`${BACKEND_URL}/api/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat details');
      }
      
      const data = await response.json();
      
      // Set as active chat in Redux
      dispatch(setActiveChat(data));
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
      const response = await fetch(`${BACKEND_URL}/api/chats/${chatId}/messages?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Special handling for 304 Not Modified
      if (response.status === 304) {
        console.log(`Chat ${chatId}: Using cached messages (304 Not Modified)`);
        // Don't try to parse JSON, just use what's already in Redux
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      // Store messages in Redux by chat ID
      if (data && data.data) {
        dispatch(setMessages({ chatId, messages: data.data }));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      dispatch(setError((error as Error).message));
    }
  }, [dispatch]);
  
  /**
   * Creates a new chat between users
   * @param requesterId - ID of the user requesting the goods
   * @param providerId - ID of the user providing the goods (traveler)
   * @param productId - ID of the product/goods being discussed
   * @returns The newly created chat or null if failed
   */
  const createChat = useCallback(async (requesterId: number, providerId: number, productId: number) => {
    dispatch(setLoading(true));
    
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`${BACKEND_URL}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requesterId, providerId, productId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create chat');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating chat:', error);
      dispatch(setError((error as Error).message));
      return null;
    } finally {
      dispatch(setLoading(false));
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
    dispatch(addMessage({
      id: Date.now(), // Simple temporary ID
      chatId: chatId,
      senderId: parseInt(userId),
      content: content,
      time: new Date().toISOString(),
      isRead: false,
      chat: { id: chatId }
    }));
    
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
    createChat,             // Function to create a new chat
    sendMessage,            // Function to send a message
    markMessageAsRead,      // Function to mark message as read
    sendTypingIndicator     // Function to send typing indicator
  };
}