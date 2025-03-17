import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSocket, connectSocket, cleanupSockets } from '@/services/SocketService';
import { sendSocketNotification } from '@/services/notificationService';
import { NotificationType, NotificationStatus } from '@/types/NotificationProcess';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { 
  setNotifications,
  addNotification,
  markAsRead as markNotificationAsRead
} from '@/store/notificationsSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@/config';
import { Socket } from 'socket.io-client';
import { NotificationContextType } from '@/types/notificationContext';

// Create the context with null initial value
const NotificationContext = createContext<NotificationContextType | null>(null);

// Custom hook to use our notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// The provider component that will wrap our app
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Get user from Redux state
  const { user } = useSelector((state: RootState) => state.auth);

  // Get unread count from Redux state
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const fetchNotifications = useCallback(async () => {
    // Only proceed if we have a user
    if (!user?.id) return;
    
    try {
      console.log('🔄 Fetching notifications from API');
      
      // Get authentication token
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        console.log('⚠️ No token available to fetch notifications');
        return;
      }

      // Make API request
      const response = await fetch(`${BACKEND_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle error responses
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch notifications: ${response.status} ${errorText}`);
      }

      // Parse response data
      const data = await response.json();
      
      // Update Redux store
      if (Array.isArray(data)) {
        console.log(`✅ Fetched ${data.length} notifications`);
        dispatch(setNotifications(data));
      } else {
        console.warn('⚠️ API response is not an array:', data);
        dispatch(setNotifications([]));
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    }
  }, [dispatch, user?.id]); // Only re-create when dispatch or user ID changes
  // 1. SOCKET INITIALIZATION
  // This effect runs when the user changes (login/logout)
  useEffect(() => {
    let mounted = true;
    let notificationSocket: Socket | null = null;
    
    const initializeSocket = async () => {
      if (!user?.id) {
        console.log('👤 No user logged in, skipping notification socket setup');
        return;
      }
      
      try {
        console.log('🔄 Setting up notification socket for user:', user.id);
        
        // Clean up any existing socket first
        if (socket) {
          socket.disconnect();
        }

        // Get new socket instance
        notificationSocket = await getSocket('notifications');
        
        if (mounted) {
          setSocket(notificationSocket);
          
          // Make sure socket is connected and join room
          if (notificationSocket && !notificationSocket.connected) {
            await connectSocket('notifications');
          }

          // Join room after connection is established
          if (notificationSocket.connected) {
            notificationSocket.emit('join', user.id);
          } else {
            notificationSocket.on('connect', () => {
              notificationSocket?.emit('join', user.id);
            });
          }
        }
      } catch (error) {
        console.error('❌ Error initializing notification socket:', error);
      }
    };
    
    initializeSocket();
    
    // Cleanup function
    return () => {
      mounted = false;
      if (notificationSocket) {
        console.log('🧹 Cleaning up socket connection');
        notificationSocket.off('connect');
        notificationSocket.off('joined');
        notificationSocket.disconnect();
      }
    };
  }, [user?.id]); // Only re-run when user ID changes

  // 2. SOCKET EVENT LISTENERS
  // This effect sets up all the event listeners for notifications
  useEffect(() => {
    if (!socket || !user?.id) return;

    console.log('🔌 Setting up notification event listeners for user:', user.id);

    // Create event handler functions
    const handleNewOffer = (notification: any) => {
      console.log('📩 New offer notification received:', notification);
      dispatch(addNotification({
        id: Date.now(),
        userId: Number(user.id),
        type: NotificationType.REQUEST,
        title: 'New Offer',
        message: notification.message || 'You have received a new offer!',
        status: NotificationStatus.UNREAD
      }));
      fetchNotifications();
    };
    
    // Handler for offer response notifications
    const handleOfferResponse = (notification: any) => {
      console.log('📩 Offer response notification received:', notification);
      dispatch(addNotification({
        id: Date.now(),
        userId: Number(user.id),
        type: notification.type === 'OFFER_ACCEPTED' ? NotificationType.ACCEPTED : NotificationType.REJECTED,
        title: notification.type === 'OFFER_ACCEPTED' ? 'Offer Accepted' : 'Offer Rejected',
        message: notification.message || `Your offer has been ${notification.type === 'OFFER_ACCEPTED' ? 'accepted' : 'rejected'}!`,
        status: NotificationStatus.UNREAD
      }));
      
      // Refresh notifications
      fetchNotifications();
    };
    
    // Handler for order cancellation notifications
    const handleOrderCancelled = (notification: any) => {
      console.log('📩 Order cancellation notification received:', notification);
      dispatch(addNotification({
        id: Date.now(),
        userId: Number(user.id),
        type: NotificationType.REJECTED,
        title: 'Order Cancelled',
        message: notification.message || 'An order has been cancelled by the requester',
        status: NotificationStatus.UNREAD
      }));
      
      // Refresh notifications
      fetchNotifications();
    };
    
    // Handler for offer cancellation notifications
    const handleOfferCancelled = (notification: any) => {
      console.log('📩 Offer cancellation notification received:', notification);
      dispatch(addNotification({
        id: Date.now(),
        userId: Number(user.id),
        type: NotificationType.REJECTED,
        title: 'Offer Cancelled',
        message: notification.message || 'A traveler has cancelled their offer',
        status: NotificationStatus.UNREAD
      }));
      
      // Refresh notifications
      fetchNotifications();
    };

    // NEW: Handler for verification photo submitted notifications
    const handlePhotoSubmitted = (notification: any) => {
      console.log('📩 Verification photo submitted notification received:', notification);
      dispatch(addNotification({
        id: Date.now(),
        userId: Number(user.id),
        type: NotificationType.REQUEST,
        title: 'Photo Submitted',
        message: notification.message || 'A verification photo has been submitted for your review',
        status: NotificationStatus.UNREAD
      }));
      
      // Refresh notifications
      fetchNotifications();
    };
    
    // NEW: Handler for product confirmed notifications
    const handleProductConfirmed = (notification: any) => {
      console.log('📩 Product confirmed notification received:', notification);
      dispatch(addNotification({
        id: Date.now(),
        userId: Number(user.id),
        type: NotificationType.ACCEPTED,
        title: 'Product Confirmed',
        message: notification.message || 'Your product has been confirmed by the requester',
        status: NotificationStatus.UNREAD
      }));
      
      // Refresh notifications
      fetchNotifications();
    };
    
    // NEW: Handler for new photo request notifications
    const handleNewPhotoRequest = (notification: any) => {
      console.log('📩 New photo request notification received:', notification);
      dispatch(addNotification({
        id: Date.now(),
        userId: Number(user.id),
        type: NotificationType.REQUEST,
        title: 'New Photo Requested',
        message: notification.message || 'The requester has asked for another verification photo',
        status: NotificationStatus.UNREAD
      }));
      
      // Refresh notifications
      fetchNotifications();
    };
    
    // NEW: Handler for process cancelled notifications
    const handleProcessCancelled = (notification: any) => {
      console.log('📩 Process cancelled notification received:', notification);
      dispatch(addNotification({
        id: Date.now(),
        userId: Number(user.id),
        type: NotificationType.REJECTED,
        title: 'Process Cancelled',
        message: notification.message || 'The verification process has been cancelled',
        status: NotificationStatus.UNREAD
      }));
      
      // Refresh notifications
      fetchNotifications();
    };

    // Handler for room join confirmation
    const handleJoined = (data: any) => {
      console.log('✅ Joined notification room:', data);
    };

    // Setup event listeners
    socket.on('offer_made', handleNewOffer);
    socket.on('offer_response', handleOfferResponse);
    socket.on('order_cancelled', handleOrderCancelled);
    socket.on('offer_cancelled', handleOfferCancelled);
    socket.on('verification_photo_submitted', handlePhotoSubmitted);
    socket.on('product_confirmed', handleProductConfirmed);
    socket.on('request_new_photo', handleNewPhotoRequest);
    socket.on('process_canceled', handleProcessCancelled);

    // Rejoin room when socket reconnects
    socket.on('connect', () => {
      console.log('🔄 Socket reconnected, rejoining room for user:', user.id);
      socket.emit('join', user.id);
    });

    // Cleanup function
    return () => {
      console.log('🧹 Removing notification event listeners');
      socket.off('offer_made', handleNewOffer);
      socket.off('offer_response', handleOfferResponse);
      socket.off('order_cancelled', handleOrderCancelled);
      socket.off('offer_cancelled', handleOfferCancelled);
      socket.off('verification_photo_submitted', handlePhotoSubmitted);
      socket.off('product_confirmed', handleProductConfirmed);
      socket.off('request_new_photo', handleNewPhotoRequest);
      socket.off('process_canceled', handleProcessCancelled);
      socket.off('connect');
    };
  }, [socket, user?.id, dispatch, fetchNotifications]); // Re-run when socket, user ID, or dispatch changes

  // 3. API METHODS
  // Function to fetch notifications from the API
  

  // Function to mark a notification as read
  const markAsRead = useCallback(async (id: number) => {
    try {
      console.log(`🔄 Marking notification ${id} as read`);
      
      // Get authentication token
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        console.log('⚠️ No token available');
        return;
      }

      // Make API request
      const response = await fetch(`${BACKEND_URL}/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Update Redux store if successful
      if (response.ok) {
        console.log(`✅ Notification ${id} marked as read`);
        dispatch(markNotificationAsRead(id));
      } else {
        console.error(`❌ Failed to mark notification ${id} as read:`, response.status);
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }, [dispatch]); // Only re-create when dispatch changes

  // Function to delete a notification
  const deleteNotification = useCallback(async (id: number) => {
    try {
      console.log(`🗑️ Deleting notification ${id}`);
      
      // Get authentication token
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        console.log('⚠️ No token available');
        return;
      }
      
      // Make API request
      const response = await fetch(`${BACKEND_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh notifications if successful
      if (response.ok) {
        console.log(`✅ Notification ${id} deleted`);
        fetchNotifications();
      } else {
        console.error(`❌ Failed to delete notification ${id}:`, response.status);
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  }, [fetchNotifications]); // Only re-create when fetchNotifications changes

  // NEW: Function to send notifications - now using our utility function
  const sendNotification = useCallback(async (eventName: string, data: any) => {
    return await sendSocketNotification(eventName, data);
  }, []);

  // 4. INITIAL DATA LOADING
  // Fetch notifications when user changes
  useEffect(() => {
    if (user?.id) {
      console.log('👤 User changed, fetching notifications');
    fetchNotifications();
    }
  }, [user?.id, fetchNotifications]); // Run when user ID changes

  // 5. PREPARE CONTEXT VALUE
  const contextValue = {
    fetchNotifications,
    markAsRead,
    deleteNotification,
    sendNotification, // NEW: Added sendNotification function
    unreadCount,
  };

  // Return the provider with all children
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};