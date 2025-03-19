export interface Sponsorship {
    id: number;
    name: string;
    description?: string;
    price: number;
    duration: number;
    platform: string; // e.g., "YOUTUBE", "TWITTER"
    categoryId: number;
    category: { name: string };
    isActive: boolean;
    sponsorId: number;
    sponsor: ServiceProvider;
    product: string;
    amount: number;
    status: string;
    users: User[];
    sponsorCheckouts: SponsorCheckout[];
    reviews: ReviewSponsor[];
    createdAt: string;
    updatedAt: string;
}

export interface ServiceProvider {
    id: number;
    userId: number;
    user: User;
    type: string;
    isVerified: boolean;
    badge?: string;
    idCard?: string;
    passport?: string;
    license?: string;
    creditCard?: string;
    selfie?: string;
    questionnaireAnswers?: any;
    subscriptionLevel?: string;
    sponsorships: Sponsorship[];
    reviews: ReviewSponsor[];
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: number;
    name: string;
    // Add other user fields as needed
}

export interface SponsorCheckout {
    id: number;
    // Add other fields as needed
}

export interface ReviewSponsor {
    review_id: number;
    reviewer_id: number;
    reviewed_user_id: number;
    sponsorshipRating?: number;
    serviceProviderRating?: number;
    reviewer: Profile;
    reviewed_user: Profile;
    sponsorshipId?: number;
    sponsorship?: Sponsorship;
    serviceProviderId?: number;
    serviceProvider?: ServiceProvider;
    comment?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Profile {
    id: number;
    name: string;
    // Add other profile fields as needed
}
const platformImages = {
    YOUTUBE: { uri: "https://cdn.iconscout.com/icon/free/png-256/free-youtube-104-432560.png" },
    TWITTER: { uri: "https://abs.twimg.com/favicons/twitter.2.ico" },
    INSTAGRAM: { uri: "https://www.instagram.com/static/images/ico/favicon.ico/36b3ee2d91ed.ico" },
    FACEBOOK: { uri: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" },
    TIKTOK: { uri: "https://get-picto.com/wp-content/uploads/2024/02/logo-tiktok-png-sans-fond.webp" },
    OTHER: { uri: "https://cdn-icons-png.flaticon.com/512/5234/5234307.png" }, // Fallback image
} as const;

export default platformImages;

