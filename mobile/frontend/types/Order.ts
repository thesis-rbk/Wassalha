import { Request } from './Request';
import { User } from './User';
<<<<<<< HEAD
import { GoodsProcess } from './GoodsProcess';

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'ON_HOLD' | 'PAID' | 'REFUNDED' | 'CANCELLED';
=======
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32

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
<<<<<<< HEAD
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    goodsProcess?: GoodsProcess | null;
=======
    paymentStatus: 'ON_HOLD' | 'PAYED' | 'REFUNDED';
    orderStatus: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
}
