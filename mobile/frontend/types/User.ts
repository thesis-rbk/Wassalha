// mobile/frontend/types/User.ts
import { Profile } from './Profile';
import { Request } from './Request';
import { Notification } from './Notification';
import { Review } from './Review';
import { Chat } from './Chat';
import { Message } from './Message';
import { Order } from './Order';
import { Subscription } from './Subscription';
import { Sponsorship } from './Sponsorship';
import { Reputation } from './Reputation';
import { GoodsPost } from './GoodsPost';
import { PromoPost } from './PromoPost';
import { ProcessEvent } from './ProcessEvent';
import { ServiceProvider } from './ServiceProvider';

export interface User {
    id: number;
    name: string;
    email: string;
    phoneNumber?: string;
    googleId?: string;
    password?: string;

    profile?: Profile;
    requests?: Request[];
    notifications?: Notification[];
    reviewsGiven?: Review[];
    reviewsReceived?: Review[];
    chatsRequested?: Chat[];
    chatsProvided?: Chat[];
    messagesSent?: Message[];
    ordersTraveling?: Order[];
    subscriptions?: Subscription[];
    sponsorships?: Sponsorship[];
    reputation?: Reputation;
    goodsPosts?: GoodsPost[];
    promoPosts?: PromoPost[];
    processEvents?: ProcessEvent[];
    serviceProvider?: ServiceProvider;
}