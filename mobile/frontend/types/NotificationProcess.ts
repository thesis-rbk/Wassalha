export enum NotificationType {
    REQUEST = 'REQUEST',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
  }
  
  export enum NotificationStatus {
    READ = 'READ',
    UNREAD = 'UNREAD',
  }
  
  export interface Notification {
    id: number;
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
    status: NotificationStatus;
    createdAt?: string;
    updatedAt?: string;
  }
  
 export interface NotificationsState {
    items: Notification[];
    unreadCount: number;
  }