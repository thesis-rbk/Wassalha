import { User } from "./User";

export interface Profile {
  id?: number;
  userId?: number;
  user?: User;
  firstName: string;
  lastName: string;
  bio?: string;
  country: string;
  phoneNumber: string;
  image: any;
  imageId?: string | null;
  gender?: "MALE" | "FEMALE";
  review?: string;
  isAnonymous?: boolean;
  isBanned?: boolean;
  isVerified?: boolean;
  isOnline?: boolean;
  preferredCategories?: string;
  referralSource?: string;
}