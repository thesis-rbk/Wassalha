import { User } from './User';

export interface Notification {
    id: number;
    userId: number;
    user: User;
    type: 'REQUEST' | 'ACCEPTED' | 'REJECTED' | 'ORDER_CREATED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'PICKUP_SCHEDULE' | 'DELIVERY_COMPLETED' | 'SYSTEM_ALERT';
    title?: string;
    message?: string;
    status: 'READ' | 'UNREAD';
}
