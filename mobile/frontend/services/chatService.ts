import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@/config';
import { Chat } from '@/types/Chat';
import { store } from '@/store';
import { addChat } from '@/store/chatSlice';
import { getSocket } from '@/services/socketService';

/**
 * Create a chat between two users
 * @param requesterId - ID of the requester (buyer)
 * @param providerId - ID of the provider (seller)
 * @param productId - ID of the product/goods
 * @returns The created chat object or null if creation failed
 */
export const createChat = async (
  requesterId: number, 
  providerId: number, 
  productId: number
): Promise<Chat | null> => {
  try {
    // Get auth token
    const token = await AsyncStorage.getItem('jwtToken');
    
    if (!token) {
      console.error('❌ No authentication token available');
      return null;
    }
    
    // Make request to API
    const response = await fetch(`${BACKEND_URL}/api/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        requesterId, 
        providerId, 
        productId 
      })
    });
    
    // Handle error response
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Failed to create chat:', errorData);
      return null;
    }
    
    // Parse response data
    const chat: Chat = await response.json();
    
    // Add to Redux store
    store.dispatch(addChat(chat));
    
    console.log('✅ Chat created successfully:', chat.id);
    return chat;
  } catch (error) {
    console.error('❌ Error creating chat:', error);
    return null;
  }
};

/**
 * Navigate to a chat after payment
 * This creates the chat if needed and then navigates to it
 * @param requesterId - ID of the requester (buyer)
 * @param providerId - ID of the provider (seller)
 * @param productId - ID of the product/goods
 * @param router - The Expo router for navigation
 */
export const initiateChatAfterPayment = async (
  requesterId: number,
  providerId: number,
  productId: number,
  router: any
) => {
  try {
    console.log('🔄 Initiating chat after payment...');
    
    // Create or find existing chat
    const chat = await createChat(requesterId, providerId, productId);
    
    if (!chat) {
      console.error('❌ Failed to create chat after payment');
      return false;
    }
    
    // Navigate to chat screen with the chat ID
    router.push({
      pathname: '/messages/chat',
      params: { 
        chatId: chat.id 
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error initiating chat after payment:', error);
    return false;
  }
};

/**
 * Send a message in a chat
 * @param chatId - ID of the chat
 * @param content - Message content
 * @param type - Message type (default: 'text')
 * @returns The sent message or null if sending failed
 */
export const sendMessage = async (
  chatId: number,
  content: string,
  type: string = 'text'
): Promise<any | null> => {
  try {
    const token = await AsyncStorage.getItem('jwtToken');
    
    if (!token) {
      console.error('❌ No authentication token available');
      return null;
    }
    
    const response = await fetch(`${BACKEND_URL}/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content, type })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Failed to send message:', errorData);
      return null;
    }
    
    const message = await response.json();
    return message;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    return null;
  }
};

/**
 * Navigate to a chat from the pickup screen
 * This creates the chat if needed and then navigates to it
 * @param requesterId - ID of the requester (buyer)
 * @param providerId - ID of the provider (seller)
 * @param productId - ID of the product/goods
 * @param orderInfo - Optional order info to display in chat
 * @param router - The Expo router for navigation
 */
export const navigateToChat = async (
  requesterId: number,
  providerId: number,
  productId: number,
  router: any,
  orderInfo?: {
    orderId: number,
    goodsName: string
  },
 
) => {
  try {
    console.log('🔄 Opening chat from pickup screen...');
    
    // Create or find existing chat
    const chat = await createChat(requesterId, providerId, productId);
    
    if (!chat) {
      console.error('❌ Failed to create chat');
      return false;
    }
    
    // Navigate to chat screen with the chat ID and order info
    router.push({
      pathname: '/messages/chat',
      params: { 
        chatId: chat.id,
        orderId: orderInfo?.orderId,
        goodsName: orderInfo?.goodsName,
        context: 'pickup' // Tells the chat screen this is about pickup
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error navigating to chat:', error);
    return false;
  }
};