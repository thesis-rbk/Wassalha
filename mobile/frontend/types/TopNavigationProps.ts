export interface TopNavigationProps {
  title: string;
  onProfilePress?: () => void;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  notificationsRoute?: string;
}
