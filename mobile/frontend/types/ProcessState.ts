import { GoodsProcess } from './GoodsProcess';

export interface ProcessState {
  processes: GoodsProcess[];
  currentProcess: GoodsProcess | null;
  loading: boolean;
  error: string | null;
  socketConnected: boolean;
}
