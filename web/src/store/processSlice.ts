import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the types (normally would import from types folder)
export enum ProcessStatus {
  PREINITIALIZED = 'PREINITIALIZED',
  INITIALIZED = 'INITIALIZED',
  CONFIRMED = 'CONFIRMED',
  PAID = 'PAID',
  IN_TRANSIT = 'IN_TRANSIT',
  PICKUP_MEET = 'PICKUP_MEET',
  FINALIZED = 'FINALIZED',
  CANCELLED = 'CANCELLED'
}

export interface ProcessEvent {
  id: number;
  goodsProcessId: number;
  fromStatus: ProcessStatus;
  toStatus: ProcessStatus;
  changedByUserId?: number;
  note?: string;
  createdAt: Date;
}

export interface GoodsProcess {
  id: number;
  orderId: number;
  status: ProcessStatus;
  createdAt: Date;
  updatedAt: Date;
  events: ProcessEvent[];
}

export interface ProcessState {
  activeProcesses: GoodsProcess[];
  currentProcess: GoodsProcess | null;
  loading: boolean;
  error: string | null;
  socketConnected: boolean;
}

// Initial state
const initialState: ProcessState = {
  activeProcesses: [],
  currentProcess: null,
  loading: false,
  error: null,
  socketConnected: false
};

// Create the process slice
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
      state.activeProcesses = action.payload;
    },
    
    // Set current process
    setCurrentProcess: (state, action: PayloadAction<GoodsProcess>) => {
      state.currentProcess = action.payload;
    },
    
    // Clear current process
    clearCurrentProcess: (state) => {
      state.currentProcess = null;
    },
    
    // Add a new process
    addProcess: (state, action: PayloadAction<GoodsProcess>) => {
      const exists = state.activeProcesses.some(process => process.id === action.payload.id);
      if (!exists) {
        state.activeProcesses.push(action.payload);
      }
    },
    
    // Update process status
    updateProcessStatus: (state, action: PayloadAction<{processId: number, status: ProcessStatus}>) => {
      const { processId, status } = action.payload;
      
      // Update in active processes
      const processIndex = state.activeProcesses.findIndex(process => process.id === processId);
      if (processIndex !== -1) {
        state.activeProcesses[processIndex].status = status;
      }
      
      // Update current process if it matches
      if (state.currentProcess && state.currentProcess.id === processId) {
        state.currentProcess.status = status;
      }
    },
    
    // Add process event
    addProcessEvent: (state, action: PayloadAction<{processId: number, event: ProcessEvent}>) => {
      const { processId, event } = action.payload;
      
      // Add to active processes
      const processIndex = state.activeProcesses.findIndex(process => process.id === processId);
      if (processIndex !== -1) {
        state.activeProcesses[processIndex].events.push(event);
      }
      
      // Add to current process if it matches
      if (state.currentProcess && state.currentProcess.id === processId) {
        state.currentProcess.events.push(event);
      }
    },
    
    // Handle process initialization
    processInitialized: (state, action: PayloadAction<{processId: number, orderId: number}>) => {
      // This will typically trigger a fetch of the full process details
      // rather than constructing a partial object
      console.log('Process initialized:', action.payload);
    },
    
    // Handle verification submission
    verificationSubmitted: (state, action: PayloadAction<{processId: number}>) => {
      console.log('Verification submitted for process:', action.payload.processId);
    },
    
    // Handle new photo request
    newPhotoRequested: (state, action: PayloadAction<{processId: number, reason?: string}>) => {
      console.log('New photo requested for process:', action.payload);
    },
    
    // Handle process cancellation
    processCancelled: (state, action: PayloadAction<{processId: number}>) => {
      const { processId } = action.payload;
      
      // Update status in active processes
      const processIndex = state.activeProcesses.findIndex(process => process.id === processId);
      if (processIndex !== -1) {
        state.activeProcesses[processIndex].status = ProcessStatus.CANCELLED;
      }
      
      // Update current process if it matches
      if (state.currentProcess && state.currentProcess.id === processId) {
        state.currentProcess.status = ProcessStatus.CANCELLED;
      }
      
      console.log('Process cancelled:', processId);
    },
    
    // Handle payment events
    paymentInitiated: (state, action: PayloadAction<{processId: number}>) => {
      console.log('Payment initiated for process:', action.payload.processId);
    },
    
    paymentCompleted: (state, action: PayloadAction<{processId: number}>) => {
      const { processId } = action.payload;
      
      // Update status in active processes
      const processIndex = state.activeProcesses.findIndex(process => process.id === processId);
      if (processIndex !== -1) {
        state.activeProcesses[processIndex].status = ProcessStatus.PAID;
      }
      
      // Update current process if it matches
      if (state.currentProcess && state.currentProcess.id === processId) {
        state.currentProcess.status = ProcessStatus.PAID;
      }
      
      console.log('Payment completed for process:', processId);
    },
    
    paymentFailed: (state, action: PayloadAction<{processId: number, errorMessage?: string}>) => {
      console.log('Payment failed for process:', action.payload);
    }
  }
});

// Export actions
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

// Export reducer
export default processSlice.reducer; 