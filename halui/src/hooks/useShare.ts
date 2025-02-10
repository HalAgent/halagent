import { watchApi } from '@/services/watch';
import { useUserStore } from '@/stores/useUserStore';
import { toast } from 'react-toastify';

const useShare = () => {
  const handleShareClick = (text: string) => {
    console.warn('111');

    const userId = useUserStore.getState().getUserId();

    const twitterToken = useUserStore.getState().userProfile?.tweetProfile?.accessToken;
    if (userId && twitterToken) {
      toast('Shared on X');
      watchApi.reTweeted(text, userId ? userId : '');
    } else {
      toast('Please authorize your X account on the Agent page first.');
    }
  };

  return {
    handleShareClick,
  };
};

export default useShare;
