// ProcessSocketContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from '@/config';

// Extend the interface to include room tracking
interface ProcessSocketContextType {
  socket: Socket | null;
  joinProcessRoom: (processId: string | number) => void;
  leaveProcessRoom: (processId: string | number) => void;
  emitOfferMade: (processId: string | number, requestId: string | number) => void;
  emitRequestCreated: (requestId: string | number) => void;
  emitProcessStatusUpdate: (processId: string | number, status: string) => void;
  isConnected: boolean;
  joinedRooms: string[];
  listenToProcessUpdates: (callback: (data: any) => void) => () => void;
  listenToNewRequests: (callback: (data: any) => void) => () => void;
}

// Create the context
const ProcessSocketContext = createContext<ProcessSocketContextType | null>(null);

// Create the provider component
export const ProcessSocketProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  
  // Track joined rooms
  const [joinedRooms, setJoinedRooms] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) {
          console.warn("⚠️ No JWT token available for socket connection");
          return;
        }
        console.log("🔑 Token found, initializing socket connection...");

        const socket = io(`${BACKEND_URL}/processTrack`, {
          extraHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Add more connection event listeners
        socket.on('connect', () => {
          console.log('✅ Process socket connected with ID:', socket.id);
          
          // Rejoin rooms after reconnection
          Array.from(joinedRooms).forEach(room => {
            const processId = room.replace('process:', '');
            joinProcessRoom(processId);  // Use simple join
          });
          
          setIsConnected(true);
        });
        
        socket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error.message, error.description);
        });

        socket.on('disconnect', (reason) => {
          console.log('❌ Socket disconnected. Reason:', reason);
        });

        socket.on('reconnect_attempt', (attemptNumber) => {
          console.log('🔄 Attempting to reconnect... Attempt:', attemptNumber);
        });

        socket.on('reconnect', (attemptNumber) => {
          console.log('✅ Successfully reconnected after', attemptNumber, 'attempts');
        });

        socket.on('roomJoined', (data) => {
          if (data.success) {
            const roomName = getRoomName(data.processId);  // Convert to "process:5" format
            console.log(`✅ Successfully joined room: ${roomName}`);
            setJoinedRooms(prev => {
              const newSet = new Set(prev);
              newSet.add(roomName);
              return newSet;
            });
          } else {
            console.error(`❌ Failed to join room for process: ${data.processId}`);
          }
        });
        
        socket.on('joinRoom', (data) => {
          const { processId } = data;
          console.log(`📥 Received offer for request, joining room: ${processId}`);
          joinProcessRoom(processId);
        });
        
        socket.on('refreshOrders', () => {
          console.log('🔄 Refreshing orders list');
          // Call your function to fetch orders here
          fetchOrders();  // or whatever your function is called
        });
        
        socketRef.current = socket;

        // Test the connection immediately
        console.log('🔍 Socket state:', {
          connected: socket.connected,
          id: socket.id,
          rooms: Array.from(joinedRooms)
        });
        
        return () => {
          console.log('🧹 Cleaning up socket connection. Connected rooms:', Array.from(joinedRooms));
          socket.disconnect();
          socketRef.current = null;
        };
      } catch (error) {
        console.error('❌ Error in socket initialization:', error);
      }
    };

    initializeSocket();
  }, []);
  
  const getRoomName = (processId: string | number) => `process:${processId}`;

  // Update joinProcessRoom to send raw ID
  const joinProcessRoom = (processId: string | number) => {
    const processIdStr = processId.toString();  // "5"
    const roomName = getRoomName(processIdStr); // "process:5" for local tracking
    
    if (!socketRef.current?.connected) {
        console.warn('⚠️ Cannot join room - socket not connected');
        return;
    }

    if (!joinedRooms.has(roomName)) {
        console.log(`🏠 Attempting to join room: ${roomName}`);
        socketRef.current.emit('joinProcessRoom', processIdStr);  // Send "5"
    }
  };

  // Simplify emitOfferMade
  const emitOfferMade = (processId: string | number, requestId: string | number) => {
    if (!socketRef.current?.connected) return;
    
    joinProcessRoom(processId);  // Join room first
    
    console.log(`📤 Emitting offerMade: process=${processId}, request=${requestId}`);
    socketRef.current.emit('offerMade', { processId, requestId });
  };

  // Function to track leaving a room (optional, as Socket.IO handles disconnection)
  const leaveProcessRoom = (processId: string | number) => {
    const processIdStr = processId.toString();
    const roomName = getRoomName(processIdStr);
    
    if (socketRef.current) {
        console.log(`🚪 Leaving process room: ${roomName}`);
        
        setJoinedRooms(prev => {
            const newSet = new Set(prev);
            newSet.delete(roomName);
            return newSet;
        });
    }
  };
  
  // Function to listen for process status updates
  const listenToProcessUpdates = (callback: (data: any) => void) => {
    if (!socketRef.current?.connected) {
        console.warn('⚠️ Cannot listen for updates - socket not connected');
        return () => {};
    }
    
    console.log('👂 Setting up process updates listener');
    
    const handleStatusChange = (data: any) => {
        console.log('📥 Received status change:', data);
        
        // If it's PREINITIALIZED, everyone should get it
        if (data.status === "PREINITIALIZED") {
            callback(data);
            return;
        }

        // For other statuses, check room membership
        const roomName = getRoomName(data.processId);
        if (joinedRooms.has(roomName)) {
            callback(data);
        }
    };
    
    socketRef.current.on('processStatusChanged', handleStatusChange);
    
    return () => {
        socketRef.current?.off('processStatusChanged', handleStatusChange);
    };
  };
  
  // Function to emit request created event
  const emitRequestCreated = (requestId: string | number) => {
    if (socketRef.current) {
      console.log(`📤 Emitting requestCreated: request=${requestId}`);
      socketRef.current.emit('requestCreated', { requestId });
    } else {
      console.warn('⚠️ Cannot emit requestCreated - socket not connected');
    }
  };
  
  // Function to emit process status update event
  const emitProcessStatusUpdate = (processId: string | number, status: string) => {
    const roomName = getRoomName(processId);
    
    if (!socketRef.current?.connected) return;
    if (!joinedRooms.has(roomName)) {
        joinProcessRoom(processId); // Join if not in room
    }
    
    socketRef.current.emit('processStatusUpdate', { processId, status });
  };
  
  // Function to listen for new requests
  const listenToNewRequests = (callback: (data: any) => void) => {
    if (!socketRef.current) return () => {};
    
    console.log('👂 Setting up listener for newRequest');
    
    const handleNewRequest = (data: any) => {
      console.log(`📥 Received new request notification: ${data.requestId}`);
      callback(data);
    };
    
    socketRef.current.on('newRequest', handleNewRequest);
    
    // Return cleanup function
    return () => {
      console.log('🛑 Removing listener for newRequest');
      socketRef.current?.off('newRequest', handleNewRequest);
    };
  };
  
  return (
    <ProcessSocketContext.Provider 
      value={{
        socket: socketRef.current,
        joinProcessRoom,
        leaveProcessRoom,
        emitOfferMade,
        emitRequestCreated,
        emitProcessStatusUpdate,
        isConnected,
        joinedRooms: Array.from(joinedRooms),
        listenToProcessUpdates,
        listenToNewRequests
      }}
    >
      {children}
    </ProcessSocketContext.Provider>
  );
};

// Create a hook to use the context
export const useProcessSocket = () => {
  const context = useContext(ProcessSocketContext);
  if (!context) {
    throw new Error('useProcessSocket must be used within a ProcessSocketProvider');
  }
  return context;
};