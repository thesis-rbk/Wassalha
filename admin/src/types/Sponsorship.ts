export enum SponsorshipPlatform {
    FACEBOOK = 'FACEBOOK',
    INSTAGRAM = 'INSTAGRAM',
    YOUTUBE = 'YOUTUBE',
    TWITTER = 'TWITTER',
    TIKTOK = 'TIKTOK',
    OTHER = 'OTHER'
}

export interface Sponsorship {
    id: number;
    description?: string;
    price: number;
    duration: number;
    platform: SponsorshipPlatform;
    categoryId: number;
    isActive: boolean;
    sponsorId: number;
    status: string;
    userId?: number;
    
    // Relationships
    category?: {
        id: number;
        name: string;
        description?: string;
    };
    sponsor?: {
        id: number;
        userId: number;
        type: string;
        isVerified: boolean;
        badge?: string;
        subscriptionLevel?: string;
    };
    users?: Array<{
        id: number;
        name: string;
        email: string;
    }>;
}