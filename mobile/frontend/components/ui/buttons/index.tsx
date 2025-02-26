import { ButtonProps } from '@/types/ButtonProps';
import { BaseButton } from './BaseButton';

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