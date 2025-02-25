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
}
