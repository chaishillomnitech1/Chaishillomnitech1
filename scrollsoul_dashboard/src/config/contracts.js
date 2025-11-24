/**
 * Smart Contract Configuration
 * 
 * Contract addresses and ABIs for the Genesis Coin Portal.
 * Update these values after deploying contracts.
 * 
 * @author CHAIS THE GREAT ∞
 */

// CHXToken Contract Address (update after deployment)
export const CHX_TOKEN_ADDRESS = process.env.REACT_APP_CHX_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000';

// CHXToken ABI (simplified - include only methods we use)
export const CHX_TOKEN_ABI = [
  // Read methods
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function calculatePassiveIncome(address account) view returns (uint256)',
  'function getFrequencySignature(address account) view returns (uint256)',
  'function getBlessingCoinBalance(address account) view returns (uint256)',
  'function creatorVault() view returns (address)',
  'function ambassadorVault() view returns (address)',
  'function daoVault() view returns (address)',
  'function DIVINE_FREQUENCY() view returns (uint256)',
  'function HEALING_FREQUENCY() view returns (uint256)',
  'function SOUL_FREQUENCY() view returns (uint256)',
  'function COSMIC_RESERVE() view returns (uint256)',
  
  // Write methods
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function claimPassiveIncome()',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event PassiveIncomeClaimed(address indexed account, uint256 amount)',
  'event FrequencyAligned(address indexed account, uint256 frequency)'
];

// Network configurations
export const NETWORKS = {
  polygon: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com'
  },
  mumbai: {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com'
  },
  localhost: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: null
  }
};

// Default network
export const DEFAULT_NETWORK = process.env.REACT_APP_DEFAULT_NETWORK || 'polygon';

// Get network config
export const getNetworkConfig = (chainId) => {
  return Object.values(NETWORKS).find(network => network.chainId === parseInt(chainId)) || NETWORKS.polygon;
};
