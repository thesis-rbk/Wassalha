import { useState } from "react";
import axiosInstance from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pickup } from "../types/Pickup";
import { generateQRCodeData } from "./qrCodeUtils";
import io from "socket.io-client";

export const usePickupActions = (pickups: Pickup[], setPickups: (pickups: Pickup[]) => void, userId?: number) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState<string>("");
  const [currentPickup, setCurrentPickup] = useState<Pickup | null>(null);

  const handleAccept = async (pickupId: number): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const pickup = pickups.find((p) => p.id === pickupId);
      if (!pickup) throw new Error("Pickup not found");

      console.log(`Accepting pickup: ${pickupId}, pickup found:`, pickup);

      let qrCode = "";
      if ((pickup.userconfirmed && !pickup.travelerconfirmed) || (!pickup.userconfirmed && pickup.travelerconfirmed)) {
        qrCode = await generateQRCodeData(pickup, userId!);
      }

      const response = await axiosInstance.put(
        "/api/pickup/accept",
        { pickupId, qrCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedPickup = response.data.pickup;

      // Emit Socket.IO event for real-time update
      const socket = io(`${process.env.EXPO_PUBLIC_API_URL}/pickup`, { transports: ["websocket"] });
      socket.emit("pickupAccepted", updatedPickup);
      console.log(`✅ Emitted pickupAccepted for pickup:${pickupId}`);

      // Update local state with backend data
      setPickups(
        pickups.map((p) =>
          p.id === pickupId
            ? {
                ...p,
                ...updatedPickup,
              }
            : p
        )
      );

      // Store pickup data but don't show QR code automatically
      if ((pickup.userconfirmed || pickup.travelerconfirmed) && updatedPickup.qrCode) {
        setCurrentPickup(updatedPickup);
        setQRCodeData(updatedPickup.qrCode);
        // Removed setShowQRCode(true) to prevent automatic display
      }

      alert("Pickup accepted!");
    } catch (error) {
      console.error("Error accepting pickup:", error);
      alert("Failed to accept pickup. Please try again.");
    }
  };

  const showStoredQRCode = async (pickup: Pickup): Promise<void> => {
    try {
      console.log("Showing QR code for pickup:", pickup.id);
      setCurrentPickup(pickup);
      
      if (pickup.qrCode) {
        console.log("Using existing QR code from pickup");
        setQRCodeData(pickup.qrCode);
        setShowQRCode(true);
        return;
      }

      console.log("Generating new QR code for pickup:", pickup.id);
      const qrCode = await generateQRCodeData(pickup, userId!);
      console.log("Generated QR code data:", qrCode);
      
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

  const handleCancel = async (pickupId: number): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const pickup = pickups.find((p) => p.id === pickupId);
      if (!pickup) throw new Error("Pickup not found");

      const response = await axiosInstance.put(
        "/api/pickup/status",
        { pickupId, newStatus: "CANCELLED" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedPickup = { ...pickup, status: "CANCELLED" }; // Assuming backend doesn't return updated pickup

      // Emit Socket.IO event for real-time update
      const socket = io(`${process.env.EXPO_PUBLIC_API_URL}/pickup`, { transports: ["websocket"] });
      socket.emit("statusUpdate", updatedPickup);
      console.log(`✅ Emitted statusUpdate for pickup:${pickupId} with status: CANCELLED`);

      // Update local state
      setPickups(
        pickups.map((p) =>
          p.id === pickupId
            ? { ...p, status: "CANCELLED" }
            : p
        )
      );

      alert("Pickup cancelled!");
    } catch (error) {
      console.error("Error cancelling pickup:", error);
      alert("Failed to cancel pickup. Please try again.");
    }
  };

  return {
    handleAccept,
    showStoredQRCode,
    showQRCode,
    setShowQRCode,
    qrCodeData,
    handleCancel,
    currentPickup,
  };
};