import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axiosInstance from '@/config';
import { getSocket, connectSocket, cleanupSockets } from '../services/socketService'
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

      // CHANGE 1: Replace fetch with axiosInstance.get
      // Benefits:
      // - No need to specify full URL, just the endpoint
      // - No need to handle JSON conversion manually
      // - Automatically handles non-2xx responses as errors
      const response = await axiosInstance.get('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`, // Still sending token in headers
        },
      });

      // CHANGE 2: With axiosInstance the data is directly available in response.data
      // No need to call response.json()
      const data = response.data;

      // Update Redux store
      if (Array.isArray(data)) {
        console.log(`✅ Fetched ${data.length} notifications`);
        dispatch(setNotifications(data));
      } else {
        console.warn('⚠️ API response is not an array:', data);
        dispatch(setNotifications([]));
      }
    } catch (error) {
      // CHANGE 3: Error handling with axios
      // Axios automatically throws for non-2xx responses
      // No need to check response.ok
      console.error('❌ Error fetching notifications:', error);
    }
  }, [dispatch, user?.id]); // Dependencies remain unchanged
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
          if (notificationSocket?.connected) {
            notificationSocket.emit('join', user.id);
          } else {
            notificationSocket?.on('connect', () => {
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

    // Handler for payment initiated notifications
    const handlePaymentInitiated = (notification: any) => {
      console.log('📩 Payment initiated notification received:', notification);
      dispatch(addNotification({
        id: Date.now(),
        userId: Number(user.id),
        type: NotificationType.SYSTEM_ALERT,
        title: 'Payment Initiated',
        message: notification.message || 'Payment for your order has been initiated',
        status: NotificationStatus.UNREAD
      }));

      // Refresh notifications
      fetchNotifications();
    };

    // Handler for payment completed notifications
    const handlePaymentCompleted = (notification: any) => {
      console.log('📩 Payment completed notification received:', notification);
      dispatch(addNotification({
        id: Date.now(),
        userId: Number(user.id),
        type: NotificationType.PAYMENT_SUCCESS,
        title: 'Payment Completed',
        message: notification.message || 'Payment for your order has been completed',
        status: NotificationStatus.UNREAD
      }));

      // Refresh notifications
      fetchNotifications();
    };

    // Handler for payment failed notifications
    const handlePaymentFailed = (notification: any) => {
      console.log('📩 Payment failed notification received:', notification);
      dispatch(addNotification({
        id: Date.now(),
        userId: Number(user.id),
        type: NotificationType.PAYMENT_FAILED,
        title: 'Payment Failed',
        message: notification.message || 'Payment for your order has failed',
        status: NotificationStatus.UNREAD
      }));

      // Refresh notifications
      fetchNotifications();
    };

    // Handler for payment refunded notifications
    const handlePaymentRefunded = (notification: any) => {
      console.log('📩 Payment refunded notification received:', notification);
      dispatch(addNotification({
        id: Date.now(),
        userId: Number(user.id),
        type: NotificationType.SYSTEM_ALERT,
        title: 'Payment Refunded',
        message: notification.message || 'Payment for your order has been refunded',
        status: NotificationStatus.UNREAD
      }));

      // Refresh notifications
      fetchNotifications();
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
    socket.on('payment_initiated', handlePaymentInitiated);
    socket.on('payment_completed', handlePaymentCompleted);
    socket.on('payment_failed', handlePaymentFailed);
    socket.on('payment_refunded', handlePaymentRefunded);

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
      socket.off('payment_initiated', handlePaymentInitiated);
      socket.off('payment_completed', handlePaymentCompleted);
      socket.off('payment_failed', handlePaymentFailed);
      socket.off('payment_refunded', handlePaymentRefunded);
      socket.off('connect');
    };
  }, [socket, user?.id, dispatch, fetchNotifications]) // Re-run when socket, user ID, or dispatch changes

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

      // CHANGE 1: Replace fetch with axiosInstance.patch
      // Benefits:
      // - Cleaner syntax for PATCH requests
      // - Second parameter is the request body (empty object in this case)
      // - Third parameter is for config options like headers
      await axiosInstance.patch(`/api/notifications/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          // No need to specify Content-Type as it's set by default in axiosInstance
        },
      });

      // CHANGE 2: No need to check response.ok
      // If we reach this point, it means the request was successful
      // Axios would have thrown an error for non-2xx responses
      console.log(`✅ Notification ${id} marked as read`);
      dispatch(markNotificationAsRead(id));
    } catch (error) {
      // CHANGE 3: Simplified error handling
      // We can directly log the error without checking response status
      console.error(`❌ Failed to mark notification ${id} as read:`, error);
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

      // CHANGE 1: Replace fetch with axiosInstance.delete
      // Benefits:
      // - Clear method name that matches the HTTP method
      // - Simplified syntax with config options as second parameter
      await axiosInstance.delete(`/api/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // CHANGE 2: No need to check response.ok
      // If the code reaches here, the delete was successful
      // Axios would have thrown an error otherwise
      console.log(`✅ Notification ${id} deleted`);
      fetchNotifications(); // Refresh the notifications list
    } catch (error) {
      // CHANGE 3: Simplified error handling
      console.error(`❌ Failed to delete notification ${id}:`, error);
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