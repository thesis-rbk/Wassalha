import { Order } from './Order';
import { ProcessEvent } from './ProcessEvent';

export interface GoodsProcess {
    id: number;
    orderId: number;
    order: Order;
    status: 'INITIALIZED' | 'CONFIRMED' | 'PAID' | 'IN_TRANSIT' | 'PICKUP_MEET' | 'FINALIZED' | 'CANCELLED';
    createdAt: Date;
    updatedAt: Date;
    events: ProcessEvent[];
}
