export interface Subscription {
    id: number;
    name: string;
    description?: string;
    price: number;
    duration: number;
    type: string;
}