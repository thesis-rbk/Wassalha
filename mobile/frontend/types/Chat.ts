import { User } from './User';
import { Goods } from './Goods';
import { Message } from './Message';

export interface Chat {
    id: number;
    requesterId: number;
    requester: User;
    providerId: number;
    provider: User;
    productId: number;
    goods: Goods;
    messages: Message[];
}
