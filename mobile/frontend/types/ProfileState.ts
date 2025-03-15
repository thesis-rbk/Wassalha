import { ProfileImage } from './ProfileImage';
import { User } from './User';

export interface ProfileState {
  firstName: string;
  lastName: string;
  bio: string;
  country: string;
  phoneNumber: string;
  imageId: number | null;
  image: ProfileImage | null;
  gender: string;
  review: string;
  isAnonymous: boolean;
  isBanned: boolean;
  isVerified: boolean;
  isOnline: boolean;
  preferredCategories: string;
  referralSource: string;
  type?: string; // 'SUBSCRIBER' or 'SPONSOR'
  subscriptionLevel?: string; // 'BASIC' or 'PREMIUM'
  badge?: string
  isSponsor?: boolean;
  
  }
  
