export interface ProgressBarProps {
  currentStep: number;
  steps: Array<{
    id: number;
    title: string;
    icon: string;
  }>;
}
