import axiosInstance from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pickup } from "../types/Pickup";
import { OrderDetails } from "../types/OrderDetails";

// Ensure the QR code data has a standardized, consistent format
export const generateQRCodeData = async (pickup: Pickup, userId: number): Promise<string> => {
  try {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) throw new Error("No authentication token found");

    console.log(`Generating QR code for pickup ID: ${pickup.id}, order ID: ${pickup.orderId}`);

    // Create a fallback QR code with basic information
    const fallbackData = {
      pickupNumber: pickup.id,
      orderNumber: pickup.orderId,
      requesterName: "Unknown",
      travelerName: "Unknown",
      goodsName: "Unknown",
      timestamp: new Date().toISOString()
    };

    try {
      const orderResponse = await axiosInstance.get<{ success: boolean; data: OrderDetails }>(
        `/api/orders/${pickup.orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!orderResponse.data.success || !orderResponse.data.data) {
        console.error("Order API response unsuccessful:", orderResponse.data);
        return JSON.stringify(fallbackData);
      }

      const order = orderResponse.data.data;
      console.log("Order details fetched:", order.id);

      if (!order || !order.request || !order.traveler) {
        console.error("Order data incomplete:", order);
        return JSON.stringify(fallbackData);
      }

      // Create a standardized QR code format with all necessary data
      const qrData = {
        pickupNumber: pickup.id,
        orderNumber: order.id,
        requesterName: order.request.user?.name || "Unknown Requester",
        travelerName: order.traveler?.name || "Unknown Traveler",
        goodsName: order.request.goods?.name || "Unknown Item",
        timestamp: new Date().toISOString()
      };

      console.log("Generated QR data:", qrData);
      return JSON.stringify(qrData);
    } catch (error) {
      console.error("Error fetching order details:", error);
      return JSON.stringify(fallbackData);
    }
  } catch (error) {
    console.error("Error in generateQRCodeData:", error);
    // Fall back to basic data if anything fails
    return JSON.stringify({
      pickupNumber: pickup.id,
      orderNumber: pickup.orderId,
      requesterName: "Unknown",
      travelerName: "Unknown",
      goodsName: "Unknown",
      timestamp: new Date().toISOString()
    });
  }
};