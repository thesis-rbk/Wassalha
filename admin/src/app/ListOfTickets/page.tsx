'use client'
import React, { useState, useEffect } from 'react';
import styles from '@/styles/Table.module.css';
import api from '@/lib/api';
import { format } from 'date-fns';

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
  messages?: {
    id: number;
    content: string;
    createdAt: string;
    sender: {
      id: number;
      name: string;
    };
  }[];
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/api/tickets', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.data.success) {
        setTickets(response.data.data);
      } else {
        setError('Failed to fetch tickets');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to fetch tickets');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId: number, newStatus: string) => {
    try {
      const response = await api.put(`/api/tickets/${ticketId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      
      if (response.data.success) {
        fetchTickets(); // Refresh the list
      } else {
        setError('Failed to update ticket status');
      }
    } catch (err) {
      console.error('Error updating ticket status:', err);
      setError('Failed to update ticket status');
    }
  };

  const handleDelete = async (ticketId: number) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        const response = await api.delete(`/api/tickets/${ticketId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (response.data.success) {
          fetchTickets(); // Refresh the list
        } else {
          setError('Failed to delete ticket');
        }
      } catch (err) {
        console.error('Error deleting ticket:', err);
        setError('Failed to delete ticket');
      }
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

  if (loading) return <div className={styles.loading}>Loading tickets...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
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
                <td className={styles.td}>
                  {ticket.description.length > 100 
                    ? `${ticket.description.substring(0, 100)}...` 
                    : ticket.description}
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
                      className={styles.statusSelect}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      className={styles.deleteButton}
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
  );
}