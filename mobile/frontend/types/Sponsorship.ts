import {
    GestureResponderEvent,
} from 'react-native';
export interface Sponsorship {
    id: number;
    amount: number;
    status: string; // Top-level status (e.g., "PENDING", "CONFIRMED")
    createdAt: string;
    updatedAt: string;
    recipientId: number;
    duration: string
    recipient: {
        id: number;
        name: string;
        email: string;
        googleId: string | null;
        hasCompletedOnboarding: boolean;
        password: string;
        phoneNumber: string | null;
        role: string;
        serviceProviderId: number | null;
        createdAt: string;
        updatedAt: string;
    };
    serviceProviderId: number;
    sponsorshipId: number;
    sponsorship: {
        id: number;
        description?: string;
        duration: number;
        platform: string; // e.g., "TIKTOK"
        price: number;
        sponsorId: number;
        status: string; // Nested status (e.g., "pending")
        isActive: boolean;
        categoryId: number;
        updatedAt: string;
        userId: number | null;
    };
    // Optional fields from your original interface
    name?: string;
    category?: { name: string };
    product?: string;
    users?: UserSponsor[];
    sponsorCheckouts?: SponsorCheckout[];
    reviews?: ReviewSponsor[];
    sponsor?: ServiceProvider;
    sponsorId: number
    onPayment?: () => void; // Corrected to be a function
    platform: string;
    description: string;
    price: number;
    isActive: boolean;
}
export interface DecodedToken {
    sub?: string;
    id?: string;
}
export interface ServiceProvider {
    id: number;
    userId: number;
    user: UserSponsor;
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

export interface UserSponsor {
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
    reviewer: ProfileSponsor;
    reviewed_user: ProfileSponsor;
    sponsorshipId?: number;
    sponsorship?: Sponsorship;
    serviceProviderId?: number;
    serviceProvider?: ServiceProvider;
    comment?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProfileSponsor {
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
    duration: string
    onPress: () => void
    onBuyPress: () => void
    sponsorship: {
        description?: string;
        amount?: number;
    }
}
interface User {
    id: number
}
export interface OrderSponsor {
    id: number;
    recipientId: number;
    serviceProviderId: number;
    sponsorshipId: number;
    amount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    recipient?: User;
    serviceProvider?: ServiceProvider;
    sponsorship?: Sponsorship;
}
export interface Order {
    id: number;
    amount: number;
    status: string;
    sponsorship: {
        platform: string;
    };
    recipient: {
        name: string;
    };
}

export interface OrderCardProps {
    order: Order;
    onPress?: () => void;
    onAccept?: () => void;
    onReject?: () => void;
}
export interface AccountDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (details: { type: string; details: string | { email: string; password: string } }) => void;
}


export interface OrderfetchCardProps {
    order: {
        id: number;
        status: string;
        sponsorId: number | null;
        userId: number;
        goodsId: number;
        quantity: number;
        goodsLocation: string;
        goodsDestination: string;
        pickupId: number;
        date: string;
        withBox: boolean;
        user: {
            id: number;
            name: string;
            email: string;
            profile: {
                image: { url: string }
            }
            reputation: number | null;
        };
        goods: {
            id: number;
            name: string;
            size: string;
            weight: number;
            price: number;
            description: string;
            imageId: number | null;
            goodsUrl: string | null;
            isVerified: boolean;
            categoryId: number;
            image: {
                url: string;
            };
        };
        pickup: {
            id: number;
            orderId: number;
            pickupType: string;
            location: string;
            address: string;
            qrCode: string | null;
            coordinates: string;
            contactPhoneNumber: string;
            travelerconfirmed: boolean;
            userconfirmed: boolean;
            status: string;
            scheduledTime: string;
        };
    };
    onPress: () => void;
}

export interface CardProps {
    title: string;
    description: string;
    imageUrl: string;
    onPress?: () => void; // For handling button press
}


export interface HeaderProps {
    title: string;
    subtitle: string;
    onBackPress?: (event: GestureResponderEvent) => void;
    onNextPress?: (event: GestureResponderEvent) => void; // New prop for next button
    showBackButton?: boolean;
    showNextButton?: boolean; // New prop to control next button visibility
    backButtonTitle?: string;
    nextButtonTitle?: string; // New prop for next button text
}

export interface BonusProps {
    name: string
    bonusAmount: number
    currency?: string
}

export interface CardInfo {
    cardNumber: string
    cardHolder: string
    expiryDate: string
    cvv: string
}