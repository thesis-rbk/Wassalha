import { User } from './User';
export interface ServiceProvider {
    id: number;
    userId: number;
    type: string;
    brandName?: string;
    subscriptionLevel?: string;
    isEligible: boolean;
    followerCount?: number;
    user: User; // Include user data with profile
}