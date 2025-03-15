'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import styles from '@/styles/Table.module.css';
import api from '@/lib/api';
import Nav from '@/components/Nav';
import navStyles from '@/styles/Nav.module.css';

interface Ticket {
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
}

// Ticket-related API methods
const ticketApi = {
  getTickets: () => api.get('/api/tickets'),
  getTicketById: (id: number) => api.get(`/api/tickets/${id}`),
  updateTicketStatus: (id: number, status: string) => 
    api.put(`/api/tickets/${id}/status`, { status }),
  deleteTicket: (id: number) => api.delete(`/api/tickets/${id}`),
  addTicketMessage: (id: number, content: string) => 
    api.post(`/api/tickets/${id}/messages`, { content }),
};

// Add this helper function at the top level
const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketApi.getTickets();
      console.log('Tickets response:', response.data);
      if (response.data.success) {
        setTickets(response.data.data);
      } else {
        setError('Failed to fetch tickets: ' + response.data.message);
      }
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      setError(err.response?.data?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return styles.badgePending;
      case 'IN_PROGRESS':
        return styles.badgeProcessing;
      case 'RESOLVED':
        return styles.badgeCompleted;
      case 'CLOSED':
        return styles.badgeFailed;
      default:
        return '';
    }
  };

  const handleStatusUpdate = async (ticketId: number, newStatus: string) => {
    try {
      const response = await ticketApi.updateTicketStatus(ticketId, newStatus);
      if (response.data.success) {
        await fetchTickets(); // Refresh the list
      } else {
        setError('Failed to update status: ' + response.data.message);
      }
    } catch (err: any) {
      console.error('Error updating ticket status:', err);
      setError(err.response?.data?.message || 'Failed to update ticket status');
    }
  };

  const handleDelete = async (ticketId: number) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        const response = await ticketApi.deleteTicket(ticketId);
        if (response.data.success) {
          await fetchTickets(); // Refresh the list
        } else {
          setError('Failed to delete ticket: ' + response.data.message);
        }
      } catch (err: any) {
        console.error('Error deleting ticket:', err);
        setError(err.response?.data?.message || 'Failed to delete ticket');
      }
    }
  };

  if (loading) return (
    <>
      <Nav />
      <div className={styles.loading}>Loading tickets...</div>
    </>
  );
  
  if (error) return (
    <>
      <Nav />
      <div className={styles.error}>{error}</div>
    </>
  );

  return (
    <div className={navStyles.layout}>
        <Nav />
        <div className={navStyles.mainContent}>
            <div className={styles.container}>
                <h1>Support Tickets</h1>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>ID</th>
                                <th className={styles.th}>Title</th>
                                <th className={styles.th}>Description</th>
                                <th className={styles.th}>User</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th}>Created</th>
                                <th className={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket) => (
                                <tr key={ticket.id} className={styles.tr}>
                                    <td className={styles.td}>{ticket.id}</td>
                                    <td className={styles.td}>{ticket.title}</td>
                                    <td className={styles.td} title={ticket.description}>
                                        {truncateText(ticket.description)}
                                    </td>
                                    <td className={styles.td}>
                                        <div>
                                            <div>{ticket.user.name}</div>
                                            <div className={styles.emailText}>{ticket.user.email}</div>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={`${styles.badge} ${getStatusBadgeClass(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.buttonContainer}>
                                            <select
                                                value={ticket.status}
                                                onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                                                className={styles.filterSelect}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="RESOLVED">Resolved</option>
                                                <option value="CLOSED">Closed</option>
                                            </select>
                                            <button
                                                onClick={() => handleDelete(ticket.id)}
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
}