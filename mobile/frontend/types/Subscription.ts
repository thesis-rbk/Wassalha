import { User } from './User';
import { Category } from './Category';
import { Sponsorship } from './Sponsorship';
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
export interface OrderCardProps {
    order: Sponsorship;
    sponsorship: Sponsorship['sponsorship'];
    onPress?: () => void;
    onPayment?: () => void;
    onDelete?: () => void;
}
