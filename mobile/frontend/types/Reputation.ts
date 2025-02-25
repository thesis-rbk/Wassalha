import { User } from './User';

export interface Reputation {
    id: number;
    userId: number;
    score: number;
    totalRatings: number;
    positiveRatings: number;
    negativeRatings: number;
    level: number;
    lastUpdated: Date;
    createdAt: Date;
    user: User;
}
