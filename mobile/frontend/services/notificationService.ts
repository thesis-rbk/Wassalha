<<<<<<< HEAD
import { getSocket } from './socketService';
=======
import { getSocket } from "@/services/socketService";
>>>>>>> 8de170abdb49de702194fa32e4e815d29309ed75

/**
 * Send a notification via socket
 */
export const sendSocketNotification = async (
  eventName: string,
  data: any
): Promise<boolean> => {
  console.log(`🔍 NOTIFICATION SERVICE: Attempting to send ${eventName}`, data);
  try {
<<<<<<< HEAD
    const socket = await getSocket('notifications');
=======
    const socket = await getSocket("notifications");
>>>>>>> 8de170abdb49de702194fa32e4e815d29309ed75

    if (!socket || !socket.connected) {
      console.log("⚠️ Socket not connected, cannot send notification");
      return false;
    }

    console.log(`📤 Sending notification event: ${eventName}`, data);
    socket.emit(eventName, data);
    return true;
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    return false;
  }
};
