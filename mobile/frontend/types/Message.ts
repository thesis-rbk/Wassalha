import { User } from "./User";
import { Chat } from "./Chat";

export interface Message {
  id: number | string;
  chat: Chat;
  chatId: number;
  receiverId: number;
  senderId: number;
  sender: User;
  type: string;
  content?: string;
  mediaId?: number;
  isRead: boolean;
  text?: string;
  time: string;
  isSender: boolean;
}
