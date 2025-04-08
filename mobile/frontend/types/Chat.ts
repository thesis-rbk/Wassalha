import { User } from './User';
import { Goods } from './Goods';

export interface Chat {
    id: number;
    requesterId: number;
    requester: User;
    providerId: number;
    provider: User;
    productId: number;
    goods: Goods;
    messages: Message[];
    lastMessage?: Message;
}

export type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
};

export type ChatSession = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
};

export type ChatState = {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
};
