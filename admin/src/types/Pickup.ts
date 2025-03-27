export enum PickupType {
  AIRPORT = 'AIRPORT',
  IN_PERSON = 'IN_PERSON',
  PICKUPPOINT = 'PICKUPPOINT',
  DELIVERY = 'DELIVERY'
}

export enum PickupStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DELAYED = 'DELAYED',
  DELIVERED = 'DELIVERED'
}

export interface Pickup {
    id: number;
    orderId: number;
    pickupType: PickupType;
    location?: string;
    address?: string;
    qrCode?: string;
    coordinates?: string;
    contactPhoneNumber?: string;
    travelerconfirmed: boolean;
    userconfirmed: boolean;
    status: PickupStatus;
    scheduledTime?: string;
    order?: {
        request?: {
            userId: number;
        };
        travelerId?: number;
    };
    pickupSuggestions?: Array<{
        id: number;
        userId: number;
        pickupType: PickupType;
        location?: string;
        scheduledTime?: string;
        createdAt: string;
        user: {
            id: number;
            name: string;
        };
    }>;
}