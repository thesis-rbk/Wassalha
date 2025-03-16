import { Order } from "./Order";
import { ProcessEvent } from "./ProcessEvent";

export type ProcessStatus =
  | "PREINITIALIZED"
  | "INITIALIZED"
  | "CONFIRMED"
  | "PAID"
  | "IN_TRANSIT"
  | "PICKUP_MEET"
  | "FINALIZED"
  | "CANCELLED";

export interface GoodsProcess {
  id: number;
  orderId: number;
  order: Order;
  status: ProcessStatus;
  createdAt: Date;
  updatedAt: Date;
  events: ProcessEvent[];
}
