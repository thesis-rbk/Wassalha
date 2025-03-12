export interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: string;
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