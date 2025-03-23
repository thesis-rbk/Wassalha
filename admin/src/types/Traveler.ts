import { User } from './User';

export interface Traveler {
    id: number;
    userId: number;
    isVerified: boolean;
    idCard: string;
    bankCard: string;
    user: {
        email: string;
        name?: string;
        profile?: {
            firstName?: string;
            lastName?: string;
            gender?: string;
            image?: {
                url: string;
            };
        };
    };
    createdAt: string;
    updatedAt: string;
} 