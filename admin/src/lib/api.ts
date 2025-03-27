import axios from 'axios';

// Track token status to prevent multiple redirects
let isRefreshingToken = false;
let tokenRefreshTimestamp = 0;

// Create axios instance with retry logic
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', // Changed to 3000 to match typical Node.js/Express default
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Use try-catch with typeof window check for SSR compatibility
const getToken = () => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Check token validity (not expired, etc)
const isTokenValid = () => {
  try {
    const token = getToken();
    if (!token) return false;
    
    const currentTime = Date.now();
    if (currentTime - tokenRefreshTimestamp < 5 * 60 * 1000) {
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};

// Request interceptor
api.interceptors.request.use((config) => {
  const adminToken = getToken();
  if (adminToken && isTokenValid()) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (typeof window !== 'undefined') {
      // Network or server errors
      if (!error.response) {
        const errorMessage = 'Unable to connect to the server. Please check if the backend server is running.';
        console.error('Network Error:', {
          message: errorMessage,
          error: error.message
        });
        return Promise.reject({
          ...error,
          customMessage: errorMessage
        });
      }

      // Handle 401 unauthorized errors
      if (error.response?.status === 401 && !isRefreshingToken) {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/AdminLogin')) {
          isRefreshingToken = true;
          
          localStorage.removeItem('adminToken');
          localStorage.removeItem('userData');
          
          if (currentPath.startsWith('/Admin') || 
              currentPath.includes('Dashboard') || 
              currentPath.includes('List') || 
              currentPath.includes('Profile')) {
            
            console.log('Session expired. Redirecting to login...');
            window.location.href = '/AdminLogin?expired=true';
          }
          isRefreshingToken = false;
        }
      }

      // Log other errors
      if (error.response) {
        console.error('API Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          url: error.config?.url,
          method: error.config?.method,
          message: error.message
        });
      }
    }
    return Promise.reject(error);
  }
);

export const refreshTokenTimestamp = () => {
  tokenRefreshTimestamp = Date.now();
};

export default api;