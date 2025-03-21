import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store active socket connections
const activeSockets: Record<string, Socket> = {};

/**
 * Get or create a socket instance for a specific namespace
 */
export const getSocket = async (namespace: string, options?: Record<string, any>): Promise<Socket | null> => {
  try {
    // If we already have a socket instance for this namespace, return it
    if (activeSockets[namespace] && activeSockets[namespace].connected) {
      console.log(`✅ Reusing existing ${namespace} socket connection`);
      return activeSockets[namespace];
    }

    // Get authentication token
    const token = await AsyncStorage.getItem('jwtToken');
    if (!token) {
      console.log('⚠️ No authentication token available');
      return null;
    }

    console.log(`🔄 Creating new ${namespace} socket connection`);

    // Create socket with authentication
    const socket = io(`${SOCKET_URL}/${namespace}`, {
      auth: { token, ...options },
      transports: ['websocket']
    });

    // Store active socket
    activeSockets[namespace] = socket;

    // Add default event handlers
    socket.on('connect', () => {
      console.log(`✅ Connected to ${namespace} socket`);
    });

    socket.on('error', (error: any) => {
      console.error(`❌ Socket error in ${namespace}:`, error);
    });

    socket.on('disconnect', () => {
      console.log(`⚪ Disconnected from ${namespace} socket`);
    });

    return socket;
  } catch (error) {
    console.error(`❌ Error creating ${namespace} socket:`, error);
    return null;
  }
};

/**
 * Connect socket if not connected
 */
export const connectSocket = (namespace: string): void => {
  if (!activeSockets[namespace]) {
    console.log(`⚠️ No socket found for ${namespace}`);
    return;
  }

  if (!activeSockets[namespace].connected) {
    console.log(`🔄 Reconnecting ${namespace} socket...`);
    activeSockets[namespace].connect();
  }
};

/**
 * Disconnect and cleanup all sockets
 */
export const cleanupSockets = (): void => {
  console.log('🧹 Cleaning up all socket connections');

  Object.keys(activeSockets).forEach(namespace => {
    if (activeSockets[namespace]) {
      console.log(`🔌 Disconnecting ${namespace} socket`);
      activeSockets[namespace].disconnect();
      delete activeSockets[namespace];
    }
  });
};
