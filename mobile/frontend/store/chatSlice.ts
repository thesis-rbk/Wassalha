import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat } from '@/types/Chat';
import { Message } from '@/types/Message';

// Define the chat state shape
interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: { [chatId: number]: Message[] };
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ChatState = {
  chats: [],
  activeChat: null,
  messages: {},
  loading: false,
  error: null
};

// Create the chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Set all chats
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    
    // Set active chat
    setActiveChat: (state, action: PayloadAction<Chat>) => {
      state.activeChat = action.payload;
    },
    
    // Clear active chat
    clearActiveChat: (state) => {
      state.activeChat = null;
    },
    
    // Add a new chat
    addChat: (state, action: PayloadAction<Chat>) => {
      // Check if chat already exists
      const exists = state.chats.some(chat => chat.id === action.payload.id);
      if (!exists) {
        state.chats.unshift(action.payload); // Add to beginning
      }
    },
    
    // Set messages for a specific chat
    setMessages: (state, action: PayloadAction<{ chatId: number, messages: Message[] }>) => {
      const { chatId, messages } = action.payload;
      state.messages[chatId] = messages;
    },
    
    // Add a new message to a chat
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const chatId = message.chatId;
      
      // Initialize messages array if it doesn't exist
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      
      // Check if message already exists to avoid duplicates
      const messageExists = state.messages[chatId].some(m => m.id === message.id);
      if (!messageExists) {
        state.messages[chatId].unshift(message); // Add to beginning (newer messages first)
      }
      
      // Update chat list with latest message
      const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
      if (chatIndex !== -1) {
        // Move chat to top of list
        const chat = state.chats[chatIndex];
        state.chats.splice(chatIndex, 1);
        state.chats.unshift({
          ...chat,
          lastMessage: message
        });
      }
    },
    
    // Mark a message as read
    setMessageRead: (state, action: PayloadAction<{ messageId: number, chatId: number }>) => {
      const { messageId, chatId } = action.payload;
      
      if (state.messages[chatId]) {
        state.messages[chatId] = state.messages[chatId].map(message => 
          message.id === messageId ? { ...message, isRead: true } : message
        );
      }
    }
  }
});

// Export actions
export const {
  setLoading,
  setError,
  setChats,
  setActiveChat,
  clearActiveChat,
  addChat,
  setMessages,
  addMessage,
  setMessageRead
} = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;