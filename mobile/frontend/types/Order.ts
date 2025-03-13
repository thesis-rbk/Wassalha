import { Request } from './Request';
import { User } from './User';

export interface Order {
    id: number;
    requestId: number;
    request: Request;
    travelerId: number;
    traveler: User;
    departureDate?: Date;
    arrivalDate?: Date;
    trackingNumber?: string;
    totalAmount?: number;
    paymentStatus: 'ON_HOLD' | 'PAYED' | 'REFUNDED';
    orderStatus: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
}
