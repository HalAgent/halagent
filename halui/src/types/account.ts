//import { Tag } from './auth';

export type XUserProfile = {
  avatar: string;
  banner: string;
  biography: string;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  mediaCount: number;
  isPrivate: boolean;
  isVerified: boolean;
  isWatched: boolean;
  likesCount: number;
  listedCount: number;
  location: string;
  name: string;
  pinnedTweetIds: string[];
  tweetsCount: number;
  url: string;
  userId: string;
  username: string;
  isBlueVerified: boolean;
  canDm: boolean;
  joined: Date; // You may want to parse the string to a Date object
  website: string;
  tags: string[];
};
