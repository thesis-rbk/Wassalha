export interface Message {
    id: number;
    content: string;
    createdAt: string;
    sender: {
      id: number;
      name: string;
      role: string;
    };
  }