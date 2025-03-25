import { getSocket } from "./SocketService";

/**
 * Send a notification via socket
 */
export const sendSocketNotification = async (
  eventName: string,
  data: any
): Promise<boolean> => {
  console.log(`🔍 NOTIFICATION SERVICE: Attempting to send ${eventName}`, data);
  try {
    const socket = await getSocket("notifications");

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
