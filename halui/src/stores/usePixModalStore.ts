import { create } from 'zustand';

interface PixModalStore {
  giftModalVisible: boolean;
  tokenModalVisible: boolean;
  setGiftModalVisible: (visible: boolean) => void;
  setTokenModalVisible: (visible: boolean) => void;
}

export const usePixModalStore = create<PixModalStore>(set => ({
  giftModalVisible: false,
  tokenModalVisible: false,
  setGiftModalVisible: (visible: boolean) => set({ giftModalVisible: visible }),
  setTokenModalVisible: (visible: boolean) => set({ tokenModalVisible: visible }),
}));
