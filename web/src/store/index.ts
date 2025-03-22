import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import processReducer from './processSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    process: processReducer,
  },
});

// TypeScript types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 