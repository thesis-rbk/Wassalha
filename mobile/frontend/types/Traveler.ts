export interface Traveler {
    score: number;
    user: {
        profile: {
            gender: string;
            image?: {
                url?: string;
            };
        };
    };
}