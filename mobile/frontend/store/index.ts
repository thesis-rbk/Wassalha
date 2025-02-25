import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer, // Add your auth slice here
  },
});

// TypeScript types (optional, skip if using JS)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;