import { User } from './User';
import { Goods } from './Goods';

export interface Request {
    id: number;
    userId: number;
    user: User;
    goodsId: number;
    goods: Goods;
    quantity: number;
    goodsLocation: string;
    goodsDestination: string;
    pickupId?: number;
    date: Date;
    status: 'PENDING' | 'ACCEPTED' | 'CANCELLED' | 'REJECTED';
    withBox?: boolean;
}
