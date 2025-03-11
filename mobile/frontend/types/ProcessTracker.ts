import { ProcessStatus } from './GoodsProcess';

export interface ProcessEvent {
  fromStatus: ProcessStatus;
  toStatus: ProcessStatus;
  createdAt: string;
  note?: string;
  changedByUser?: {
    name: string;
  };
}

export interface ProcessTrackerProps {
  currentStatus: ProcessStatus;
  events: ProcessEvent[];
} 