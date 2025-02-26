import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
console.log('Starting store setup...');
console.log('authReducer:', authReducer);

if (typeof authReducer !== 'function') {
  throw new Error('authReducer is not a function - check authSlice export');
}

const reducerConfig = {
  auth: authReducer,
};
console.log('Reducer config:', reducerConfig);
export const store = configureStore({
  reducer: {
    auth: authReducer, // Add your auth slice here
  },
});

// TypeScript types (optional, skip if using JS)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;