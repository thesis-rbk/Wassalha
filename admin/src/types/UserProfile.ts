import { UserRole } from './User';

export interface UserProfile {
    id: number;
    email: string;
    name?: string;
    role: UserRole;
    profile: {
        firstName: string;
        lastName: string;
        phoneNumber?: string;
        image?: {
            url: string;
            type?: string;
            mimeType?: string;
        };
        country?: string;
        gender?: string;
        isBanned: boolean;
        isVerified: boolean;
        isSponsor: boolean;
        bio?: string;
        review?: string;
    };
    serviceProvider?: {
        id: number;
        type: 'PENDING_SPONSOR' | 'SPONSOR' | 'SUBSCRIBER';
        isVerified: boolean;
        badge?: string;
        subscriptionLevel?: string;
        idCard?: string;
        passport?: string;
        license?: string;
        creditCard?: string;
        selfie?: string;
    };
}