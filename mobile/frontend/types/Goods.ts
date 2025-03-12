// Import Category type
import { Category } from './Category';

export interface Goods {
    id: number;
    name: string;
    size?: string;
    weight?: number;
    price: number;
    description?: string;
    imageId?: number;
    goodsUrl?: string;
    isVerified?: boolean;
    categoryId: number;
    // Add this property to match what the API returns
    image?: {
        id: number;
        url: string;
        filename: string;
        type: string;
        mimeType?: string;
        size?: number;
        width?: number;
        height?: number;
        duration?: number;
        extension?: string;
    };
    category?: Category;
}
