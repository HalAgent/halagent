import { create } from 'zustand';
import { UserProfile, TwitterProfile } from '@/types/auth';

interface UserState {
  // State
  userProfile: UserProfile | null; // UserProfile
  twitterProfile: TwitterProfile | null; // Twitter
  isAuthenticated: boolean; // Authed

  // Operation
  setUserProfile: (profile: UserProfile | null) => void;
  setTwitterProfile: (profile: TwitterProfile | null) => void;
  login: (userProfile: UserProfile) => void;
  logout: (userId: string) => void;
  updateProfile: (profile: UserProfile) => void;

  // Getter
  getUserId: () => string | null;
  getXUsername: () => string | null;
  getXAccessToken: () => string | null;
  getWatchlist: () => string[] | null;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Init State
  userProfile: null,
  twitterProfile: null,
  isAuthenticated: false,

  // Operations
  setUserProfile: profile => set({ userProfile: profile }),

  setTwitterProfile: profile => set({ twitterProfile: profile }),

  login: userProfile => {
    set({
      userProfile,
      isAuthenticated: true,
    });

    // Local Storage
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    //localStorage.setItem('twitterProfile', JSON.stringify(twitterProfile));
    localStorage.setItem('userId', userProfile.userId);
  },

  logout: () => {
    set({
      userProfile: null,
      twitterProfile: null,
      isAuthenticated: false,
    });

    // Clear local storage
    localStorage.removeItem('userProfile');
    localStorage.removeItem('twitterProfile');
    localStorage.removeItem('userId');
  },

  updateProfile: profile => {
    if(!profile) return;
    set({ userProfile: profile });
    localStorage.setItem('userProfile', JSON.stringify(profile));
  },

  // Getter
  getUserId: () => get().userProfile?.userId || null,
  getXUsername: () => get().userProfile?.tweetProfile?.username || null,
  getXAccessToken: () => get().userProfile?.tweetProfile?.accessToken || null,
  getWatchlist: () => get().userProfile?.twitterWatchList?.map(item => item.username) || [],
}));
