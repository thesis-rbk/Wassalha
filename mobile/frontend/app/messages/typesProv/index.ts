export interface DeliveryRequest {
  id: string;
  title: string;
  description: string;
  price: number;
  origin: string;
  destination: string;
  imageUrl: string;
  status: "pending" | "accepted" | "in-progress" | "completed";
  createdAt: string;
  userId: string;
}

export interface TravelerOffer {
  id: string;
  travelerId: string;
  travelerName: string;
  travelerRating: number;
  travelerImage: string;
  price: number;
  estimatedDeliveryDate: string;
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  rating: number;
  completedDeliveries: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface PaymentDetails {
  id: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "refunded";
  createdAt: string;
  completedAt?: string;
}

export type DeliveryStatus =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed";
