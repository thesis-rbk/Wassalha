import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, Message } from '@/types';

// We'll extend the existing types for Redux-specific needs
interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Record<number, Message[]>;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  activeChat: null,
  messages: {},
  loading: false,
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    setActiveChat: (state, action: PayloadAction<Chat>) => {
      state.activeChat = action.payload;
    },
    clearActiveChat: (state) => {
      state.activeChat = null;
    },
    setMessages: (state, action: PayloadAction<{chatId: number, messages: Message[]}>) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      // Get the chatId directly from the message, with fallback to chat.id if needed
      const chatId = action.payload.chatId || 
                    (action.payload.chat ? action.payload.chat.id : null);
      
      // Safety check - skip if no chatId found
      if (!chatId) {
        console.error('Cannot add message - no chatId found:', action.payload);
        return;
      }
      
      // Add to messages list for this chat
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      
      // CHECK IF MESSAGE ALREADY EXISTS by ID
      const messageExists = state.messages[chatId].some(
        msg => msg.id === action.payload.id
      );
      
      // Only add if it doesn't exist already
      if (!messageExists) {
        state.messages[chatId].unshift(action.payload);
        
        // Update active chat if this message belongs to it
        if (state.activeChat?.id === chatId) {
          if (!state.activeChat.messages) {
            state.activeChat.messages = [];
          }
          state.activeChat.messages.unshift(action.payload);
        }
      } else {
        // If it exists, update it (e.g., mark as read if needed)
        const index = state.messages[chatId].findIndex(
          msg => msg.id === action.payload.id
        );
        if (index >= 0) {
          state.messages[chatId][index] = {
            ...state.messages[chatId][index],
            ...action.payload
          };
          
          // Also update in active chat if needed
          if (state.activeChat?.id === chatId && state.activeChat.messages) {
            const activeIndex = state.activeChat.messages.findIndex(
              msg => msg.id === action.payload.id
            );
            if (activeIndex >= 0) {
              state.activeChat.messages[activeIndex] = {
                ...state.activeChat.messages[activeIndex],
                ...action.payload
              };
            }
          }
        }
      }
    },
    setMessageRead: (state, action: PayloadAction<{chatId: number, messageId: number | string}>) => {
      const { chatId, messageId } = action.payload;
      
      // Update in messages list
      if (state.messages[chatId]) {
        const messageIndex = state.messages[chatId].findIndex(msg => msg.id === messageId);
        if (messageIndex >= 0) {
          state.messages[chatId][messageIndex].isRead = true;
        }
      }
      
      // Update in active chat if needed
      if (state.activeChat?.id === chatId && state.activeChat.messages) {
        const activeMessageIndex = state.activeChat.messages.findIndex(msg => msg.id === messageId);
        if (activeMessageIndex >= 0) {
          state.activeChat.messages[activeMessageIndex].isRead = true;
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { 
  setChats, 
  setActiveChat, 
  clearActiveChat, 
  setMessages, 
  addMessage, 
  setMessageRead,
  setLoading,
  setError
} = chatSlice.actions;
export default chatSlice.reducer;