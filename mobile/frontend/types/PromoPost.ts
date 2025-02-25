import { User } from './User';
import { Category } from './Category';

export interface PromoPost {
    id: number;
    title: string;
    content: string;
    publisherId: number;
    publisher: User;
    categoryId?: number;
    category?: Category;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}