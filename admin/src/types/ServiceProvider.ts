import { User } from './User';

export interface ServiceProvider {
    id: number;
    userId: number;
    type: 'PENDING_SPONSOR' | 'SPONSOR' | 'SUBSCRIBER';  // Updated to match ServiceProviderType enum
    isVerified: boolean;
    badge?: string;
    subscriptionLevel?: string;
    
    // Verification fields
    idCard?: string;               // Optional: Government ID
    passport?: string;             // Optional: Passport Number
    license?: string;              // Optional: Driving License
    creditCard?: string;           // Optional: Last 4 digits for security
    selfie?: string;               // Optional: Selfie
    questionnaireAnswers?: any;    // Optional: Questionnaire Answers
    
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        serviceProviderId?: number;
        profile?: {
            firstName: string;
            lastName: string;
            bio?: string;
            isBanned: boolean;
            isVerified: boolean;
            isSponsor: boolean;  // Added this field to match the profile schema
            image?: {
                url: string;
            };
        };
    };
    
    // Relationships
    sponsorships?: any[];          // Sponsorships relation
    reviews?: any[];               // Reviews relation
    
    createdAt: string;
    updatedAt: string;
}