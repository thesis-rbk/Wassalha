import Constants from "expo-constants";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update API_URL to match your current IP address
const API_URL = "http://192.168.1.11:5000/";  // Update this line

// Debug log
console.log('API URL:', API_URL);

// Export URLs using the API_URL from Constants
export const BACKEND_URL = API_URL;
export const SOCKET_URL = API_URL;
export const CLOUDINARY_URL = "your_cloudinary_url";
export const AVIATIONSTACK_API_KEY = "3fd9915c525b39d770dcd988dc903394";
export const GOOGLE_MAPS_API_KEY = "your_google_maps_api_key";

// Create axios instance with the API_URL
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 90000,
  headers: { 'Content-Type': 'application/json' }
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;