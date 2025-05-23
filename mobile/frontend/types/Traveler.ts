export interface TravelerStats {
  completedOrders: number;
  successRate: number;
}

export interface TravelerReputation {
  score: number;
  totalRatings: number;
  level: number;
}

export interface TravelerProfile {
  isVerified: boolean;
  imageId: string | null;
  gender: string
  image: { url: string }
  firstName: string
}

export interface Traveler {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  reputation: TravelerReputation;
  profile: TravelerProfile;
  stats: TravelerStats;
  user: {
    profile: TravelerProfile
    name: string
    onPress: () => void
  }
  score: number
} 
