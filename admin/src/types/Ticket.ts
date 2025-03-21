import { Message } from "./Message";

export interface Ticket {
    id: number;
    title: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    createdAt: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
    senderId: number;
    category: string;
    messages?: Message[];
  }