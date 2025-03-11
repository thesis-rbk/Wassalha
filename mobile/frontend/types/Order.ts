import { Request } from './Request';
import { User } from './User';
import { GoodsProcess } from './GoodsProcess';

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'ON_HOLD' | 'PAID' | 'REFUNDED' | 'CANCELLED';

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
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    goodsProcess?: GoodsProcess | null;
}
