import { create } from 'zustand';
import { UserProfile, TwitterProfile } from '@/types/auth';

interface UserState {
  // state
  userProfile: UserProfile | null;
  twitterProfile: TwitterProfile | null; // Twitter
  isAuthenticated: boolean;

  // Operation
  setUserProfile: (profile: UserProfile | null) => void; //set profile
  setTwitterProfile: (profile: TwitterProfile | null) => void; // set Twitter
  login: (userProfile: UserProfile, twitterProfile: TwitterProfile) => void; // login
  logout: () => void; // logout
  updateProfile: (profile: UserProfile) => void; // user profile

  // getter
  getUserId: () => string | null; // get userID
}

export const useUserStore = create<UserState>((set, get) => ({
  // init state
  userProfile: null,
  twitterProfile: null,
  isAuthenticated: false,

  setUserProfile: profile => set({ userProfile: profile }),

  setTwitterProfile: profile => set({ twitterProfile: profile }),

  login: (userProfile, twitterProfile) => {
    set({
      userProfile,
      twitterProfile,
      isAuthenticated: true,
    });

    // local
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    localStorage.setItem('twitterProfile', JSON.stringify(twitterProfile));
    localStorage.setItem('userId', userProfile.username);
  },

  logout: () => {
    set({
      userProfile: null,
      twitterProfile: null,
      isAuthenticated: false,
    });

    // clear
    localStorage.removeItem('userProfile');
    localStorage.removeItem('twitterProfile');
    localStorage.removeItem('userId');
  },

  updateProfile: profile => {
    set({ userProfile: profile });
    localStorage.setItem('userProfile', JSON.stringify(profile));
  },

  getUserId: () => get().userProfile?.username || null,
}));
