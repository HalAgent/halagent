import { XUserProfile } from '@/types/account';
import { useRef, useState } from 'react';
import { watchApi } from '@/services/watch';
import { useUserStore } from '@/stores/useUserStore';
import { WatchItem } from '@/types/auth';
import { authService } from '@/services/auth';

export const useGetXList = () => {
  const username = 'shawmakesmagic';
  const count = 10;
  const [xList, setXList] = useState<XUserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const { getUserId, userProfile, setUserProfile } = useUserStore();
  const userId = getUserId();
  const followHandlerList = useRef<string[]>([]);

  const initList = async () => {
    setLoading(true);
    try {
      if (userId && username) {
        const response = await watchApi.searchTwitterProfiles(username, count, userId);
        setXList(response?.data || []);
      } else {
        throw 'error: miss user info';
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const searchUser = async (keyword: string, count?: number) => {
    setLoading(true);
    try {
      if (userId && username) {
        const response = await watchApi.searchTwitterProfiles(keyword, count || 10, userId);
        setXList(response?.data || []);
      } else {
        throw 'error: miss user info';
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const refresh = async () => {
    initList();
  };

  const TwitterProfileKols = async () => {
    setLoading(true);
    try {
      if (userId) {
        const response = await watchApi.searchTwitterProfileKols(userId);
        setXList(response?.data || []);
      } else {
        throw 'error: miss user info';
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const onFollow = async (
    account: WatchItem & {
      isWatched: boolean;
    }
  ) => {
    if (followHandlerList.current.includes(account.username)) return;
    followHandlerList.current.push(account.username);
    try {
      if (userProfile) {
        const originTwitterWatchList = userProfile.twitterWatchList || [];
        let tempTwitterWatchList = [] as WatchItem[];
        if (account.isWatched) {
          tempTwitterWatchList = originTwitterWatchList?.filter(item => item.username !== account.username);
        } else {
          originTwitterWatchList.push({ username: account.username, name: account.name, tags: account.tags, avatar: account.avatar });
          tempTwitterWatchList = [...originTwitterWatchList];
        }
        const params = {
          ...userProfile,
          twitterWatchList: tempTwitterWatchList,
        };
        await authService.updateProfile(userProfile?.userId, params);
        setUserProfile(params);
        setXList(
          xList.map(item => {
            if (item.username === account.username) {
              item.isWatched = !item.isWatched;
            }
            return {
              ...item,
            };
          })
        );
      } else {
        console.log('userProfile', userProfile);
      }
    } finally {
      followHandlerList.current = followHandlerList.current.filter(item => item !== account.username);
    }
  };

  return {
    xList,
    setXList,
    loading,
    searchUser,
    TwitterProfileKols,
    refresh,
    onFollow,
  };
};
