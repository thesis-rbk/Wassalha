import { User } from './User';

export interface ServiceProvider {
    id: number;
    userId: number;
    type: 'SPONSOR' | 'SUBSCRIBER';  // From ServiceProviderType enum
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
        isSponsor: boolean;
        serviceProviderId?: number;
        role: string;
        profile?: {
            firstName: string;
            lastName: string;
            bio?: string;
            isBanned: boolean;
            isVerified: boolean;
            image?: {
                url: string;
            };
        };
    };
    createdAt: string;
    updatedAt: string;
}