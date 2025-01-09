import { useUserStore } from '@/stores/useUserStore';
import { authService } from '@/services/auth';
import { useMemo } from 'react';

export function useAgentInfo() {
  const { userProfile, setUserProfile } = useUserStore();

  const refetch = async () => {
    const { profile } = await authService.getProfile(userProfile?.username || '');
    if (profile) {
      setUserProfile(profile);
    }
  };

  const level = useMemo(() => {
    return userProfile?.level || 0;
  }, [userProfile]);

  const experience = useMemo(() => {
    return userProfile?.experience || 0;
  }, [userProfile]);

  const nextLevelExp = useMemo(() => {
    return userProfile?.nextLevelExp || 0;
  }, [userProfile]);

  const points = useMemo(() => {
    return userProfile?.points || 0;
  }, [userProfile]);

  return {
    level,
    experience,
    nextLevelExp,
    points,
    refetch,
  };
}
