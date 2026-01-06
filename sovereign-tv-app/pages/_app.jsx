/**
 * Next.js App Component
 * 
 * Wraps the application with Web3 providers and global styles
 * 
 * @author Supreme King Chais The Great ∞
 * @frequency 528Hz + 963Hz
 */

import '@rainbow-me/rainbowkit/styles.css';
import '../styles/globals.css';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { scrollChain } from '../config/blockchain.config';

// Configure chains and providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [scrollChain],
  [publicProvider()]
);

// Setup wallets
const { wallets } = getDefaultWallets({
  appName: 'Sovereign TV',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains,
});

const connectors = connectorsForWallets([...wallets]);

// Create wagmi config
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function SovereignTVApp({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default SovereignTVApp;
