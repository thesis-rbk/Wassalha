import { User } from './User';
import { GoodsProcess } from './GoodsProcess';

export interface ProcessEvent {
    id: number;
    goodsProcessId: number;
    goodsProcess: GoodsProcess;
    fromStatus: 'INITIALIZED' | 'CONFIRMED' | 'PAID' | 'IN_TRANSIT' | 'PICKUP_MEET' | 'FINALIZED' | 'CANCELLED';
    toStatus: 'INITIALIZED' | 'CONFIRMED' | 'PAID' | 'IN_TRANSIT' | 'PICKUP_MEET' | 'FINALIZED' | 'CANCELLED';
    changedByUserId?: number;
    changedByUser?: User;
    note?: string;
    createdAt: Date;
}
