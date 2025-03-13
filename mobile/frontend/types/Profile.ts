import { User } from "./User";

export interface Profile {
  id: number;
  userId: number;
  user: User;
  firstName: string;
  lastName: string;
  bio?: string;
  imageId?: number;
  gender?: "MALE" | "FEMALE";
  review?: string;
  isAnonymous?: boolean;
  isBanned?: boolean;
  isVerified?: boolean;
  isOnline?: boolean;
  preferredCategories?: string;
  referralSource?: string;
}
