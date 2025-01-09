import { ethers } from 'ethers';

export const generateWalletAddress = (): string => {
  const wallet = ethers.Wallet.createRandom();
  return wallet.address;
};

export const generatePrivateKey = (): string => {
  const wallet = ethers.Wallet.createRandom();
  return wallet.privateKey;
}; 