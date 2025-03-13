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
        bio?: string;
        review?: string;
    };
}