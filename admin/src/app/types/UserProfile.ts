
export interface UserProfile {
    id: number;
    name: string;
    email: string;
    phoneNumber?: string;
    role: string;
    profile: {
        firstName: string;
        lastName: string;
        image?: {
            url: string;
            type?: string;
            mimeType?: string;
        };
        country?: string;
        gender?: string;
        isBanned: boolean;
        verified: boolean;
        bio?: string;
        review?: string;
    };
}