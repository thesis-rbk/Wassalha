import { User } from './User';
import { Chat } from './Chat';

export interface Message {
    id: number;
    chatId: number;
    chat: Chat;
    senderId: number;
    sender: User;
    type: string;
    content?: string;
    mediaId?: number;
    isRead: boolean;
}
