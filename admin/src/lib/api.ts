import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true  // Add this to handle CORS with credentials
});

// Use try-catch with typeof window check for SSR compatibility
const getToken = () => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  } catch (error) {
    return null;
  }
};

api.interceptors.request.use((config) => {
  const adminToken = getToken();
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Safe error logging that works in both server and client environments
    if (error.response) {
      if (typeof window !== 'undefined') {
        console.error('API Error:', {
          status: error.response.status,
          data: error.response.data,
          message: error.message
        });
      }
    } else if (typeof window !== 'undefined') {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;