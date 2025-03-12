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

export function useNotifications() {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector(
    (state: RootState) => state.notifications
  );

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch('YOUR_API_URL/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      dispatch(setNotifications(data));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNewNotification = (notification: {
    id: number;
    userId: number;
    type: NotificationType;
    title?: string;
    message?: string;
    requestId?: number;
    orderId?: number;
    pickupId?: number;
  }) => {
    dispatch(addNotification({
      ...notification,
      status: NotificationStatus.UNREAD,
    }));
  };

  const handleMarkAsRead = (notificationId: number) => {
    dispatch(markAsRead(notificationId));
  };

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    addNotification: handleNewNotification,
    markAsRead: handleMarkAsRead,
  };
} 