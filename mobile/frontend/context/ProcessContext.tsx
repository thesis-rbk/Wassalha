import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axiosInstance from '@/config';
import { getSocket, connectSocket, cleanupSockets } from '@/services/Socketservice';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { 
  setProcesses,
  setCurrentProcess,
  updateProcessStatus,
  addProcessEvent,
  processInitialized,
  verificationSubmitted,
  processCancelled,
  paymentInitiated,
  paymentCompleted,
  paymentFailed,
  setSocketConnected,
  requestCreated
} from '@/store/processSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Socket } from 'socket.io-client';
import { GoodsProcess, ProcessStatus } from '@/types/GoodsProcess';
import { ProcessEvent } from '@/types/ProcessEvent';

// Create ProcessContext type
export interface ProcessContextType {
  fetchProcesses: () => Promise<void>;
  fetchProcessById: (processId: number) => Promise<GoodsProcess | null>;
  joinProcessRoom: (processId: number) => Promise<boolean>;
  updateStatus: (processId: number, status: ProcessStatus) => Promise<boolean>;
  submitVerification: (processId: number) => Promise<boolean>;
  requestNewPhoto: (processId: number, reason?: string) => Promise<boolean>;
  cancelProcess: (processId: number) => Promise<boolean>;
  initiatePayment: (processId: number) => Promise<boolean>;
  completePayment: (processId: number) => Promise<boolean>;
  reportPaymentFailure: (processId: number, errorMessage?: string) => Promise<boolean>;
  socketConnected: boolean;
}

// Create the context with null initial value
const ProcessContext = createContext<ProcessContextType | null>(null);

// Custom hook to use our process context
export const useProcess = () => {
  const context = useContext(ProcessContext);
  if (!context) {
    throw new Error('useProcess must be used within a ProcessProvider');
  }
  return context;
};

// The provider component that will wrap our app
export const ProcessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketConnected, setLocalSocketConnected] = useState(false);
  
  // Get user from Redux state
  const { user } = useSelector((state: RootState) => state.auth);
  const { processes, currentProcess } = useSelector((state: RootState) => state.process);

  // Fetch all processes for the current user
  const fetchProcesses = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 Fetching processes from API for user:', user.id);
      
      // Get authentication token
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        console.log('⚠️ No token available to fetch processes');
        return;
      }

      console.log('🔍 Making API request to: /api/process');
      const response = await axiosInstance.get('/api/process', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('🔍 API Response status:', response.status);
      console.log('🔍 API Response headers:', response.headers);
      console.log('🔍 API Response data type:', typeof response.data);
      console.log('🔍 API Response data is array?', Array.isArray(response.data));
      
      // Safely log response data, handling circular references
      try {
        console.log('🔍 API Response data:', JSON.stringify(response.data));
      } catch (e) {
        console.log('🔍 API Response data (non-stringifiable):', response.data);
      }

      // Check for nested data structure
      const data = response.data;
      const processesData = data?.data || data;
      
      console.log('🔍 Extracted processes data type:', typeof processesData);
      console.log('🔍 Extracted processes is array?', Array.isArray(processesData));
      console.log('🔍 Extracted processes length:', Array.isArray(processesData) ? processesData.length : 'N/A');
      
      // Update Redux store
      if (Array.isArray(processesData)) {
        console.log(`✅ Dispatching setProcesses with ${processesData.length} processes`);
        dispatch(setProcesses(processesData));
      } else {
        console.warn('⚠️ API response is not properly structured:', data);
        console.log('🔍 Setting empty processes array in Redux');
        dispatch(setProcesses([]));
      }
    } catch (error: any) {
      console.error('❌ Error fetching processes:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      console.error('❌ Error status:', error.response?.status);
    }
  }, [dispatch, user?.id]);

  // Fetch a specific process by ID
  const fetchProcessById = useCallback(async (processId: number): Promise<GoodsProcess | null> => {
    if (!user?.id) return null;
    
    try {
      console.log(`🔄 Fetching process ${processId} from API`);
      
      // Get authentication token
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        console.log('⚠️ No token available to fetch process');
        return null;
      }

      const response = await axiosInstance.get(`/api/process/${processId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const process = response.data;
      
      // Update Redux store
      if (process && process.id) {
        console.log(`✅ Fetched process ${processId}`);
        dispatch(setCurrentProcess(process));
        return process;
      } else {
        console.warn(`⚠️ Process ${processId} not found`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error fetching process ${processId}:`, error);
      return null;
    }
  }, [dispatch, user?.id]);

  // SOCKET INITIALIZATION
  // This effect runs when the user changes (login/logout)
  useEffect(() => {
    let mounted = true;
    let processSocket: Socket | null = null;
    
    const initializeSocket = async () => {
      if (!user?.id) {
        console.log('👤 No user logged in, skipping process socket setup');
        return;
      }
      
      try {
        console.log('🔄 Setting up process socket for user:', user.id);
        
        // Clean up any existing socket first
        if (socket) {
          socket.disconnect();
        }

        // Get new socket instance
        processSocket = await getSocket('process');
        
        if (mounted) {
          setSocket(processSocket);
          
          // Make sure socket is connected and join user room
          if (processSocket && !processSocket.connected) {
            await connectSocket('process');
          }

          // Join user room after connection is established
          if (processSocket?.connected) {
            setLocalSocketConnected(true);
            dispatch(setSocketConnected(true));
            processSocket.emit('join', user.id);
          } else {
            processSocket?.on('connect', () => {
              setLocalSocketConnected(true);
              dispatch(setSocketConnected(true));
              processSocket?.emit('join', user.id);
            });
          }

          processSocket?.on('disconnect', () => {
            setLocalSocketConnected(false);
            dispatch(setSocketConnected(false));
          });
        }
      } catch (error) {
        console.error('❌ Error initializing process socket:', error);
      }
    };
    
    initializeSocket();
    
    // Cleanup function
    return () => {
      mounted = false;
      if (processSocket) {
        console.log('🧹 Cleaning up process socket connection');
        processSocket.off('connect');
        processSocket.off('disconnect');
        processSocket.off('joined');
        processSocket.disconnect();
      }
    };
  }, [user?.id]);

  // SOCKET EVENT LISTENERS
  // This effect sets up all the event listeners for process updates
  useEffect(() => {
    if (!socket || !user?.id) return;

    console.log('🔌 Setting up process event listeners for user:', user.id);

    // Handler for process initialization
    const handleProcessInitialized = (data: {processId: number, orderId: number}) => {
      console.log('🟢 ProcessContext: process_initialized event received', data);
      dispatch(processInitialized(data));
      // Fetch the new process details
      fetchProcessById(data.processId);
    };
    
    // Handler for verification submission
    const handleVerificationSubmitted = (data: {processId: number}) => {
      console.log('📸 Verification submitted for process:', data.processId);
      dispatch(verificationSubmitted(data));
      // Refresh the process to get the latest status
      fetchProcessById(data.processId);
    };
    
    // Handler for new photo request
    const handleNewPhotoRequested = (data: {processId: number, reason?: string}) => {
      console.log('📷 New photo requested for process:', data);
      // This might trigger a notification rather than a state update
      // We still refresh the process data to get any status changes
      fetchProcessById(data.processId);
    };
    
    // Handler for process cancellation
    const handleProcessCancelled = (data: {processId: number}) => {
      console.log('❌ Process cancelled:', data.processId);
      dispatch(processCancelled(data));
      // Refresh to get the final state
      fetchProcessById(data.processId);
    };
    
    // Handler for process status update
    const handleProcessUpdated = (data: {processId: number, status: ProcessStatus, updatedBy: number}) => {
      console.log('🔄 Process status updated:', data);
      dispatch(updateProcessStatus({
        processId: data.processId,
        status: data.status
      }));
      // Fetch to get the complete updated process with events
      fetchProcessById(data.processId);
    };
    
    // Handler for payment events
    const handlePaymentInitiated = (data: {processId: number, requesterId: number}) => {
      console.log('💰 Payment initiated for process:', data);
      dispatch(paymentInitiated({processId: data.processId}));
      fetchProcessById(data.processId);
    };
    
    const handlePaymentCompleted = (data: {processId: number, requesterId: number}) => {
      console.log('✅ Payment completed for process:', data);
      dispatch(paymentCompleted({processId: data.processId}));
      fetchProcessById(data.processId);
    };
    
    const handlePaymentFailed = (data: {processId: number, requesterId: number, errorMessage?: string}) => {
      console.log('❌ Payment failed for process:', data);
      dispatch(paymentFailed({
        processId: data.processId,
        errorMessage: data.errorMessage
      }));
      fetchProcessById(data.processId);
    };

    // Handler for room join confirmation
    const handleJoined = (data: any) => {
      console.log('✅ Joined process room:', data);
    };

    // Add this new handler for request creation
    const handleRequestCreated = (data: {requestId: number, requestData: any}) => {
      console.log('🆕 ProcessContext: request_created event received', data);
      // Dispatch the Redux action to update the store
      dispatch(requestCreated(data));
      // Optionally, you could fetch additional data here if needed
    };

    // Setup event listeners for general process events
    socket.on('process_initialized', handleProcessInitialized);
    
    // For each process, listen for its specific update event
    processes.forEach(process => {
      socket.on(`process_${process.id}_updated`, handleProcessUpdated);
    });
    
    socket.on('payment_initiated', handlePaymentInitiated);
    socket.on('payment_completed', handlePaymentCompleted);
    socket.on('payment_failed', handlePaymentFailed);
    socket.on('joined', handleJoined);
    
    // Add this new one
    socket.on('request_created', handleRequestCreated);
    
    // Rejoin room when socket reconnects
    socket.on('connect', () => {
      console.log('🔄 Process socket reconnected, rejoining room for user:', user.id);
      setLocalSocketConnected(true);
      dispatch(setSocketConnected(true));
      socket.emit('join', user.id);
    });

    socket.on('disconnect', () => {
      setLocalSocketConnected(false);
      dispatch(setSocketConnected(false));
    });

    // Cleanup function
    return () => {
      console.log('🧹 Removing process event listeners');
      socket.off('process_initialized', handleProcessInitialized);
      
      // Clean up the specific process update listeners
      processes.forEach(process => {
        socket.off(`process_${process.id}_updated`, handleProcessUpdated);
      });
      
      socket.off('payment_initiated', handlePaymentInitiated);
      socket.off('payment_completed', handlePaymentCompleted);
      socket.off('payment_failed', handlePaymentFailed);
      socket.off('joined', handleJoined);
      socket.off('request_created', handleRequestCreated);
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket, user?.id, dispatch, fetchProcessById, processes]);

  // Set up listeners for specific process rooms
  const joinProcessRoom = useCallback(async (processId: number): Promise<boolean> => {
    if (!socket || !socket.connected) {
      console.log('⚠️ Socket not connected, cannot join process room');
      return false;
    }
    
    try {
      console.log(`🔄 Joining process room for process ${processId}`);
      
      // FIXED: Changed to match backend expectations and match processService.ts
      socket.emit('join', processId);
      
      // Set up process-specific event listeners
      const processRoomEvents = [
        `process_${processId}_verification_submitted`,
        `process_${processId}_canceled`,
        `process_${processId}_verification_approved`,
        `process_${processId}_new_photo_requested`
      ];
      
      // Add listeners for these events
      processRoomEvents.forEach(eventName => {
        socket.on(eventName, (data: any) => {
          console.log(`📩 Received event ${eventName}:`, data);
          // Refresh process data when events occur
          fetchProcessById(processId);
        });
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error joining process room:', error);
      return false;
    }
  }, [socket, fetchProcessById]);

  // Process actions via socket
  const updateStatus = useCallback(async (
    processId: number, 
    status: ProcessStatus
  ): Promise<boolean> => {
    if (!socket || !socket.connected) {
      console.log('⚠️ Socket not connected, cannot update status');
      return false;
    }
    
    try {
      console.log(`🔄 Updating process ${processId} status to ${status}`);
      socket.emit('update_process_status', { processId, status });
      return true;
    } catch (error) {
      console.error('❌ Error updating process status:', error);
      return false;
    }
  }, [socket]);

  const submitVerification = useCallback(async (processId: number): Promise<boolean> => {
    if (!socket || !socket.connected) {
      console.log('⚠️ Socket not connected, cannot submit verification');
      return false;
    }
    
    try {
      console.log(`📸 Submitting verification photo for process ${processId}`);
      socket.emit('submit_verification_photo', { processId });
      return true;
    } catch (error) {
      console.error('❌ Error submitting verification photo:', error);
      return false;
    }
  }, [socket]);

  const requestNewPhoto = useCallback(async (
    processId: number, 
    reason?: string
  ): Promise<boolean> => {
    if (!socket || !socket.connected) {
      console.log('⚠️ Socket not connected, cannot request new photo');
      return false;
    }
    
    try {
      console.log(`📷 Requesting new photo for process ${processId}`);
      socket.emit('request_new_photo', { processId, reason });
      return true;
    } catch (error) {
      console.error('❌ Error requesting new photo:', error);
      return false;
    }
  }, [socket]);

  const cancelProcess = useCallback(async (processId: number): Promise<boolean> => {
    if (!socket || !socket.connected) {
      console.log('⚠️ Socket not connected, cannot cancel process');
      return false;
    }
    
    try {
      console.log(`❌ Cancelling process ${processId}`);
      socket.emit('cancel_process', { processId });
      return true;
    } catch (error) {
      console.error('❌ Error cancelling process:', error);
      return false;
    }
  }, [socket]);

  const initiatePayment = useCallback(async (processId: number): Promise<boolean> => {
    if (!socket || !socket.connected) {
      console.log('⚠️ Socket not connected, cannot initiate payment');
      return false;
    }
    
    try {
      console.log(`💰 Initiating payment for process ${processId}`);
      socket.emit('payment_initiated', { processId });
      return true;
    } catch (error) {
      console.error('❌ Error initiating payment:', error);
      return false;
    }
  }, [socket]);

  const completePayment = useCallback(async (processId: number): Promise<boolean> => {
    if (!socket || !socket.connected) {
      console.log('⚠️ Socket not connected, cannot complete payment');
      return false;
    }
    
    try {
      console.log(`✅ Completing payment for process ${processId}`);
      socket.emit('payment_completed', { processId });
      return true;
    } catch (error) {
      console.error('❌ Error completing payment:', error);
      return false;
    }
  }, [socket]);

  const reportPaymentFailure = useCallback(async (
    processId: number, 
    errorMessage?: string
  ): Promise<boolean> => {
    if (!socket || !socket.connected) {
      console.log('⚠️ Socket not connected, cannot report payment failure');
      return false;
    }
    
    try {
      console.log(`❌ Reporting payment failure for process ${processId}`);
      socket.emit('payment_failed', { processId, errorMessage });
      return true;
    } catch (error) {
      console.error('❌ Error reporting payment failure:', error);
      return false;
    }
  }, [socket]);

  // INITIAL DATA LOADING
  // Fetch processes when user changes
  useEffect(() => {
    if (user?.id) {
      console.log('👤 User changed, fetching processes');
      fetchProcesses();
    }
  }, [user?.id, fetchProcesses]);

  // PREPARE CONTEXT VALUE
  const contextValue: ProcessContextType = {
    fetchProcesses,
    fetchProcessById,
    joinProcessRoom,
    updateStatus,
    submitVerification,
    requestNewPhoto,
    cancelProcess,
    initiatePayment,
    completePayment,
    reportPaymentFailure,
    socketConnected
  };

  // Return the provider with all children
  return (
    <ProcessContext.Provider value={contextValue}>
      {children}
    </ProcessContext.Provider>
  );
};