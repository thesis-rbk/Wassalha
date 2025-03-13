import { User } from './User';
import { Category } from './Category';

export interface Sponsorship {
    id: number;
    name: string;
    description?: string;
    price: number;
    duration: number;
    platform: 'FACEBOOK' | 'INSTAGRAM' | 'YOUTUBE' | 'TWITTER' | 'TIKTOK' | 'OTHER';
    categoryId: number;
    category: Category;
    isActive: boolean;
    users: User[];
}
