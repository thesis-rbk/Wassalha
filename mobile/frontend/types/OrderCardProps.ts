export interface OrderCardProps {
    order: {
        id: number;
        status: string;
        createdAt: string;
        updatedAt: string;
    };
    sponsorship: {
        id: number;
        description?: string;  // Made optional to match actual type
        duration: number;     // Added from actual type
        platform: string;
        price: number;
        sponsorId: number;    // Added from actual type
        status: string;       // Added from actual type
        isActive: boolean;    // Added from actual type
        categoryId: number;   // Added from actual type
        updatedAt: string;
        userId: number | null; // Added from actual type
        // Removed image and createdAt since they're not in actual data
    };
    onPress: () => void;
    onPayment: () => void;
    onDelete: () => void;
}