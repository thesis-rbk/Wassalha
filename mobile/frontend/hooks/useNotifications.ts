import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { 
  addNotification, 
  markAsRead, 
  setNotifications,
  NotificationType,
  NotificationStatus
} from '@/store/notificationsSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { BACKEND_URL } from '@/config';

export function useNotifications(userId?: string) {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector(
    (state: RootState) => state.notifications
  );

  useEffect(() => {
    if (!userId) return;
    
    const socket = io(`${BACKEND_URL}/notifications`);
    
    const handleConnect = () => {
      console.log('🔌 Notification socket connected');
      socket.emit('join', userId);
    };
    
    const handleNewOffer = (notification: any) => {
      console.log('📩 New offer notification received:', notification);
      dispatch(addNotification({
        id: Date.now(),
        userId: Number(userId),
        type: NotificationType.REQUEST,
        title: 'New Offer',
        message: notification.message || 'You have received a new offer!',
        status: NotificationStatus.UNREAD
      }));
    };
    
    const handleOfferResponse = (notification: any) => {
      console.log('📩 Offer response notification received:', notification);
      dispatch(addNotification({
        id: Date.now(),
        userId: Number(userId),
        type: notification.type === 'OFFER_ACCEPTED' ? NotificationType.ACCEPTED : NotificationType.REJECTED,
        title: notification.type === 'OFFER_ACCEPTED' ? 'Offer Accepted' : 'Offer Rejected',
        message: notification.message || `Your offer has been ${notification.type === 'OFFER_ACCEPTED' ? 'accepted' : 'rejected'}!`,
        status: NotificationStatus.UNREAD
      }));
    };
    
    const handleOrderCancelled = (notification: any) => {
      console.log('📩 Order cancellation notification received:', notification);
      dispatch(addNotification({
        id: Date.now(),
        userId: Number(userId),
        type: NotificationType.REJECTED,
        title: 'Order Cancelled',
        message: notification.message || 'An order has been cancelled by the requester',
        status: NotificationStatus.UNREAD
      }));
    };
    
    const handleOfferCancelled = (notification: any) => {
      console.log('📩 Offer cancellation notification received:', notification);
      dispatch(addNotification({
        id: Date.now(),
        userId: Number(userId),
        type: NotificationType.REJECTED,
        title: 'Offer Cancelled',
        message: notification.message || 'A traveler has cancelled their offer',
        status: NotificationStatus.UNREAD
      }));
    };
    
    socket.on('connect', handleConnect);
    socket.on('new_offer_notification', handleNewOffer);
    socket.on('offer_response_notification', handleOfferResponse);
    socket.on('order_cancelled_notification', handleOrderCancelled);
    socket.on('offer_cancelled_notification', handleOfferCancelled);
    
    if (!socket.connected) {
      socket.connect();
    }
    
    return () => {
      socket.off('connect', handleConnect);
      socket.off('new_offer_notification', handleNewOffer);
      socket.off('offer_response_notification', handleOfferResponse);
      socket.off('order_cancelled_notification', handleOrderCancelled);
      socket.off('offer_cancelled_notification', handleOfferCancelled);
    };
  }, [userId, dispatch]);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`${BACKEND_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        dispatch(setNotifications(data));
      } else {
        console.warn('API response is not an array:', data);
        dispatch(setNotifications([]));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      dispatch(setNotifications([]));
    }
  };

  const handleMarkAsRead = (notificationId: number) => {
    dispatch(markAsRead(notificationId));
  };

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead: handleMarkAsRead,
  };
}