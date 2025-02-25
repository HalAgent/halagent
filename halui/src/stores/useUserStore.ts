import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types/auth';

interface UserState {
  userProfile: UserProfile | null;

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

      setUserProfile: profile => set({ userProfile: profile }),

      login: userProfile => {
        set({
          userProfile,
        });
        console.warn(window.top !== window.self)
        if(window.top !== window.self) {
            console.warn( window.top);

            window.top?.postMessage({ action: 'user_info', data: userProfile }, '*');
        }
      },

      logout: () => {
        set({
          userProfile: null,
        });
        if(window.top !== window.self) {
            window.top?.postMessage({ action: 'user_info', data: null }, '*');
        }
      },

      updateProfile: profile => {
        const currentProfile = get().userProfile;
        if (!currentProfile) {
          set({ userProfile: profile as UserProfile });
        } else {
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
      partialize: state => ({
        userProfile: state.userProfile,
      }),
    }
  )
);
