'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import styles from '@/styles/Table.module.css';
import api from '@/lib/api';
import Nav from '@/components/Nav';
import navStyles from '@/styles/Nav.module.css';
import TicketDetails from './Ticketsdetails';
import { Ticket } from '@/types/Ticket';
import { Message } from '@/types/Message';




// Ticket-related API methods
const ticketApi = {
  getTickets: () => api.get('/api/tickets'),
  getTicketById: (id: number) => api.get(`/api/tickets/${id}`),
  updateTicketStatus: (id: number, status: string) => 
    api.put(`/api/tickets/${id}/status`, { status }),
  deleteTicket: (id: number) => api.delete(`/api/tickets/${id}`),
  addTicketMessage: (id: number, content: string) => 
    api.post(`/api/tickets/${id}/messages/admin`, { content }),
};

// Add this helper function at the top level
const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Add this function to sort tickets by date
const sortTickets = (ticketsToSort: Ticket[], order: 'asc' | 'desc') => {
  return [...ticketsToSort].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Add state for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Add state for search, sort, and status filter
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [displayedTickets, setDisplayedTickets] = useState<Ticket[]>([]);
  const [currentCount, setCurrentCount] = useState(10);
  const [isShowingAll, setIsShowingAll] = useState(true);

  useEffect(() => {
    // Check for dark mode preference
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModePreference);
    
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketApi.getTickets();
      if (response.data.success) {
        const fetchedTickets = response.data.data;
        setTickets(fetchedTickets);
        
        // Sort tickets by default (newest first)
        const sortedTickets = sortTickets(fetchedTickets, sortOrder);
        setDisplayedTickets(sortedTickets);
        setIsShowingAll(true);
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

  const handleStatusUpdate = async (ticketId: number, newStatus: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') => {
    try {
      const response = await ticketApi.updateTicketStatus(ticketId, newStatus);
      if (response.data.success) {
        // Update the tickets state directly without refetching
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
          )
        );
        
        // Update displayed tickets
        setDisplayedTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
          )
        );
        
        // Update the selected ticket if it's currently being viewed
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(prev => prev ? {...prev, status: newStatus} : null);
        }
      } else {
        setError('Failed to update status: ' + response.data.message);
      }
    } catch (err: any) {
      console.error('Error updating ticket status:', err);
      setError(err.response?.data?.message || 'Failed to update ticket status');
    }
  };

  const handleDelete = async (ticketId: number) => {
    try {
      const response = await ticketApi.deleteTicket(ticketId);
      if (response.data.success) {
        // Update the tickets state directly without refetching
        setTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== ticketId));
        
        // Update displayed tickets
        setDisplayedTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== ticketId));
        
        // Close the modal if the deleted ticket was being viewed
        if (selectedTicket && selectedTicket.id === ticketId) {
          setShowModal(false);
          setSelectedTicket(null);
        }
      } else {
        setError('Failed to delete ticket: ' + response.data.message);
      }
    } catch (err: any) {
      console.error('Error deleting ticket:', err);
      setError(err.response?.data?.message || 'Failed to delete ticket');
    }
  };
  
  // Add function to handle viewing ticket details
  const handleViewTicket = async (ticket: Ticket) => {
    try {
      setLoading(true);
      // Fetch the ticket with messages
      const response = await ticketApi.getTicketById(ticket.id);
      if (response.data.success) {
        setSelectedTicket(response.data.data);
        setShowModal(true);
      } else {
        setError('Failed to fetch ticket details: ' + response.data.message);
      }
    } catch (err: any) {
      console.error('Error fetching ticket details:', err);
      setError(err.response?.data?.message || 'Failed to fetch ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
  };
  
  // Update the filter function to include status filtering
  const filterTickets = (ticketsToFilter: Ticket[], search: string, status: string) => {
    return ticketsToFilter.filter((ticket) => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower) ||
        ticket.user.name.toLowerCase().includes(searchLower) ||
        ticket.user.email.toLowerCase().includes(searchLower) ||
        ticket.status.toLowerCase().includes(searchLower);
      
      // If status filter is ALL, don't filter by status
      const matchesStatus = status === 'ALL' || ticket.status === status;
      
      return matchesSearch && matchesStatus;
    });
  };

  // Update the search handler to include status filtering
  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    const filteredTickets = filterTickets(tickets, searchValue, statusFilter);
    const sortedFilteredTickets = sortTickets(filteredTickets, sortOrder);
    setDisplayedTickets(sortedFilteredTickets);
    setIsShowingAll(true);
  };
  
  // Add a handler for status filter changes
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    const filteredTickets = filterTickets(tickets, searchTerm, status);
    const sortedFilteredTickets = sortTickets(filteredTickets, sortOrder);
    setDisplayedTickets(sortedFilteredTickets);
    setIsShowingAll(true);
  };
  
  // Update the sort handler to include status filtering
  const handleSort = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    const filteredTickets = filterTickets(tickets, searchTerm, statusFilter);
    const sortedTickets = sortTickets(filteredTickets, newOrder);
    setDisplayedTickets(sortedTickets);
  };
  
  // Update the see more functionality to include status filtering
  const handleSeeMore = () => {
    if (isShowingAll) {
      setCurrentCount(10);
      const filteredTickets = filterTickets(tickets, searchTerm, statusFilter);
      const sortedTickets = sortTickets(filteredTickets, sortOrder);
      setDisplayedTickets(sortedTickets.slice(0, 10));
      setIsShowingAll(false);
    } else {
      const nextCount = currentCount + 10;
      const filteredTickets = filterTickets(tickets, searchTerm, statusFilter);
      const sortedTickets = sortTickets(filteredTickets, sortOrder);
      setDisplayedTickets(sortedTickets.slice(0, nextCount));
      setCurrentCount(nextCount);
      setIsShowingAll(nextCount >= filteredTickets.length);
    }
  };

  if (loading) return (
    <div className={`${navStyles.layout} ${isDarkMode ? navStyles.darkMode : ''}`}>
      <Nav />
      <div className={`${navStyles.mainContent} ${isDarkMode ? navStyles.darkMode : ''}`}>
        <div className={styles.loading}>Loading tickets...</div>
      </div>
    </div>
  );

  return (
    <div className={`${navStyles.layout} ${isDarkMode ? navStyles.darkMode : ''}`}>
      <Nav />
      <div className={`${navStyles.mainContent} ${isDarkMode ? navStyles.darkMode : ''}`}>
        <div className={`${styles.container} ${isDarkMode ? styles.darkMode : ''}`}>
          <h1 className={`${styles.title} ${isDarkMode ? styles.darkMode : ''}`}>Support Tickets</h1>
          
          {/* Search and Filter Controls */}
          <div className={styles.controls}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={`${styles.searchInput} ${isDarkMode ? styles.darkMode : ''}`}
              />
            </div>
            <div className={styles.filterContainer}>
              {/* Add status filter dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className={`${styles.filterSelect} ${isDarkMode ? styles.darkMode : ''}`}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
              
              <select
                value={sortOrder}
                onChange={(e) => handleSort()}
                className={`${styles.filterSelect} ${isDarkMode ? styles.darkMode : ''}`}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
          
          {error && <div className={styles.errorAlert}>{error}</div>}
          
          <div className={`${styles.tableWrapper} ${isDarkMode ? styles.darkMode : ''}`}>
            <table className={`${styles.table} ${isDarkMode ? styles.darkMode : ''}`}>
              <thead>
                <tr>
                  <th className={`${styles.th} ${isDarkMode ? styles.darkMode : ''}`}>ID</th>
                  <th className={`${styles.th} ${isDarkMode ? styles.darkMode : ''}`}>Title</th>
                  <th className={`${styles.th} ${isDarkMode ? styles.darkMode : ''}`}>Description</th>
                  <th className={`${styles.th} ${isDarkMode ? styles.darkMode : ''}`}>User</th>
                  <th className={`${styles.th} ${isDarkMode ? styles.darkMode : ''}`}>Status</th>
                  <th className={`${styles.th} ${isDarkMode ? styles.darkMode : ''}`}>Created</th>
                  <th className={`${styles.th} ${isDarkMode ? styles.darkMode : ''}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedTickets.length > 0 ? (
                  displayedTickets.map((ticket) => (
                    <tr key={ticket.id} className={`${styles.tr} ${isDarkMode ? styles.darkMode : ''}`}>
                      <td className={`${styles.td} ${isDarkMode ? styles.darkMode : ''}`}>{ticket.id}</td>
                      <td className={`${styles.td} ${isDarkMode ? styles.darkMode : ''}`}>{ticket.title}</td>
                      <td className={`${styles.td} ${isDarkMode ? styles.darkMode : ''}`} title={ticket.description}>
                        {truncateText(ticket.description)}
                      </td>
                      <td className={`${styles.td} ${isDarkMode ? styles.darkMode : ''}`}>
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>{ticket.user.name}</div>
                          <div className={styles.userEmail}>{ticket.user.email}</div>
                        </div>
                      </td>
                      <td className={`${styles.td} ${isDarkMode ? styles.darkMode : ''}`}>
                        <span className={`${styles.badge} ${getStatusBadgeClass(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`${styles.td} ${isDarkMode ? styles.darkMode : ''}`}>
                        {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className={`${styles.td} ${isDarkMode ? styles.darkMode : ''}`}>
                        <button
                          onClick={() => handleViewTicket(ticket)}
                          className={`${styles.actionButton} ${styles.viewButton} ${isDarkMode ? styles.darkMode : ''}`}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className={styles.noDataCell}>
                      No tickets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {tickets.length > 10 && (
              <div className={styles.seeMoreContainer}>
                <button 
                  className={`${styles.seeMoreButton} ${isDarkMode ? styles.darkMode : ''}`}
                  onClick={handleSeeMore}
                >
                  {isShowingAll ? 'See Less' : 'See More'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Use the TicketDetails component with additional props */}
        {selectedTicket && (
          <TicketDetails 
            ticket={selectedTicket} 
            onClose={handleCloseModal} 
            visible={showModal}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}