export interface Payment {
    id: number;
    orderId: number;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
}