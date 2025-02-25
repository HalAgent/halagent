//import { Message } from '../types/chat';
import { ResponseData } from '@/types/auth';
import api from './axios';
import { useUserStore } from '@/stores/useUserStore';
import { XUserProfile } from '@/types/account';
import { Message } from '@/types/chat';

export interface WatchResponse {
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

const LOCALSTORAGE_ITEM_WATCHLIST = '_halpha_watchlist_msgs_';
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
    const watchlist = useUserStore.getState().getWatchlist(); // kol list.
    const uID = useUserStore.getState().getUserId();
    const cachedMsgsObj = localStorage.getItem(LOCALSTORAGE_ITEM_WATCHLIST);
    const cachedMsgs = cachedMsgsObj ? JSON.parse(cachedMsgsObj) : [];

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

      // Use the 'msg. updatedAt + msg.title' field as the key to remove duplicates
      const existingMessageIdsSet = new Set(cachedMsgs.map((msg: Message) => (msg.updatedAt ?? '') + msg.title));
      data.items.forEach(msg => {
        if (!existingMessageIdsSet.has((msg.updatedAt ?? '') + msg.title)) {
          cachedMsgs.push(msg);
        }
      });

      cachedMsgs.sort((a: Message, b: Message) => parseInt(a.updatedAt ?? '0') - parseInt(b.updatedAt ?? '0'));

      const len = cachedMsgs.length;
      const msgsToSave = len > 30 ? cachedMsgs.slice(len - 30, len) : cachedMsgs;
      localStorage.setItem(LOCALSTORAGE_ITEM_WATCHLIST, JSON.stringify(msgsToSave));
      return msgsToSave;
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

  async searchTwitterProfileKols(userId: string): Promise<ResponseData<XUserProfile[]>> {
    try {
      const response = await api.post(`/twitter_profile_kols`, { userId });
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
      const response = await api.post(`/translate_text`, { text, languagecode: navigator.language.split('-')[0] });
      //console.log('translateText: 111 ', response.data.data.result);
      return response.data.data.result;
    } catch (error) {
      console.error('reTweeted error:', error);
      throw error;
    }
  }
}

export const watchApi = new WatchApi();
