import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import styles from '@/styles/Table.module.css';
import api from '@/lib/api';
import { X, Send, Trash2 } from 'lucide-react';
import { Ticket } from '@/types/Ticket';
import { Message } from '@/types/Message';



interface TicketDetailsProps {
  ticket: Ticket;
  onClose: () => void;
  visible: boolean;
  onStatusUpdate: (ticketId: number, newStatus: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') => void;
  onDelete: (ticketId: number) => void;
}

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

const TicketDetails: React.FC<TicketDetailsProps> = ({ 
  ticket, 
  onClose, 
  visible, 
  onStatusUpdate, 
  onDelete 
}) => {
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled
    const isDark = document.documentElement.classList.contains('dark-mode');
    setIsDarkMode(isDark);

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark-mode');
          setIsDarkMode(isDark);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!visible || !ticket) return null;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      onDelete(ticket.id);
      onClose();
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    onStatusUpdate(ticket.id, newStatus);
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;
    
    try {
      setSending(true);
      setError('');
      
      const response = await api.post(`/api/tickets/${ticket.id}/messages/admin`, { 
        content: messageContent 
      });
      
      if (response.data.success) {
        // Clear the input after successful send
        setMessageContent('');
        // Refresh the ticket to show the new message
        const ticketResponse = await api.get(`/api/tickets/${ticket.id}`);
        if (ticketResponse.data.success) {
          // Update the ticket with the new message
          ticket.messages = ticketResponse.data.data.messages;
        }
      } else {
        setError('Failed to send message: ' + response.data.message);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modal} ${isDarkMode ? styles.darkMode : ''}`}>
        <div className={`${styles.modalHeader} ${isDarkMode ? styles.darkMode : ''}`}>
          <h2>Ticket Details</h2>
          <button 
            className={`${styles.closeModalButton} ${isDarkMode ? styles.darkMode : ''}`}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className={`${styles.modalBody} ${isDarkMode ? styles.darkMode : ''}`}>
          <div className={styles.modalSection}>
            <h3>User Information</h3>
            <div className={`${styles.infoCard} ${isDarkMode ? styles.darkMode : ''}`}>
              <p><strong>Name:</strong> {ticket.user.name}</p>
              <p><strong>Email:</strong> <a href={`mailto:${ticket.user.email}`} className={styles.emailLink}>{ticket.user.email}</a></p>
            </div>
          </div>
          <div className={styles.modalSection}>
            <h3>Ticket Information</h3>
            <div className={`${styles.infoCard} ${isDarkMode ? styles.darkMode : ''}`}>
              <div className={styles.ticketInfoGrid}>
                <div>
                  <p><strong>ID:</strong> #{ticket.id}</p>
                  <p><strong>Title:</strong> {ticket.title}</p>
                </div>
                <div>
                  <p>
                    <strong>Status:</strong> 
                    <span className={`${styles.badge} ${getStatusBadgeClass(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </p>
                  <p><strong>Created:</strong> {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.modalSection}>
            <h3>Description</h3>
            <div className={`${styles.descriptionBox} ${isDarkMode ? styles.darkMode : ''}`}>
              {ticket.description}
            </div>
          </div>
          
          {/* Messages Section */}
          <div className={styles.modalSection}>
            <h3>Messages</h3>
            <div className={`${styles.messagesContainer} ${isDarkMode ? styles.darkMode : ''}`}>
              {ticket.messages && ticket.messages.length > 0 ? (
                ticket.messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`${styles.messageItem} ${message.sender.role === 'ADMIN' ? styles.adminMessage : styles.userMessage} ${isDarkMode ? styles.darkMode : ''}`}
                  >
                    <div className={styles.messageSender}>
                      <strong>{message.sender.name}</strong>
                      <span className={styles.messageTime}>
                        {format(new Date(message.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <div className={styles.messageContent}>
                      {message.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className={`${styles.noMessages} ${isDarkMode ? styles.darkMode : ''}`}>
                  No messages yet.
                </div>
              )}
            </div>
          </div>
          
          {/* Add space for the fixed footer */}
          <div className={styles.modalFooterSpacer}></div>
        </div>
        
        {/* Fixed footer with actions */}
        <div className={`${styles.modalFooterFixed} ${isDarkMode ? styles.darkMode : ''}`}>
          <div className={styles.modalFooterRow}>
          <button
              className={`${styles.deleteModalButton} ${isDarkMode ? styles.darkMode : ''}`}
              onClick={handleDelete}
            >
              <Trash2 size={16} />
              Delete
            </button>
            <div className={styles.statusUpdateContainer}>
              <label htmlFor="statusSelect" className={styles.statusLabel}>Status:</label>
              <select
                id="statusSelect"
                value={ticket.status}
                onChange={handleStatusChange}
                className={`${styles.modalSelect} ${isDarkMode ? styles.darkMode : ''}`}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            
            <div className={styles.messageInputContainer}>
              <input
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type a message to the user..."
                className={`${styles.messageInput} ${isDarkMode ? styles.darkMode : ''}`}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                className={`${styles.sendMessageButton} ${isDarkMode ? styles.darkMode : ''}`}
                onClick={handleSendMessage}
                disabled={sending || !messageContent.trim()}
              >
                {sending ? (
                  <span className={styles.loadingSpinner}></span>
                ) : (
                  <>
                    <Send size={16} />
                    Send
                  </>
                )}
              </button>
            </div>
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
