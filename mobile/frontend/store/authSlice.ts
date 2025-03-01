import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import  {AuthState}  from '../types/AuthState';

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signupStart(state) {
      state.loading = true;
      state.error = null;
    },
    signupSuccess(state, action: PayloadAction<{ token: string; user: { id: number; name: string; email: string } }>) {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    signupFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<{ token: string; user: { id: number; name: string; email: string } }>) {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
    },
  },
});

export const { signupStart, signupSuccess, signupFailure, loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;