export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface TwitterProfile {
  followersCount: number;
  verified: boolean;
}

export interface UserProfile {
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string | string[];
  walletAddress?: string;
  level: number;
  experience: number;
  nextLevelExp: number;
  points: number;
  tweetFrequency: {
    dailyLimit: number;
    currentCount: number;
    lastTweetTime?: number;
  };
  stats: {
    totalTweets: number;
    successfulTweets: number;
    failedTweets: number;
  };
  style?: {
    all: string[];
    chat: string[];
    post: string[];
  };
  adjectives?: string[];
  lore?: string[];
  knowledge?: string[];
  topics?: string[];
}

export interface LoginForm {
  username: string;
  password: string;
  email: string;
}

export interface AgentConfig {
  styles: string[];
  kols: string[];
  quote: string;
}

export interface ProfileUpdateRequest {
  agentId: string;
  profile: UserProfile;
}

export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  data?: {
    profile: UserProfile;
  };
}

export interface ProfileQueryResponse {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    profile: UserProfile;
    twitterProfile: TwitterProfile;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
