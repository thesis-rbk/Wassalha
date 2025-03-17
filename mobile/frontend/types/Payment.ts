export interface PaymentFormProps {
    onSubmit: (formData: PaymentFormData) => void;
    amount: number; // Added amount prop
}

export interface PaymentFormData {
    email: string;
    cardNumber: string;
    cardExpiryMm: string;
    cardExpiryYyyy: string;
    cardCvc: string;
    cardholderName: string;
    postalCode: string;
    amount?: number; // Added amount field
}

export interface RouteParams {
    id: number;
}