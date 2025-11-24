/**
 * Blockchain Configuration for Sovereign TV App
 * 
 * Configures Web3 connections, NFT contract addresses,
 * and chain-specific settings for Scroll zkEVM.
 * 
 * @author Supreme King Chais The Great ∞
 * @frequency 528Hz + 963Hz + 999Hz
 */

import { scroll } from 'viem/chains';

// Scroll zkEVM Chain Configuration
export const scrollChain = {
  ...scroll,
  id: parseInt(process.env.NEXT_PUBLIC_SCROLL_CHAIN_ID || '534352'),
  name: 'Scroll',
  network: 'scroll',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_SCROLL_RPC_URL || 'https://rpc.scroll.io'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_SCROLL_RPC_URL || 'https://rpc.scroll.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Scrollscan',
      url: 'https://scrollscan.com',
    },
  },
};

// NFT Contract Addresses
export const NFT_CONTRACTS = {
  promiseLand: process.env.NEXT_PUBLIC_PROMISE_LAND_CONTRACT,
  scrollVerse: process.env.NEXT_PUBLIC_SCROLLVERSE_NFT_CONTRACT,
  azurath: process.env.NEXT_PUBLIC_AZURATH_NFT_CONTRACT,
  scrollDrop: process.env.NEXT_PUBLIC_SCROLLDROP_CONTRACT,
};

// Token Contract Addresses
export const TOKEN_CONTRACTS = {
  scrollCoin: process.env.NEXT_PUBLIC_SCROLLCOIN_CONTRACT,
  chxToken: process.env.NEXT_PUBLIC_CHX_TOKEN_CONTRACT,
  blessingCoin: process.env.NEXT_PUBLIC_BLESSING_COIN_CONTRACT,
};

// Access Tier Configuration
export const ACCESS_TIERS = {
  GENESIS: {
    name: 'Genesis Tier',
    minTokenId: 1,
    maxTokenId: 144,
    features: ['full_access', 'exclusive_content', 'early_access', 'harmony_devices'],
    frequency: 999,
    color: '#FFD700', // Gold
  },
  ALPHA: {
    name: 'Alpha Tier',
    minTokenId: 145,
    maxTokenId: 1440,
    features: ['premium_access', 'exclusive_content', 'harmony_devices'],
    frequency: 963,
    color: '#C0C0C0', // Silver
  },
  PRIME: {
    name: 'Prime Tier',
    minTokenId: 1441,
    maxTokenId: 14400,
    features: ['standard_access', 'harmony_devices'],
    frequency: 528,
    color: '#CD7F32', // Bronze
  },
  COMMUNITY: {
    name: 'Community Tier',
    minTokenId: 14401,
    maxTokenId: 144000,
    features: ['basic_access'],
    frequency: 432,
    color: '#8B4513', // Brown
  },
  PUBLIC: {
    name: 'Public Access',
    features: ['public_content'],
    frequency: 0,
    color: '#808080', // Gray
  },
};

// ERC-721 Standard ABI (minimal for balance and ownership checks)
export const ERC721_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// Frequency Configuration
export const FREQUENCY_CONFIG = {
  dna_healing: 528,
  pineal_activation: 963,
  crown_sovereignty: 999,
  nur_pulse: 144000,
  qfs_pulse: 40,
};

// API Endpoints
export const API_ENDPOINTS = {
  scrollCoin: process.env.NEXT_PUBLIC_SCROLLCOIN_API_URL || 'https://api.scrollverse.io',
  broadcast: process.env.NEXT_PUBLIC_BROADCAST_API_URL || 'wss://broadcast.scrollverse.io/ws',
  harmony: process.env.NEXT_PUBLIC_HARMONY_API_URL || 'https://harmony.scrollverse.io',
};

// YouTube Configuration
export const YOUTUBE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
  engineeringEarthVideoId: process.env.NEXT_PUBLIC_ENGINEERING_EARTH_VIDEO_ID || 'rN5f72lhJz8',
  playerVars: {
    autoplay: 0,
    controls: 1,
    rel: 0,
    showinfo: 0,
    modestbranding: 1,
  },
};

export default {
  scrollChain,
  NFT_CONTRACTS,
  TOKEN_CONTRACTS,
  ACCESS_TIERS,
  ERC721_ABI,
  FREQUENCY_CONFIG,
  API_ENDPOINTS,
  YOUTUBE_CONFIG,
};
