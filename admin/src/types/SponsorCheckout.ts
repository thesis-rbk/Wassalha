export interface SponsorCheckout {
    id: number;
    buyerId: number;
    sponsorshipId: number;
    amount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    sponsorship: {
        id: number;
        platform: string;
        title?: string;
        category: {
            id: number;
            name: string;
        };
        sponsor: {
            id: number;
            name: string;
            email: string;
        };
    };
}
