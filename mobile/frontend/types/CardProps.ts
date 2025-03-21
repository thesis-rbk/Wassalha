import { ViewProps } from "react-native";

export interface CardProps extends ViewProps {
  onPress?: () => void
  children?: React.ReactNode
  style?: any
  icon?: React.ReactNode
  title?: string
  iconBackgroundColor?: string
  showChevron?: boolean // Add option to hide chevron for service cards
  variant?: "service" // Add variant prop to switch between styles
}