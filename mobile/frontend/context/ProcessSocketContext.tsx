// ProcessSocketContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { BACKEND_URL } from '@/config';

// Define the interface for our context
interface ProcessSocketContextType {
  socket: Socket | null;
  joinProcessRoom: (processId: string | number) => void;
  emitOfferMade: (processId: string | number, requestId: string | number) => void;
  emitRequestCreated: (requestId: string | number) => void;
  emitProcessStatusUpdate: (processId: string | number, status: string) => void;
  isConnected: boolean;
}

// Create the context
const ProcessSocketContext = createContext<ProcessSocketContextType | null>(null);

// Create the provider component
export const ProcessSocketProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Create a persistent socket connection
    const socket = io(`${BACKEND_URL}/processTrack`);
    
    socket.on('connect', () => {
      console.log('✅ Process socket connected with ID:', socket.id);
      setIsConnected(true);
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Process socket disconnected');
      setIsConnected(false);
    });
    
    socketRef.current = socket;
    
    // Clean up on unmount
    return () => {
      console.log('🧹 Cleaning up process socket connection');
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);
  
  // Function to join a process room
  const joinProcessRoom = (processId: string | number) => {
    if (socketRef.current) {
      console.log(`🏠 Joining process room: ${processId}`);
      socketRef.current.emit('joinProcessRoom', processId);
    } else {
      console.warn('⚠️ Cannot join room - socket not connected');
    }
  };
  
  // Function to emit offer made event
  const emitOfferMade = (processId: string | number, requestId: string | number) => {
    if (socketRef.current) {
      console.log(`📤 Emitting offerMade: process=${processId}, request=${requestId}`);
      socketRef.current.emit('offerMade', { processId, requestId });
    } else {
      console.warn('⚠️ Cannot emit offerMade - socket not connected');
    }
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
    if (socketRef.current) {
      console.log(`📤 Emitting processStatusUpdate: process=${processId}, status=${status}`);
      socketRef.current.emit('processStatusUpdate', { processId, status });
    } else {
      console.warn('⚠️ Cannot emit processStatusUpdate - socket not connected');
    }
  };
  
  return (
    <ProcessSocketContext.Provider 
      value={{
        socket: socketRef.current,
        joinProcessRoom,
        emitOfferMade,
        emitRequestCreated,
        emitProcessStatusUpdate,
        isConnected
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