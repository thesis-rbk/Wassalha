import axios from 'axios';

// Track token status to prevent multiple redirects
let isRefreshingToken = false;
let tokenRefreshTimestamp = 0;

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

// Check token validity (not expired, etc)
const isTokenValid = () => {
  try {
    const token = getToken();
    // If no token, it's not valid
    if (!token) return false;
    
    // Check if token was refreshed recently (within 5 minutes)
    const currentTime = Date.now();
    if (currentTime - tokenRefreshTimestamp < 5 * 60 * 1000) {
      return true; // Token was refreshed recently, consider it valid
    }
    
    // For JWT tokens, you could decode and check expiration
    // This is a simple implementation that assumes token validity
    return true;
  } catch (error) {
    return false;
  }
};

api.interceptors.request.use((config) => {
  const adminToken = getToken();
  if (adminToken && isTokenValid()) {
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
    if (typeof window !== 'undefined') {
      // Skip 401 errors for certain endpoints related to admin dashboard to avoid console spam
      const skipErrorLogging = error.response?.status === 401 && 
        (error.config?.url?.includes('/api/service-providers') || 
         error.config?.url?.includes('/api/travelers') ||
         error.config?.url?.includes('/api/users'));
      
      // Handle 401 unauthorized errors that indicate token expiration
      if (error.response?.status === 401 && !isRefreshingToken) {
        // Only attempt token refresh if we're not already doing so and not on login page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/AdminLogin')) {
          isRefreshingToken = true;
          
          // Clear the token since it's invalid
          if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            
            // Only redirect if we're on an admin page
            if (currentPath.startsWith('/Admin') || 
                currentPath.includes('Dashboard') || 
                currentPath.includes('List') || 
                currentPath.includes('Profile')) {
              
              console.log('Session expired. Redirecting to login...');
              setTimeout(() => {
                window.location.href = '/AdminLogin?expired=true';
                isRefreshingToken = false;
              }, 100);
            }
          }
        }
      }
      
      if (!skipErrorLogging) {
        if (error.response) {
          console.error('API Error:', {
            status: error.response.status,
            statusText: error.response.statusText,
            url: error.config?.url || 'unknown endpoint',
            method: error.config?.method || 'unknown method',
            message: error.message || 'No error message available'
          });
        } else if (error.request) {
          // The request was made but no response was received
          console.error('API Request Error (No Response):', {
            url: error.config?.url || 'unknown endpoint',
            method: error.config?.method || 'unknown method',
            message: 'No response received from server'
          });
        } else {
          // Something happened in setting up the request
          console.error('API Configuration Error:', error.message || 'Unknown error');
        }
      }
    }
    return Promise.reject(error);
  }
);

// Add a function to update token timestamp when it's refreshed
export const refreshTokenTimestamp = () => {
  tokenRefreshTimestamp = Date.now();
};

export default api;