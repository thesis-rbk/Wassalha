export interface PickupMapProps {
  setCoordinates: (coords: { latitude: number; longitude: number } | null) => void;
  setManualAddress: (address: string) => void;
}

export  interface SafeLocation {
  name: string;
  latitude: number;
  longitude: number;
}
export interface Pickup {
  id: number;
  orderId: number;
  pickupType: 'AIRPORT' | 'IN_PERSON' | 'PICKUPPOINT' | 'DELIVERY';
  location: string;
  address: string | null;
  coordinates: string | null;
  contactPhoneNumber: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED' | 'DELIVERED';
  scheduledTime: string;
  travelerconfirmed: boolean;
  userconfirmed: boolean;
  order: {
    id: number;
    requestId: number;
    travelerId: number;
    departureDate: string | null;
    arrivalDate: string | null;
    trackingNumber: string | null;
    totalAmount: number | null;
    paymentStatus: 'ON_HOLD' | 'PAYED' | 'REFUNDED';
    orderStatus: 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED';
    verificationImageId: number | null;
    request: {
      id: number;
      status: string;
      sponsorId: number | null;
      userId: number;
      goodsId: number;
      quantity: number;
      goodsLocation: string;
      goodsDestination: string;
      pickupId: number | null;
      date: string;
      withBox: boolean;
      goods: {
        id: number;
        name: string;
        size: string | null;
        weight: number | null;
        price: number;
        description: string | null;
        imageId: number | null;
        goodsUrl: string | null;
        isVerified: boolean;
        categoryId: number;
      };
      // user field is not present in the response, so we can remove it or make it optional
      user?: {
        id: number;
        name: string;
        email: string;
        phoneNumber: string | null;
        googleId: string | null;
        password: string | null;
        hasCompletedOnboarding: boolean;
        role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
        serviceProviderId: string | null;
        resetToken: string | null;
        resetTokenExpiry: string | null;
        createdAt: string;
        updatedAt: string;
      };
    };
    // Add the traveler field to match the response
    traveler: {
      id: number;
      name: string;
      email: string;
      phoneNumber: string | null;
      googleId: string | null;
      password: string | null;
      hasCompletedOnboarding: boolean;
      role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
      serviceProviderId: string | null;
      resetToken: string | null;
      resetTokenExpiry: string | null;
      createdAt: string;
      updatedAt: string;
    };
  };
  qrCode?: string;
  goodsName?: string;
  travelerName?: string; // Added to match the response
  // requesterName is not present in the response, so we can remove it or keep it optional
  requesterName?: string;
}