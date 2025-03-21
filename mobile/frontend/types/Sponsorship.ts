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
    users: UserS[];
    sponsorCheckouts: SponsorCheckout[];
    reviews: ReviewSponsor[];
    createdAt: string;
    updatedAt: string;
}

export interface ServiceProvider {
    id: number;
    userId: number;
    user: UserS;
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

export interface UserS {
    id: number;
    name: string;
}

export interface SponsorCheckout {
    id: number;
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
export type RouteParams = {
    SponsorshipDetails: {
        id: number
    }
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
export interface SponsorshipDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    platform: string;
    price: string;
    description: string;
    duration: number;
    isActive: boolean;
    reviews: { rating: number; comment: string }[]; // Adjust based on your ReviewSponsor model
}

export interface SponsorshipCardProps {
    id: number // Add the ID prop
    platform: string
    price: string
    description: string
    isActive: boolean
    onPress: () => void
    onBuyPress: () => void
}
