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
      const chatId = typeof action.payload.id === 'number' 
        ? action.payload.chat.id 
        : Number(action.payload.chat.id);
      
      // Add to messages list for this chat
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].unshift(action.payload);
      
      // Update active chat if this message belongs to it
      if (state.activeChat?.id === chatId) {
        if (!state.activeChat.messages) {
          state.activeChat.messages = [];
        }
        state.activeChat.messages.unshift(action.payload);
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