import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GoodsProcess, ProcessStatus } from '../types/GoodsProcess';
import { ProcessEvent } from '../types/ProcessEvent';
import { ProcessState } from '../types/ProcessState';

enum ProcessStatuss {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}
const initialState: ProcessState = {
  processes: [],
  currentProcess: null,
  loading: false,
  error: null,
  socketConnected: false
};

const processSlice = createSlice({
  name: 'process',
  initialState,
  reducers: {
    // Socket connection status
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload;
    },
    
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Set all processes
    setProcesses: (state, action: PayloadAction<GoodsProcess[]>) => {
      console.log('🔵 processSlice: setProcesses reducer called with', action.payload.length, 'processes');
      state.processes = action.payload;
    },
    
    // Set current process
    setCurrentProcess: (state, action: PayloadAction<GoodsProcess>) => {
      console.log('🔵 processSlice: setCurrentProcess reducer called with process ID', action.payload.id);
      state.currentProcess = action.payload;
    },
    
    // Clear current process
    clearCurrentProcess: (state) => {
      state.currentProcess = null;
    },
    
    // Add a new process
    addProcess: (state, action: PayloadAction<GoodsProcess>) => {
      const exists = state.processes.some(process => process.id === action.payload.id);
      if (!exists) {
        state.processes.push(action.payload);
      }
    },
    
    // Update process status
    updateProcessStatus: (state, action: PayloadAction<{processId: number, status: ProcessStatus}>) => {
      const { processId, status } = action.payload;
      
      // Update in processes list
      const processIndex = state.processes.findIndex(process => process.id === processId);
      if (processIndex !== -1) {
        state.processes[processIndex].status = status;
      }
      
      // Update current process if it matches
      if (state.currentProcess && state.currentProcess.id === processId) {
        state.currentProcess.status = status;
      }
    },
    
    // Add process event
    addProcessEvent: (state, action: PayloadAction<{processId: number, event: ProcessEvent}>) => {
      const { processId, event } = action.payload;
      console.log('🔵 processSlice: addProcessEvent reducer called for process', processId, 'event type:', event);
      
      // Add to processes list
      const processIndex = state.processes.findIndex(process => process.id === processId);
      if (processIndex !== -1) {
        state.processes[processIndex].events.push(event);
      }
      
      // Add to current process if it matches
      if (state.currentProcess && state.currentProcess.id === processId) {
        state.currentProcess.events.push(event);
      }
    },
    
    // Handle socket events
    processInitialized: (state, action: PayloadAction<{processId: number, orderId: number}>) => {
      console.log('Process initialized:', action.payload);
    },
    
    verificationSubmitted: (state, action: PayloadAction<{processId: number}>) => {
      console.log('Verification submitted for process:', action.payload.processId);
    },
    
    newPhotoRequested: (state, action: PayloadAction<{processId: number, reason?: string}>) => {
      console.log('New photo requested for process:', action.payload);
    },
    
    processCancelled: (state, action: PayloadAction<{processId: number}>) => {
      const { processId } = action.payload;
      const processIndex = state.processes.findIndex(process => process.id === processId);
      
      if (processIndex !== -1) {
        state.processes[processIndex].status = ProcessStatuss.CANCELLED;
      }
      
      if (state.currentProcess && state.currentProcess.id === processId) {
        state.currentProcess.status = ProcessStatuss.CANCELLED;
      }
    },
    
    paymentInitiated: (state, action: PayloadAction<{processId: number}>) => {
      console.log('Payment initiated for process:', action.payload.processId);
    },
    
    paymentCompleted: (state, action: PayloadAction<{processId: number}>) => {
      const { processId } = action.payload;
      const processIndex = state.processes.findIndex(process => process.id === processId);
      
      if (processIndex !== -1) {
        state.processes[processIndex].status = ProcessStatuss.PAID;
      }
      
      if (state.currentProcess && state.currentProcess.id === processId) {
        state.currentProcess.status = ProcessStatuss.PAID;
      }
    },
    
    paymentFailed: (state, action: PayloadAction<{processId: number, errorMessage?: string}>) => {
      console.log('Payment failed for process:', action.payload);
    }
  }
});

export const {
  setSocketConnected,
  setLoading,
  setError,
  setProcesses,
  setCurrentProcess,
  clearCurrentProcess,
  addProcess,
  updateProcessStatus,
  addProcessEvent,
  processInitialized,
  verificationSubmitted,
  newPhotoRequested,
  processCancelled,
  paymentInitiated,
  paymentCompleted,
  paymentFailed
} = processSlice.actions;

export default processSlice.reducer;
