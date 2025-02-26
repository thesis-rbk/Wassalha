import { TouchableOpacityProps } from "react-native";

export interface BaseButtonProps extends TouchableOpacityProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    size?: 'small' | 'medium' | 'large' | 'login';
  }
