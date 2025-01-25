//import { Message } from '../types/chat';
import { ResponseData } from '@/types/auth';
import api from './axios';
import { useUserStore } from '@/stores/useUserStore';
import { XUserProfile } from '@/types/account';

interface WatchResponse {
  items: {
    token: string;
    title: string;
    text: string;
    updatedAt: string;
    user: 'agent';
    action: 'NONE';
  }[];
  cursor: string;
  hasMore: boolean;
}

class WatchApi {
  private cursor: string = '';
  private hasMore: boolean = true;

  // reset
  reset() {
    this.cursor = '';
    this.hasMore = true;
  }

  // Check more
  hasMoreData(): boolean {
    return this.hasMore;
  }

  // Get from server
  async getWatchList(): Promise<WatchResponse['items']> {
    if (!this.hasMore) {
      return [];
    }

    try {
      const response = await api.post(`/watch`, {
        cursor: this.cursor,
      });
      const data: WatchResponse = response.data.data.watchlist;

      // Update
      this.cursor = data.cursor;
      this.hasMore = data.hasMore;

      // set for each item
      return data.items.map(item => ({
        ...item,
        user: 'agent' as const,
        action: 'NONE' as const,
      }));
    } catch (error) {
      console.error('Error fetching watch list:', error);
      return [];
    }
  }

  // Get watch text by my watchlist
  async getMyWatchList(): Promise<WatchResponse['items']> {
    if (!this.hasMore) {
      return [];
    }
    const watchlist = useUserStore.getState().getWatchlist();
    const uID = useUserStore.getState().getUserId();

    try {
      const response = await api.post(`/watch`, {
        watchlist: watchlist,
        cursor: this.cursor,
        userId: uID,
      });
      const data: WatchResponse = response.data.data.watchlist;
      const profile = response.data.data.profile;
      // console.log('profile:', JSON.stringify(profile));
      useUserStore.getState().updateProfile(profile);
      // Update
      this.cursor = data.cursor;
      this.hasMore = data.hasMore;

      // set for each item
      return data.items.map(item => ({
        ...item,
        user: 'agent' as const,
        action: 'NONE' as const,
      }));
    } catch (error) {
      console.error('Error fetching watch list:', error);
      return [];
    }
  }

  /**
   * Search the twitter profiles by word of username
   * @returns Array of profiles
   */
  async searchTwitterProfiles(username: string, count: number, userId: string): Promise<ResponseData<XUserProfile[]>> {
    try {
      const response = await api.post(`/twitter_profile_search`, { username, count, userId });
      return response.data;
    } catch (error) {
      console.error('Search tw user error:', error);
      throw error;
    }
  }

  async reTweeted(text: string, userId: string): Promise<string> {
      try {
        const response = await api.post(`/re_twitter`, { text, userId });
        return response.data;
      } catch (error) {
        console.error('reTweeted error:', error);
        throw error;
      }
  }

  async translateText(text: string): Promise<string> {
    try {
      //console.log('translateText: 000 ', text);
      const response = await api.post(`/translate_text`, { text });
      //console.log('translateText: 111 ', response.data.data.result);
      return response.data.data.result;
    } catch (error) {
      console.error('reTweeted error:', error);
      throw error;
    }
  }
}

export const watchApi = new WatchApi();
