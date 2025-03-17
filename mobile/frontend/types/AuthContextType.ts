import { User } from './User';  

export type AuthContextType = {
    user: User | null;
    loading: boolean;
  };