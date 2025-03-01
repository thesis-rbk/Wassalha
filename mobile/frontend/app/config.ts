import Constants from "expo-constants";
const API_URL = Constants.expoConfig?.extra?.API_URL;
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// if (!API_URL) {
//   throw new Error('API_URL is not defined in .env file');
// }

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 90000,
    headers: { 'Content-Type': 'application/json' }
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;