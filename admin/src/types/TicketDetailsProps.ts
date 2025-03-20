import { Ticket } from "./Ticket";

export interface TicketDetailsProps {
    ticket: Ticket;
    onClose: () => void;
    visible: boolean;
    onStatusUpdate: (ticketId: number, newStatus: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') => void;
    onDelete: (ticketId: number) => void;
  }