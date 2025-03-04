import { Chat, Goods, Message, User } from "@/types";

// Mock Users
const user1: User = { id: 1, name: "John Doe", email: "john@example.com" };
const user2: User = { id: 2, name: "Jane Smith", email: "jane@example.com" };
const user3: User = {
  id: 3,
  name: "Michael Johnson",
  email: "michael@example.com",
};

export const mockUsers: User[] = [user1, user2, user3];

// Mock Goods (You can adjust these according to your actual goods)
const goods1: Goods = {
  id: 101,
  name: "Jewelry Collection",
  price: 1500,
  categoryId: 1,
  size: "Medium",
  weight: 0.5,
  description: "A beautiful collection of handcrafted jewelry.",
  imageId: 1,
};

const goods2: Goods = {
  id: 102,
  name: "MacBook Pro",
  price: 2000,
  categoryId: 2,
  size: "15 inches",
  weight: 1.8,
  description: "Latest model of MacBook Pro with M1 chip.",
  imageId: 2,
};

// Mock Messages
const message1: Message = {
  id: 1,
  chat: null as unknown as Chat, // This will be set later
  receiverId: 2,
  senderId: 1,
  sender: user1,
  type: "text",
  content:
    "Hi, I'm interested in delivering your jewelry collection. When do you need it delivered by?",
  isRead: true,
  text: "Hi, I'm interested in delivering your jewelry collection. When do you need it delivered by?",
  time: "2025-05-09T15:30:00Z",
  isSender: true,
};

const message2: Message = {
  id: 2,
  chat: null as unknown as Chat, // This will be set later
  receiverId: 1,
  senderId: 2,
  sender: user2,
  type: "text",
  content:
    "Hello! I need it delivered by May 20th at the latest. Is that possible for you?",
  isRead: true,
  text: "Hello! I need it delivered by May 20th at the latest. Is that possible for you?",
  time: "2025-05-09T15:45:00Z",
  isSender: false,
};

// Mock Chats
const chat1: Chat = {
  id: 1,
  requesterId: 1,
  requester: user1,
  providerId: 2,
  provider: user2,
  productId: 101,
  goods: goods1,
  messages: [message1, message2], // Linking messages
};

// Update messages with the correct chat reference
message1.chat = chat1;
message2.chat = chat1;

// Mock Chat 2
const message3: Message = {
  id: 3,
  chat: null as unknown as Chat, // This will be set later
  receiverId: 3,
  senderId: 1,
  sender: user1,
  type: "text",
  content:
    "Yes, that works perfectly. I'll be in Chicago on the 18th. Would you prefer morning or afternoon for the delivery?",
  isRead: false,
  text: "Yes, that works perfectly. I'll be in Chicago on the 18th. Would you prefer morning or afternoon for the delivery?",
  time: "2025-05-09T16:00:00Z",
  isSender: true,
};

const chat2: Chat = {
  id: 2,
  requesterId: 1,
  requester: user1,
  providerId: 3,
  provider: user3,
  productId: 102,
  goods: goods2,
  messages: [message3], // Linking the message
};

// Update message3 with the correct chat reference
message3.chat = chat2;

// Final mock data export
export const mockChats: Chat[] = [chat1, chat2];
export const mockMessages: Message[] = [message1, message2, message3];
