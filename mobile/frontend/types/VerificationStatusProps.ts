export interface VerificationStatusProps {
    isVerified: boolean;
    isPending?: boolean;
    type?: string;
    onPress?: () => void;
  }