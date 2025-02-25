import { BaseButton } from './BaseButton';
import { TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

export function SmallButton(props: ButtonProps) {
  return <BaseButton size="small" {...props} />;
}

export function MediumButton(props: ButtonProps) {
  return <BaseButton size="medium" {...props} />;
}

export function BigButton(props: ButtonProps) {
  return <BaseButton size="large" {...props} />;
}

export function LoginButton(props: ButtonProps) {
  return <BaseButton size="login" {...props} />;
} 