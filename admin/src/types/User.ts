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
        review?: string;
    }
}
