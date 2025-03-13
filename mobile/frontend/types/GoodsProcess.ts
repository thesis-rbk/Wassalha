import { Order } from './Order';
import { ProcessEvent } from './ProcessEvent';

<<<<<<< HEAD
export type ProcessStatus = 'INITIALIZED' | 'CONFIRMED' | 'PAID' | 'IN_TRANSIT' | 'PICKUP_MEET' | 'FINALIZED' | 'CANCELLED';

=======
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
export interface GoodsProcess {
    id: number;
    orderId: number;
    order: Order;
<<<<<<< HEAD
    status: ProcessStatus;
=======
    status: 'INITIALIZED' | 'CONFIRMED' | 'PAID' | 'IN_TRANSIT' | 'PICKUP_MEET' | 'FINALIZED' | 'CANCELLED';
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
    createdAt: Date;
    updatedAt: Date;
    events: ProcessEvent[];
}
