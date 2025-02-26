export type StatusType = 'success' | 'danger' | 'warning';
export interface StatusIndicatorProps {
    status: StatusType;
    label: string;
  }
  