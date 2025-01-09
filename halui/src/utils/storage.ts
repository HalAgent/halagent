import { UserProfile } from '../types/auth';

export const TOKEN_KEY = 'coin_ai_token';
export const USER_KEY = 'coin_ai_user';
export const WALLET_ADDRESS_KEY = 'coin_ai_wallet_address';
export const PRIVATE_KEY_KEY = 'coin_ai_private_key';

export const storage = {
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setUser(user: UserProfile) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser(): UserProfile | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  setWalletAddress(address: string) {
    localStorage.setItem(WALLET_ADDRESS_KEY, address);
  },

  getWalletAddress(): string | null {
    return localStorage.getItem(WALLET_ADDRESS_KEY);
  },

  setPrivateKey(privateKey: string) {
    localStorage.setItem(PRIVATE_KEY_KEY, privateKey);
  },

  getPrivateKey(): string | null {
    return localStorage.getItem(PRIVATE_KEY_KEY);
  },
};
