export type Token = {
  symbol: string;
  name: string;
  balance: number;
  icon: string;
};

export type TransactionType = 'swap' | 'send' | 'receive' | null;

export interface TransactionState {
  isOpen: boolean;
  type: TransactionType;
  tokens: Token[];
  fromToken: Token | null;
  toToken: Token | null;
  fromAddress: string;
  toAddress: string;
  setType: (type: TransactionType) => void;
  openPanel: (type: TransactionType) => void;
  closePanel: () => void;
  setFromToken: (token: Token) => void;
  setToToken: (token: Token) => void;
  setFromAddress: (address: string) => void;
  setToAddress: (address: string) => void;
  swapTokens: () => void;
  setTokens: () => void;
}
