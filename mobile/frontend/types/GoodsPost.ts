import { Category } from './Category';

export interface GoodsPost {
    id: number;
    title?: string;
    content?: string;
    travelerId: number;
    traveler: {
        firstName: string;
        lastName: string;
        gender?: "MALE" | "FEMALE";
        imageUrl?: string;
    };
    arrivalDate?: Date;
    availableKg?: number;
    phoneNumber?: string;
    airportLocation?: string;
    categoryId?: number;
    category?: Category;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}