import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import notificationsReducer from './notificationsSlice';
import chatReducer from './chatSlice';

console.log('Starting store setup...');
console.log('authReducer:', authReducer);

if (typeof authReducer !== 'function') {
  throw new Error('authReducer is not a function - check authSlice export');
}

const reducerConfig = {
  auth: authReducer,
  notifications: notificationsReducer,
  chat: chatReducer,
};
console.log('Reducer config:', reducerConfig);
export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
  },
});

// TypeScript types (optional, skip if using JS)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;