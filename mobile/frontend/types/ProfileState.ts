import { ProfileImage } from './ProfileImage';

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
  }
  
