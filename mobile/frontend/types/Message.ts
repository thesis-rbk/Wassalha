import { User } from "./User";
import { Chat } from "./Chat";
import { Media } from "./Media";

export interface Message {
  id: number | string;
  chat: Chat;
  chatId: string;
  receiverId: number;
  senderId: number;
  sender: User;
  type: string;
  content?: string;
  mediaId?: number;
  media?: Media;
  isRead: boolean;
  text?: string;
  time: string;
  isSender: boolean;
}
