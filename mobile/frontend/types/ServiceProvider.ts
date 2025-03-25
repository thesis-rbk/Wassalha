import { User } from './User';

export interface ServiceProvider {
    id: number;
    userId: number;
    user: User;
    type: 'SPONSOR' | 'SUBSCRIBER'; // Add more types if needed
    brandName?: string;
    subscriptionLevel?: string;
    isEligible: boolean;
    followerCount?: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Order {
    id: number;
    amount: number;
    status: string;
    sponsorship: {
        platform: string;
    };
    recipient: {
        name: string;
    };
    createdAt: string
}