export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
    id: number;
    email: string;
    name?: string;
    role: UserRole;
    profile?: {
        firstName: string;
        lastName: string;
        bio?: string;
        country?: string;
        phoneNumber?: string;
        image?: {
            url: string;
            type?: string;
            mimeType?: string;
        };
        gender?: string;
        isBanned: boolean;
        isVerified: boolean;
        isSponsor?: boolean;
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
        questionnaireAnswers?: any;
    };
}
