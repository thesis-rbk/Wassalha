import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationStatus, NotificationsState } from '../types/NotificationProcess';


const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.items = action.payload;
      state.unreadCount = action.payload.filter(
        notification => notification.status === NotificationStatus.UNREAD
      ).length;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      if (action.payload.status === NotificationStatus.UNREAD) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification && notification.status === NotificationStatus.UNREAD) {
        notification.status = NotificationStatus.READ;
        state.unreadCount -= 1;
      }
    },
  },
});

export const { setNotifications, addNotification, markAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer; 