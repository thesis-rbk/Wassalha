import { Order } from './Order';
import { ProcessEvent } from './ProcessEvent';

export enum ProcessStatus {
    INITIALIZED = 'INITIALIZED',
    CONFIRMED = 'CONFIRMED',
    PAID = 'PAID',
    IN_TRANSIT = 'IN_TRANSIT',
    PICKUP_MEET = 'PICKUP_MEET',
    FINALIZED = 'FINALIZED',
    CANCELLED = 'CANCELLED'
}

export interface GoodsProcess {
    id: number;
    orderId: number;
    order: Order;
    status: ProcessStatus;
    createdAt: Date;
    updatedAt: Date;
    events: ProcessEvent[];
}
