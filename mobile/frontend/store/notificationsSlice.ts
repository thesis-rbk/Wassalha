import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Match Prisma enums
export enum NotificationType {
  REQUEST = 'REQUEST',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  ORDER_CREATED = 'ORDER_CREATED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PICKUP_SCHEDULE = 'PICKUP_SCHEDULE',
  DELIVERY_COMPLETED = 'DELIVERY_COMPLETED',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

export enum NotificationStatus {
  READ = 'READ',
  UNREAD = 'UNREAD'
}

interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title?: string;
  message?: string;
  status: NotificationStatus;
  requestId?: number;
  orderId?: number;
  pickupId?: number;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(
        n => n.status === NotificationStatus.UNREAD
      ).length;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (action.payload.status === NotificationStatus.UNREAD) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification?.status === NotificationStatus.UNREAD) {
        notification.status = NotificationStatus.READ;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    }
  }
});

export const { setNotifications, addNotification, markAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer; 