import { User } from './User';
export type UserRole = 'SHOPPER' | 'TRAVELER' | 'BOTH' | 'NONE';

export interface UserWithRole extends User {
  role: UserRole;
}