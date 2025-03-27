export interface Payment {
    id: number;
    orderId: number;
    amount: number;
    currency: 'USD' | 'EUR' | 'TND'; // PaymentCurrency enum
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUND' | 'PROCCESSING'; // PaymentState enum
    paymentMethod: 'CARD' | 'D17' | 'STRIPE' | 'PAYPAL' | 'BANKTRANSFER'; // PaymentMethod enum
    transactionId?: string;
    qrCode?: string;
    paymentUrl?: string;
}