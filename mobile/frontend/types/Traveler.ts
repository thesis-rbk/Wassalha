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
}

export interface Traveler {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  reputation: TravelerReputation;
  profile: TravelerProfile;
  stats: TravelerStats;
} 
