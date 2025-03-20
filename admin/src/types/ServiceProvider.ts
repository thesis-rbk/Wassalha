import { User } from './User';

export interface ServiceProvider {
    id: number;
    userId: number;
    type: 'PENDING_SPONSOR' | 'SPONSOR' | 'SUBSCRIBER';  // Updated to match ServiceProviderType enum
    isVerified: boolean;
    badge?: string;
    subscriptionLevel?: string;
    creditCardId?: string;
    idCardNumber?: string;
    licenseNumber?: string;
    passportNumber?: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        serviceProviderId?: number;
        profile?: {
            firstName: string;
            lastName: string;
            bio?: string;
            isBanned: boolean;
            isVerified: boolean;
            isSponsor: boolean;  // Added this field to match the profile schema
            image?: {
                url: string;
            };
        };
    };
    createdAt: string;
    updatedAt: string;
}