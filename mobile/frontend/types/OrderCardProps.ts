export interface OrderCardProps {
    order: {
        id: number;
        status: string;
        createdAt: string;
        updatedAt: string;
        client: {
            id: number;
            name: string;
            email: string;
            phone: string;
            address: string;
        };
        delivery: {
            id: number;
            name: string;
            email: string;
            phone: string;
            address: string;
        };
        // ... other order properties
    };
    sponsorship: {
        id: number;
        price: number;
        platform: string;
        description: string;
        image: string;
        createdAt: string;
        updatedAt: string;  
        // ... other sponsorship properties
    };
    onPress: () => void;
    onPayment: () => void;
    onDelete: () => void;
}