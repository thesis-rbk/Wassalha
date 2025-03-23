export type TicketMessage = {
  id: number;
  content: string;
  sender: { id: number; name: string; email: string };
  isAdmin: boolean;
  createdAt: string;
  media: { id: number; url: string; type: string; mimeType: string }[];
};