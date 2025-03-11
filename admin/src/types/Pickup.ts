export interface Pickup {
    id: number;
    orderId: number;
    pickupType: string; // Adjust according to your pickup model
    location?: string;
    address?: string;
    // qrCode?: string;
    coordinates?: string;
    contactPhoneNumber?: string;
    status: string; // Adjust according to your pickup model
    scheduledTime?: string; // Adjust according to your pickup model
}