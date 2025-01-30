import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types/auth';

interface UserState {
  userProfile: UserProfile | null;
  isAuthenticated: boolean;

  setUserProfile: (profile: UserProfile | null) => void;
  login: (userProfile: UserProfile) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;

  getUserId: () => string | null;
  getXUsername: () => string | null;
  getXAccessToken: () => string | null;
  getWatchlist: () => string[];
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      userProfile: null,
      isAuthenticated: false,

      setUserProfile: profile => set({ userProfile: profile }),


      login: userProfile => {
        set({
          userProfile,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          userProfile: null,
          isAuthenticated: false,
        });
      },

      updateProfile: profile => {
        const currentProfile = get().userProfile;
        if (!currentProfile) {
            set({ userProfile: profile as UserProfile })
        }else{
            set({ userProfile: { ...currentProfile, ...profile } });
        }
      },

      getUserId: () => get().userProfile?.userId || null,
      getXUsername: () => get().userProfile?.tweetProfile?.username || null,
      getXAccessToken: () => get().userProfile?.tweetProfile?.accessToken || null,
      getWatchlist: () => get().userProfile?.twitterWatchList?.map(item => item.username) || [],
    }),
    {
      name: 'user-store', // Key used in localStorage
      partialize: (state) => ({
        userProfile: state.userProfile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
