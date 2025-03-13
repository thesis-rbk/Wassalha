<<<<<<< HEAD
import { User } from "./User";
import { Goods } from "./Goods";
import { Order } from "./Order";

export type RequestStatus = "PENDING" | "ACCEPTED" | "CANCELLED" | "REJECTED";

export interface Request {
  id: number;
  userId: number;
  user: User;
  goodsId: number;
  goods: Goods;
  quantity: number;
  goodsLocation: string;
  goodsDestination: string;
  pickupId?: number;
  date: Date;
  status: RequestStatus;
  withBox?: boolean;
  order?: Order | null;
=======
import { User } from './User';
import { Goods } from './Goods';

export interface Request {
    id: number;
    userId: number;
    user: User;
    goodsId: number;
    goods: Goods;
    quantity: number;
    goodsLocation: string;
    goodsDestination: string;
    pickupId?: number;
    date: Date;
    status: 'PENDING' | 'ACCEPTED' | 'CANCELLED' | 'REJECTED';
    withBox?: boolean;
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
}
