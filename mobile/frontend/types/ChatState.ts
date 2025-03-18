import { Chat } from './Chat';
import { Message } from './Message';

/**
 * Chat state interface for Redux store
 * Defines the shape of the chat slice in Redux
 */
export interface ChatState {
  /**
   * List of all chats the user has
   */
  chats: Chat[];
  
  /**
   * Currently active/selected chat
   */
  activeChat: Chat | null;
  
  /**
   * Messages organized by chat ID
   * Object where keys are chat IDs and values are arrays of messages
   */
  messages: { [chatId: number]: Message[] };
  
  /**
   * Loading state for API operations
   */
  loading: boolean;
  
  /**
   * Error message if any operation fails
   */
  error: string | null;
}
