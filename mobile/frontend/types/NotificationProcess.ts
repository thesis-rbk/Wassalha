export enum NotificationType {
  REQUEST = "REQUEST",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  ORDER_CREATED = "ORDER_CREATED",
  PAYMENT_INITIATED = "PAYMENT_INITIATED",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_REFUNDED = "PAYMENT_REFUNDED",
  PICKUP_SCHEDULE = "PICKUP_SCHEDULE",
  DELIVERY_COMPLETED = "DELIVERY_COMPLETED",
  SYSTEM_ALERT = "SYSTEM_ALERT"
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