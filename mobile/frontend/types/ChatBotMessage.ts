export type ChatBotMessage = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
};

export type ChatBotSession = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatBotMessage[];
};

export type ChatBotState = {
  messages: ChatBotMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
}; 