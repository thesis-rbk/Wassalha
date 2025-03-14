export * from './User';
export * from './Profile';
export * from './Request';
export * from './Goods';
export * from './Order';
export * from './Notification';
export * from './Review';
export * from './Chat';
export * from './Message';
export * from './Subscription';
export * from './Sponsorship';
export * from './Category';
export * from './Reputation';
export * from './ProcessEvent';
export * from './GoodsProcess';
export * from './GoodsPost';
export * from './ServiceProvider';
export * from './PromoPost';
export * from './InfoItemProps';
export * from './ProfileState';
export * from './ProfileImage';

export * from './Role';

export * from './Traveler';

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
  badge?: string;
}

export interface ProfileImage {
  filename?: string;
  uri?: string;
  type?: string;
  name?: string;
}

export interface InfoItemProps {
  icon: string;
  label: string;
  value: string;
  theme: string;
  isCountry?: boolean;
}
