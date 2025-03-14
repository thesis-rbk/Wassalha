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
    address: string;
    coordinates: string;
    contactPhoneNumber: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED' | 'DELIVERED';
    scheduledTime: string;
    travelerconfirmed: boolean;
    userconfirmed: boolean;
    order: {
      travelerId: number;
    };
  }