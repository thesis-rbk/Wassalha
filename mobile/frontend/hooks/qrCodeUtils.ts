import axiosInstance from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pickup } from "../types/Pickup";
import { OrderDetails } from "../types/OrderDetails";


export const generateQRCodeData = async (pickup: Pickup, userId: number): Promise<string> => {
  try {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) throw new Error("No authentication token found");

    console.log(pickup.orderId, "pickup order ID");

    const orderResponse = await axiosInstance.get<{ success: boolean; data: OrderDetails }>(
      `/api/orders/${pickup.orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const order = orderResponse.data.data;

    return JSON.stringify({
      pickupNumber: pickup.id,
      orderNumber: order.id,
      requesterName: order.request.user.name,
      travelerName: order.traveler.name,
      goodsName: order.request.goods?.name,
    });
  } catch (error) {
    console.error("Error generating QR code data:", error);
    return JSON.stringify({
      pickupNumber: pickup.id,
      orderNumber: pickup.orderId,
      requesterName: "Unknown",
      travelerName: "Unknown",
      goodsName: "Unknown",
    });
  }
};