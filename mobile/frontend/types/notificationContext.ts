export interface NotificationContextType {
    fetchNotifications: () => Promise<void>;   // Function to fetch notifications from API
    markAsRead: (id: number) => Promise<void>; // Function to mark a notification as read
    deleteNotification: (id: number) => Promise<void>; // Function to delete a notification
    sendNotification: (eventName: string, data: any) => Promise<boolean>; // NEW: Function to send notifications
    unreadCount: number;                        // Number of unread notifications
}