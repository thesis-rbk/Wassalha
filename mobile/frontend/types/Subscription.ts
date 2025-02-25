import { User } from './User';
import { Category } from './Category';

export interface Subscription {
    id: number;
    name: string;
    description?: string;
    price: number;
    duration: number;
    type: 'STREAMING' | 'SOFTWARE' | 'GAMING' | 'EDUCATION' | 'OTHER';
    categoryId: number;
    category: Category;
    isActive: boolean;
    users: User[];
}
