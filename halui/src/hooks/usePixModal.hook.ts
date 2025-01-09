import { usePixModalStore } from '@/stores/usePixModalStore';

export const usePixModal = () => {
  const { setGiftModalVisible, setTokenModalVisible } = usePixModalStore();

  const openGiftModal = () => {
    setGiftModalVisible(true);
  };

  const openTokenModal = () => {
    setTokenModalVisible(true);
  };

  const closeGiftModal = () => {
    setGiftModalVisible(false);
  };

  const closeTokenModal = () => {
    setTokenModalVisible(false);
  };

  return {
    openGiftModal,
    openTokenModal,
    closeGiftModal,
    closeTokenModal,
  };
};
