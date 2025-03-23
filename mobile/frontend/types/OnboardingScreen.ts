export interface OnboardingScreenProps {
    image: any;
    title: string;
    description: string;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onSkip: () => void;
    isLastScreen?: boolean;
  }