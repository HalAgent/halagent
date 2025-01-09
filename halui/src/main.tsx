import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'virtual:uno.css'

import { WalletProvider } from '@solana/wallet-adapter-react';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase';
//import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import "@solana/wallet-adapter-react-ui/styles.css";
//import { CrossmintSolanaWalletAdapter, networkToCrossmintEnvironment } from "@crossmint/connect"


const network = WalletAdapterNetwork.Mainnet;
//const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(network);
const wallets = [
  new PhantomWalletAdapter(),
  new CoinbaseWalletAdapter(),
  //new UnsafeBurnerWalletAdapter(),
  //new CrossmintSolanaWalletAdapter({
  //  environment: networkToCrossmintEnvironment(network)
  //}),
];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <App />
      </WalletProvider>
    </ConnectionProvider>
  </StrictMode>,
)
