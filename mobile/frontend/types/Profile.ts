import { User } from "./User";

export interface Profile {
<<<<<<< HEAD
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
=======
  id: number;
  userId: number;
  user: User;
  firstName: string;
  lastName: string;
  bio?: string;
  imageId?: number;
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
  gender?: "MALE" | "FEMALE";
  review?: string;
  isAnonymous?: boolean;
  isBanned?: boolean;
  isVerified?: boolean;
  isOnline?: boolean;
  preferredCategories?: string;
  referralSource?: string;
<<<<<<< HEAD
}
=======
}
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
