export interface ResponseData<T> {
  data: T;
  message: string;
  success: boolean;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface WatchProfile {
  userId: string;
  username: string;
  name: string;
  avatar: string;
  biography: string;
  isBlueVerified: boolean;
}

export interface TwitterProfile {
  followersCount: number;
  verified: boolean;
}

export interface Tag {
  id: string;
}

export interface WatchItem {
  username: string;
  avatar: string;
  name: string;
  tags: string[];
}

export interface UserProfile {
  userId: string;
  gmail?: string;
  gender?: string
  agentname: string;
  bio?: string | string[];
  walletAddress?: string;
  level: number;
  experience: number;
  nextLevelExp: number;
  points: number;
  tweetProfile?: {
    username: string;
    email: string;
    avatar?: string;
    code: string;
    codeVerifier: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  twitterWatchList?: WatchItem[];
  tweetFrequency: {
    dailyLimit: number;
    currentCount: number;
    lastTweetTime?: number;
  };
  agentCfg?: {
    enabled: boolean;
    interval: string;
    imitate: string;
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
