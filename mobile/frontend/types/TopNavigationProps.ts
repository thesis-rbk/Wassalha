export interface TopNavigationProps {
  title: string;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  profileName?: string;
}
