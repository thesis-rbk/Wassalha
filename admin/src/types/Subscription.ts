export enum SubscriptionType {
    STREAMING = 'STREAMING',
    SOFTWARE = 'SOFTWARE',
    GAMING = 'GAMING',
    EDUCATION = 'EDUCATION',
    OTHER = 'OTHER'
}

export interface Subscription {
    id: number;
    name: string;
    description?: string;
    price: number;
    duration: number;
    type: SubscriptionType;
    categoryId: number;
    isActive: boolean;
    category?: {
        id: number;
        name: string;
        description?: string;
    };
    users?: Array<{
        id: number;
        name: string;
        email: string;
    }>;
}