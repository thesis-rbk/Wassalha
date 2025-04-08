interface NewPasswordValidationProps {
  email?: string;
  verificationCode: string;
  onSuccess: () => void;
  remainingTime: number;
  isTimerActive: boolean;
}
