<<<<<<< HEAD
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

=======
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
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
