export type Sponsorship = {
    id: number;
    name: string;
    price: number;
    description: string;
    status: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    category: { name: string };
    platform: string;
    recipient?: {
        name: string; // Optional because we won't fetch recipient if active
    };
};

