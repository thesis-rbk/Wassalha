export interface NotificationProps {
    message: string;
    timestamp: number;
    onAccept?: () => void;
    onRefuse?: () => void;
    onNegotiate?: () => void;
    senderId?: number;
    type?: string;
    title?: string;
    requestId?: number;
    orderId?: number;
    pickupId?: number;
}

export interface Notificationy {
    id: string;
    message: string;
    timestamp: number;
    senderId?: number;
    type?: string;
    title?: string;
    requestId?: number;
    orderId?: number;
    pickupId?: number;
}
