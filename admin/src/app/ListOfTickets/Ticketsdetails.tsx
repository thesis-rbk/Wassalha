import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import styles from '@/styles/Table.module.css';
import api from '@/lib/api';
import { X, Send, Trash2 } from 'lucide-react';
import { TicketDetailsProps } from '@/types/TicketDetailsProps';

// Define types matching your backend data
type Ticket = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  user: { id: number; name: string; email: string };
  messages: Message[];
};

type Message = {
  id: number;
  content: string;
  sender: { id: number; name: string; email: string; role?: string };
  isAdmin: boolean;
  createdAt: string;
  media: { id: number; url: string; type: string; mimeType: string }[];
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

const TicketDetails: React.FC<TicketDetailsProps> = ({
  ticket,
  onClose,
  visible,
  onStatusUpdate,
  onDelete,
}) => {
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark-mode');
    setIsDarkMode(isDark);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark-mode');
          setIsDarkMode(isDark);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

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
        content: messageContent,
      });

      if (response.data.success) {
        setMessageContent('');
        const updatedTicketResponse = await api.get(`/api/tickets/get/${ticket.id}`);
        if (updatedTicketResponse.data.success) {
          ticket.messages = updatedTicketResponse.data.data.messages; // Update messages in prop
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

  if (!visible || !ticket) return null;

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
              <p>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${ticket.user.email}`} className={styles.emailLink}>
                  {ticket.user.email}
                </a>
              </p>
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
                    <strong>Status:</strong>{' '}
                    <span className={`${styles.badge} ${getStatusBadgeClass(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </p>
                  <p>
                    <strong>Created:</strong> {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                  </p>
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

          <div className={styles.modalSection}>
            <h3>Comments</h3>
            <div className={`${styles.commentsContainer} ${isDarkMode ? styles.darkMode : ''}`}>
              {ticket.messages && ticket.messages.length > 0 ? (
                ticket.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.commentItem} ${isDarkMode ? styles.darkMode : ''}`}
                  >
                    <div className={styles.commentSender}>
                      <strong>{message.isAdmin ? 'Admin' : message.sender.name}</strong>
                      <span className={styles.commentTime}> : 
                        {message.createdAt
                          ? format(new Date(message.createdAt), 'MMM dd, yyyy HH:mm')
                          : 'Unknown date'}
                      </span>
                    </div>
                    <div className={styles.commentContent}>{message.content}</div>
                  </div>
                ))
              ) : (
                <div className={`${styles.noComments} ${isDarkMode ? styles.darkMode : ''}`}>
                  No comments yet.
                </div>
              )}
            </div>
          </div>

          <div className={styles.modalFooterSpacer}></div>
        </div>

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
              <label htmlFor="statusSelect" className={styles.statusLabel}>
                Status:
              </label>
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
                placeholder="Add a comment..."
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