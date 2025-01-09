import { create } from 'zustand';
import { TransactionState } from '../types/assets';
import Eth from '../assets/ETH.svg';
import Btc from '../assets/BTC.svg';
import Polygon from '../assets/Polygon.svg';

const mockTokens = [
  { symbol: 'ETH', name: 'Ethereum', balance: 2, icon: Eth },
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.001, icon: Btc },
  { symbol: 'POL', name: 'Polygon', balance: 1000, icon: Polygon },
];

export const useTransactionStore = create<TransactionState>(set => ({
  isOpen: false,
  type: null,
  tokens: mockTokens,
  fromToken: mockTokens[0],
  toToken: mockTokens[1],
  fromAddress: '',
  toAddress: '',

  setType: type => set({ type }),

  openPanel: type =>
    set({
      isOpen: true,
      type,
      fromToken: mockTokens[0],
      toToken: mockTokens[1],
    }),

  closePanel: () =>
    set({
      isOpen: false,
      type: null,
    }),

  setTokens: () => set({ tokens: mockTokens }),

  setFromToken: token => set({ fromToken: token }),

  setToToken: token => set({ toToken: token }),

  setFromAddress: address => set({ fromAddress: address }),

  setToAddress: address => set({ toAddress: address }),

  swapTokens: () =>
    set(state => ({
      fromToken: state.toToken,
      toToken: state.fromToken,
    })),

  sendTokens: () =>
    set(state => ({
      fromAddress: state.toAddress,
      toAddress: state.fromAddress,
    })),
}));
