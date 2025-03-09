export interface NotificationProps {
    message: string;
    timestamp: number;
    onAccept?: () => void;
    onRefuse?: () => void;
    onNegotiate?: () => void;
}

export interface Notificationy {
    id: string;
    message: string;
    timestamp: number;
}
