import axios from 'axios';
import { BACKEND_URL } from '@/config';

export const checkServerConnection = () => {
  console.log('🔄 Testing connection to:', BACKEND_URL);
  
  // Test API connectivity
  axios.get(`${BACKEND_URL}/api/health`)
    .then(() => console.log('✅ API server is reachable'))
    .catch(error => console.error('❌ API server connection failed:', error.message));
  
  // Test socket connectivity
  axios.get(`${BACKEND_URL}/socket.io/?EIO=4&transport=polling`)
    .then(() => console.log('✅ Socket server is reachable'))
    .catch(error => console.error('❌ Socket server connection failed:', error.message));
};