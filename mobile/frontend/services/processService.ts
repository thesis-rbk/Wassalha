import { getSocket } from "@/services/Socketservice";
import { ProcessStatus } from "@/types/GoodsProcess";

/**
 * Connect to process socket and join a specific process room
 */
export const joinProcessRoom = async (processId: number): Promise<boolean> => {
  try {
    const socket = await getSocket("process");
    
    if (!socket || !socket.connected) {
      console.log("⚠️ Process socket not connected, cannot join room");
      return false;
    }
    
    console.log(`🔄 Joining process room for process ${processId}`);
    socket.emit("join_process_room", { processId });
    return true;
  } catch (error) {
    console.error("❌ Error joining process room:", error);
    return false;
  }
};

/**
 * Update process status via socket
 */
export const updateProcessStatus = async (
  processId: number, 
  status: ProcessStatus
): Promise<boolean> => {
  try {
    const socket = await getSocket("process");
    
    if (!socket || !socket.connected) {
      console.log("⚠️ Process socket not connected, cannot update status");
      return false;
    }
    
    console.log(`🔄 Updating process ${processId} status to ${status}`);
    socket.emit("update_process_status", { processId, status });
    return true;
  } catch (error) {
    console.error("❌ Error updating process status:", error);
    return false;
  }
};

/**
 * Submit verification photo for a process
 */
export const submitVerificationPhoto = async (processId: number): Promise<boolean> => {
  try {
    const socket = await getSocket("process");
    
    if (!socket || !socket.connected) {
      console.log("⚠️ Process socket not connected, cannot submit verification");
      return false;
    }
    
    console.log(`📸 Submitting verification photo for process ${processId}`);
    socket.emit("submit_verification_photo", { processId });
    return true;
  } catch (error) {
    console.error("❌ Error submitting verification photo:", error);
    return false;
  }
};

/**
 * Request a new verification photo
 */
export const requestNewPhoto = async (
  processId: number, 
  reason?: string
): Promise<boolean> => {
  try {
    const socket = await getSocket("process");
    
    if (!socket || !socket.connected) {
      console.log("⚠️ Process socket not connected, cannot request new photo");
      return false;
    }
    
    console.log(`📷 Requesting new photo for process ${processId}`);
    socket.emit("request_new_photo", { processId, reason });
    return true;
  } catch (error) {
    console.error("❌ Error requesting new photo:", error);
    return false;
  }
};

/**
 * Cancel a process
 */
export const cancelProcess = async (processId: number): Promise<boolean> => {
  try {
    const socket = await getSocket("process");
    
    if (!socket || !socket.connected) {
      console.log("⚠️ Process socket not connected, cannot cancel process");
      return false;
    }
    
    console.log(`❌ Cancelling process ${processId}`);
    socket.emit("cancel_process", { processId });
    return true;
  } catch (error) {
    console.error("❌ Error cancelling process:", error);
    return false;
  }
};

/**
 * Notify that payment has been initiated
 */
export const initiatePayment = async (processId: number): Promise<boolean> => {
  try {
    const socket = await getSocket("process");
    
    if (!socket || !socket.connected) {
      console.log("⚠️ Process socket not connected, cannot initiate payment");
      return false;
    }
    
    console.log(`💰 Initiating payment for process ${processId}`);
    socket.emit("payment_initiated", { processId });
    return true;
  } catch (error) {
    console.error("❌ Error initiating payment:", error);
    return false;
  }
};

/**
 * Notify that payment has been completed
 */
export const completePayment = async (processId: number): Promise<boolean> => {
  try {
    const socket = await getSocket("process");
    
    if (!socket || !socket.connected) {
      console.log("⚠️ Process socket not connected, cannot complete payment");
      return false;
    }
    
    console.log(`✅ Completing payment for process ${processId}`);
    socket.emit("payment_completed", { processId });
    return true;
  } catch (error) {
    console.error("❌ Error completing payment:", error);
    return false;
  }
};

/**
 * Notify that payment has failed
 */
export const failPayment = async (
  processId: number, 
  errorMessage?: string
): Promise<boolean> => {
  try {
    const socket = await getSocket("process");
    
    if (!socket || !socket.connected) {
      console.log("⚠️ Process socket not connected, cannot report payment failure");
      return false;
    }
    
    console.log(`❌ Reporting payment failure for process ${processId}`);
    socket.emit("payment_failed", { processId, errorMessage });
    return true;
  } catch (error) {
    console.error("❌ Error reporting payment failure:", error);
    return false;
  }
};