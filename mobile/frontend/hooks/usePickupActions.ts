import { useState } from "react";
import axiosInstance from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pickup } from "../types/Pickup";
import { generateQRCodeData } from "./qrCodeUtils";
import io from "socket.io-client";

export const usePickupActions = (pickups: Pickup[], setPickups: (pickups: Pickup[]) => void, userId?: number) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState<string>("");

  const handleAccept = async (pickupId: number): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");
  
      const pickup = pickups.find((p) => p.id === pickupId);
      if (!pickup) throw new Error("Pickup not found");
  
      let qrCode = "";
      if ((pickup.userconfirmed && !pickup.travelerconfirmed) || (!pickup.userconfirmed && pickup.travelerconfirmed)) {
        qrCode = await generateQRCodeData(pickup, userId!);
      }
  
      const response = await axiosInstance.put(
        "/api/pickup/accept",
        { pickupId, qrCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const updatedPickup = response.data.pickup; // Backend returns { message, pickup }
  
      // Emit Socket.IO event for real-time update
      const socket = io(process.env.EXPO_PUBLIC_API_URL, { transports: ["websocket"] }); // Adjust URL if needed
      socket.emit("pickupAccepted", updatedPickup);
      console.log(`✅ Emitted pickupAccepted for pickup:${pickupId}`);
  
      // Update local state with backend data
      setPickups(
        pickups.map((p) =>
          p.id === pickupId
            ? {
                ...p,
                ...updatedPickup, // Use full backend response to ensure accuracy
              }
            : p
        )
      );
  
      // Show QR code if applicable
      if ((pickup.userconfirmed || pickup.travelerconfirmed) && updatedPickup.qrCode) {
        setQRCodeData(updatedPickup.qrCode);
        setShowQRCode(true);
      }
  
      alert("Pickup accepted!");
    } catch (error) {
      console.error("Error accepting pickup:", error);
      alert("Failed to accept pickup. Please try again.");
    }
  };

  const showStoredQRCode = async (pickup: Pickup): Promise<void> => {
    try {
      if (pickup.qrCode) {
        setQRCodeData(pickup.qrCode);
        setShowQRCode(true);
        return;
      }

      const qrCode = await generateQRCodeData(pickup, userId!);
      const token = await AsyncStorage.getItem("jwtToken");
      if (token) {
        await axiosInstance.put(
          "/api/pickup/update-qr",
          { pickupId: pickup.id, qrCode },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setQRCodeData(qrCode);
      setShowQRCode(true);
    } catch (error) {
      console.error("Error showing QR code:", error);
      alert("Failed to generate QR code. Please try again.");
    }
  };

  return {
    handleAccept,
    showStoredQRCode,
    showQRCode,
    setShowQRCode,
    qrCodeData,
  };
};