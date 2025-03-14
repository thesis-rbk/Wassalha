import { io, Socket } from 'socket.io-client';
import { BACKEND_URL } from '@/config';

// This object stores all our socket connections
// It works like a dictionary where the key is the socket type (e.g., 'notifications' or 'chat')
// and the value is the actual socket connection
const sockets: Record<string, Socket> = {};

/**
 * This function gets or creates a socket for a specific feature
 * 
 * @param type - What the socket is used for ('notifications' or 'chat')
 * @returns The socket.io connection for that feature
 */
export const getSocket = (type: string = 'notifications'): Socket => {
  // Socket.io uses "namespaces" that start with a slash
  // For example: '/notifications' or '/chat'
  const namespace = `/${type}`;
  
  // Check if we already have a socket for this type
  if (!sockets[type]) {
    // If not, create a new socket connection
    console.log(`🔌 Creating ${type} socket`);
    
    // Connect to the server with the specific namespace
    // Example: http://your-server.com/notifications
    sockets[type] = io(`${BACKEND_URL}${namespace}`);
    
    // Add listeners for connection events to help with debugging
    
    // This runs when socket successfully connects
    sockets[type].on('connect', () => console.log(`✅ ${type} socket connected`));
    
    // This runs if connection fails
    sockets[type].on('connect_error', (error) => console.error(`❌ ${type} socket error: ${error.message}`));
  } else {
    // If we already have a socket for this type, reuse it
    console.log(`♻️ Reusing ${type} socket`);
  }
  
  // Return the socket (either newly created or existing)
  return sockets[type];
};

/**
 * This function closes socket connections to clean up
 * 
 * @param type - Which socket to close ('notifications', 'chat', or none to close all)
 */
export const closeSocket = (type?: string): void => {
  // If a specific type is provided and that socket exists
  if (type && sockets[type]) {
    // Disconnect that specific socket
    sockets[type].disconnect();
    // Remove it from our collection
    delete sockets[type];
    console.log(`✅ ${type} socket closed`);
  } 
  // If no type specified, close all sockets
  else if (!type) {
    // Loop through all socket types we have
    Object.keys(sockets).forEach(t => {
      // Disconnect each socket
      sockets[t].disconnect();
      // Remove it from our collection
      delete sockets[t];
    });
    console.log('✅ All sockets closed');
  }
};