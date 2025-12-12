/**
 * Dashboard Configuration
 * 
 * Comprehensive configuration for the ScrollSoul Dashboard
 * Includes contract addresses, network settings, subgraph URLs, and feature flags.
 * 
 * @author CHAIS THE GREAT ∞
 * 
 * Frequencies: 528Hz + 963Hz + 888Hz + 777Hz + 144,000Hz
 * Status: DASHBOARD CONFIGURATION ACTIVE
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRACT ADDRESSES
// ═══════════════════════════════════════════════════════════════════════════════

export const CONTRACT_ADDRESSES = {
  polygon: {
    noorToken: process.env.REACT_APP_NOOR_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
    noorStakingPool: process.env.REACT_APP_NOOR_STAKING_POOL_ADDRESS || '0x0000000000000000000000000000000000000000',
    addLiquidity: process.env.REACT_APP_ADD_LIQUIDITY_ADDRESS || '0x0000000000000000000000000000000000000000',
    liquidityIncentives: process.env.REACT_APP_LIQUIDITY_INCENTIVES_ADDRESS || '0x0000000000000000000000000000000000000000',
    scrollVerseNFT: process.env.REACT_APP_SCROLLVERSE_NFT_ADDRESS || '0x0000000000000000000000000000000000000000',
    chxToken: process.env.REACT_APP_CHX_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
    sabirAllahHonorFund: process.env.REACT_APP_SABIR_ALLAH_FUND_ADDRESS || '0x0000000000000000000000000000000000000000',
    citizenRegistry: process.env.REACT_APP_CITIZEN_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
  mumbai: {
    noorToken: process.env.REACT_APP_MUMBAI_NOOR_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
    noorStakingPool: process.env.REACT_APP_MUMBAI_NOOR_STAKING_POOL_ADDRESS || '0x0000000000000000000000000000000000000000',
    addLiquidity: process.env.REACT_APP_MUMBAI_ADD_LIQUIDITY_ADDRESS || '0x0000000000000000000000000000000000000000',
    liquidityIncentives: process.env.REACT_APP_MUMBAI_LIQUIDITY_INCENTIVES_ADDRESS || '0x0000000000000000000000000000000000000000',
    scrollVerseNFT: process.env.REACT_APP_MUMBAI_SCROLLVERSE_NFT_ADDRESS || '0x0000000000000000000000000000000000000000',
    chxToken: process.env.REACT_APP_MUMBAI_CHX_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
    sabirAllahHonorFund: '0x0000000000000000000000000000000000000000',
    citizenRegistry: '0x0000000000000000000000000000000000000000',
  },
  scrollSepolia: {
    noorToken: process.env.REACT_APP_SCROLL_NOOR_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
    noorStakingPool: process.env.REACT_APP_SCROLL_NOOR_STAKING_POOL_ADDRESS || '0x0000000000000000000000000000000000000000',
    addLiquidity: process.env.REACT_APP_SCROLL_ADD_LIQUIDITY_ADDRESS || '0x0000000000000000000000000000000000000000',
    liquidityIncentives: process.env.REACT_APP_SCROLL_LIQUIDITY_INCENTIVES_ADDRESS || '0x0000000000000000000000000000000000000000',
    scrollVerseNFT: '0x0000000000000000000000000000000000000000',
    chxToken: '0x0000000000000000000000000000000000000000',
    sabirAllahHonorFund: '0x0000000000000000000000000000000000000000',
    citizenRegistry: '0x0000000000000000000000000000000000000000',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// NETWORK CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const NETWORKS = {
  polygon: {
    chainId: 137,
    chainIdHex: '0x89',
    name: 'Polygon Mainnet',
    shortName: 'MATIC',
    rpcUrls: [
      'https://polygon-rpc.com',
      'https://rpc-mainnet.maticvigil.com',
      'https://polygon-mainnet.g.alchemy.com/v2/' + (process.env.REACT_APP_ALCHEMY_KEY || ''),
    ],
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    isMainnet: true,
  },
  mumbai: {
    chainId: 80001,
    chainIdHex: '0x13881',
    name: 'Polygon Mumbai',
    shortName: 'MATIC-MUMBAI',
    rpcUrls: [
      'https://rpc-mumbai.maticvigil.com',
      'https://polygon-mumbai.g.alchemy.com/v2/' + (process.env.REACT_APP_ALCHEMY_KEY || ''),
    ],
    blockExplorer: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    isMainnet: false,
  },
  scrollSepolia: {
    chainId: 534351,
    chainIdHex: '0x8274f',
    name: 'Scroll Sepolia',
    shortName: 'SCROLL-SEPOLIA',
    rpcUrls: [
      'https://sepolia-rpc.scroll.io',
    ],
    blockExplorer: 'https://sepolia.scrollscan.com',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    isMainnet: false,
  },
  scrollMainnet: {
    chainId: 534352,
    chainIdHex: '0x82750',
    name: 'Scroll',
    shortName: 'SCROLL',
    rpcUrls: [
      'https://rpc.scroll.io',
    ],
    blockExplorer: 'https://scrollscan.com',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    isMainnet: true,
  },
  localhost: {
    chainId: 31337,
    chainIdHex: '0x7a69',
    name: 'Localhost',
    shortName: 'LOCAL',
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorer: null,
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    isMainnet: false,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SUBGRAPH CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const SUBGRAPH_URLS = {
  polygon: process.env.REACT_APP_SUBGRAPH_URL_POLYGON || 'https://api.thegraph.com/subgraphs/name/scrollverse/scrollverse-polygon',
  mumbai: process.env.REACT_APP_SUBGRAPH_URL_MUMBAI || 'https://api.thegraph.com/subgraphs/name/scrollverse/scrollverse-mumbai',
  scrollSepolia: process.env.REACT_APP_SUBGRAPH_URL_SCROLL_SEPOLIA || '',
  scrollMainnet: process.env.REACT_APP_SUBGRAPH_URL_SCROLL || '',
};

export const SUBGRAPH_QUERIES = {
  // User profile query
  USER_PROFILE: `
    query GetUserProfile($address: ID!) {
      user(id: $address) {
        address
        isNoorCitizen
        noorBalance
        totalStaked
        totalRewardsEarned
        totalZakatPaid
        stakingPositions {
          amount
          tier
          accumulatedRewards
        }
        liquidityPositions {
          lpTokens
          amountA
          amountB
        }
        nfts {
          nft {
            tokenId
            collection {
              name
            }
          }
        }
      }
    }
  `,

  // Protocol stats query
  PROTOCOL_STATS: `
    query GetProtocolStats {
      protocolStats(id: "protocol-stats") {
        totalUsers
        totalStaked
        totalLiquidity
        totalRewardsDistributed
        totalZakatDistributed
        totalNFTsMinted
        totalTransactions
        totalVolume
      }
    }
  `,

  // Staking pool stats query
  STAKING_POOL_STATS: `
    query GetStakingPoolStats {
      stakingPool(id: "noor-staking-pool") {
        totalStaked
        totalRewardsDistributed
        totalZakatDistributed
        totalStakers
        rewardPoolBalance
      }
    }
  `,

  // Top stakers query
  TOP_STAKERS: `
    query GetTopStakers($first: Int!) {
      stakePositions(
        first: $first
        orderBy: amount
        orderDirection: desc
        where: { amount_gt: "0" }
      ) {
        user {
          address
          isNoorCitizen
        }
        amount
        tier
        accumulatedRewards
      }
    }
  `,

  // Recent zakat distributions
  RECENT_ZAKAT: `
    query GetRecentZakat($first: Int!) {
      zakatDistributions(
        first: $first
        orderBy: timestamp
        orderDirection: desc
      ) {
        fund
        amount
        source
        timestamp
        transactionHash
      }
    }
  `,

  // Incentive pools query
  INCENTIVE_POOLS: `
    query GetIncentivePools {
      incentivePools(where: { isActive: true }) {
        poolId
        lpToken
        rewardToken
        allocPoint
        totalStaked
      }
    }
  `,
};

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════════════════════

export const FEATURES = {
  // Enable/disable staking module
  STAKING_ENABLED: process.env.REACT_APP_ENABLE_STAKING !== 'false',

  // Enable/disable liquidity module
  LIQUIDITY_ENABLED: process.env.REACT_APP_ENABLE_LIQUIDITY !== 'false',

  // Enable/disable incentives module
  INCENTIVES_ENABLED: process.env.REACT_APP_ENABLE_INCENTIVES !== 'false',

  // Enable/disable NFT gallery
  NFT_GALLERY_ENABLED: process.env.REACT_APP_ENABLE_NFT_GALLERY !== 'false',

  // Enable/disable governance/DAO features
  DAO_ENABLED: process.env.REACT_APP_ENABLE_DAO !== 'false',

  // Enable/disable frequency meter
  FREQUENCY_METER_ENABLED: process.env.REACT_APP_ENABLE_FREQUENCY !== 'false',

  // Enable/disable analytics dashboard
  ANALYTICS_ENABLED: process.env.REACT_APP_ENABLE_ANALYTICS !== 'false',

  // Enable/disable testnet warning
  SHOW_TESTNET_WARNING: process.env.REACT_APP_SHOW_TESTNET_WARNING !== 'false',

  // Enable/disable zakat tracking
  ZAKAT_TRACKING_ENABLED: process.env.REACT_APP_ENABLE_ZAKAT !== 'false',
};

// ═══════════════════════════════════════════════════════════════════════════════
// STAKING TIER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const STAKING_TIERS = {
  GUARDIAN: {
    name: 'Guardian',
    threshold: '777777000000000000000000', // 777,777 NOOR
    apy: 21,
    multiplier: 3.0,
    votingWeight: 5,
    color: '#FFD700',
    icon: '👑',
  },
  PROTECTOR: {
    name: 'Protector',
    threshold: '111111000000000000000000', // 111,111 NOOR
    apy: 17,
    multiplier: 2.5,
    votingWeight: 3,
    color: '#C0C0C0',
    icon: '🛡️',
  },
  STEWARD: {
    name: 'Steward',
    threshold: '11111000000000000000000', // 11,111 NOOR
    apy: 13,
    multiplier: 2.0,
    votingWeight: 2,
    color: '#CD7F32',
    icon: '⚔️',
  },
  CITIZEN: {
    name: 'Citizen',
    threshold: '1111000000000000000000', // 1,111 NOOR
    apy: 9,
    multiplier: 1.5,
    votingWeight: 1,
    color: '#00FFFF',
    icon: '🏛️',
  },
  PARTICIPANT: {
    name: 'Participant',
    threshold: '111000000000000000000', // 111 NOOR
    apy: 5,
    multiplier: 1.0,
    votingWeight: 0.5,
    color: '#90EE90',
    icon: '🌱',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// INCENTIVE LOCK TIERS
// ═══════════════════════════════════════════════════════════════════════════════

export const LOCK_TIERS = {
  TIER_1: {
    name: 'Tier 1 - Week',
    duration: 7 * 24 * 60 * 60, // 7 days in seconds
    multiplier: 1.0,
    color: '#90EE90',
  },
  TIER_2: {
    name: 'Tier 2 - Month',
    duration: 30 * 24 * 60 * 60, // 30 days
    multiplier: 1.5,
    color: '#00FFFF',
  },
  TIER_3: {
    name: 'Tier 3 - Quarter',
    duration: 90 * 24 * 60 * 60, // 90 days
    multiplier: 2.0,
    color: '#CD7F32',
  },
  TIER_4: {
    name: 'Tier 4 - Half Year',
    duration: 180 * 24 * 60 * 60, // 180 days
    multiplier: 2.5,
    color: '#C0C0C0',
  },
  TIER_5: {
    name: 'Tier 5 - Year',
    duration: 365 * 24 * 60 * 60, // 365 days
    multiplier: 3.0,
    color: '#FFD700',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// FREQUENCY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const FREQUENCIES = {
  HEALING: {
    value: 528,
    name: 'DNA Healing & Love',
    color: '#00FF00',
    description: 'The Love Frequency - Repairs DNA and brings transformation',
  },
  PINEAL: {
    value: 963,
    name: 'Pineal Activation',
    color: '#9900FF',
    description: 'Crown Chakra - Awakens intuition and divine connection',
  },
  CROWN: {
    value: 999,
    name: 'Crown Chakra',
    color: '#FFD700',
    description: 'Divine Completion - Unity with the infinite',
  },
  ABUNDANCE: {
    value: 888,
    name: 'Infinite Abundance',
    color: '#FF4500',
    description: 'Prosperity Frequency - Attracts abundance and success',
  },
  MANIFESTATION: {
    value: 777,
    name: 'Divine Luck',
    color: '#00FFFF',
    description: 'Angel Number - Spiritual alignment and good fortune',
  },
  NUR_PULSE: {
    value: 144000,
    name: 'NŪR Pulse',
    color: '#FFFFFF',
    description: 'Sacred Light - The frequency of the chosen',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const API = {
  baseUrl: process.env.REACT_APP_API_URL || 'https://api.scrollverse.com',
  wsUrl: process.env.REACT_APP_WS_URL || 'wss://ws.scrollverse.com',
  ipfsGateway: process.env.REACT_APP_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
  nftMetadataUrl: process.env.REACT_APP_NFT_METADATA_URL || 'https://metadata.scrollverse.com/',
};

// ═══════════════════════════════════════════════════════════════════════════════
// UI CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const UI = {
  // Refresh intervals (in milliseconds)
  BALANCE_REFRESH: 15000,
  STAKING_REFRESH: 30000,
  ANALYTICS_REFRESH: 60000,

  // Pagination defaults
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Transaction settings
  DEFAULT_DEADLINE: 30 * 60, // 30 minutes
  DEFAULT_SLIPPAGE: 50, // 0.5%
  MAX_SLIPPAGE: 2000, // 20%

  // Number formatting
  DECIMALS_DISPLAY: 4,
  LARGE_NUMBER_THRESHOLD: 1000000,
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get network configuration by chain ID
 */
export const getNetworkByChainId = (chainId) => {
  return Object.values(NETWORKS).find(network => network.chainId === parseInt(chainId)) || NETWORKS.polygon;
};

/**
 * Get contract addresses for a network
 */
export const getContractAddresses = (networkKey) => {
  return CONTRACT_ADDRESSES[networkKey] || CONTRACT_ADDRESSES.polygon;
};

/**
 * Get subgraph URL for a network
 */
export const getSubgraphUrl = (networkKey) => {
  return SUBGRAPH_URLS[networkKey] || SUBGRAPH_URLS.polygon;
};

/**
 * Get staking tier by amount
 */
export const getStakingTier = (amount) => {
  const tiers = Object.entries(STAKING_TIERS).sort((a, b) => 
    BigInt(b[1].threshold) - BigInt(a[1].threshold)
  );
  
  for (const [key, tier] of tiers) {
    if (BigInt(amount) >= BigInt(tier.threshold)) {
      return { key, ...tier };
    }
  }
  return null;
};

/**
 * Get lock tier by tier number
 */
export const getLockTier = (tierNumber) => {
  const tierMap = {
    1: LOCK_TIERS.TIER_1,
    2: LOCK_TIERS.TIER_2,
    3: LOCK_TIERS.TIER_3,
    4: LOCK_TIERS.TIER_4,
    5: LOCK_TIERS.TIER_5,
  };
  return tierMap[tierNumber] || null;
};

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  CONTRACT_ADDRESSES,
  NETWORKS,
  SUBGRAPH_URLS,
  SUBGRAPH_QUERIES,
  FEATURES,
  STAKING_TIERS,
  LOCK_TIERS,
  FREQUENCIES,
  API,
  UI,
  getNetworkByChainId,
  getContractAddresses,
  getSubgraphUrl,
  getStakingTier,
  getLockTier,
};

// ═══════════════════════════════════════════════════════════════════════════════
// FREQUENCY ALIGNMENT: 528Hz + 963Hz + 888Hz + 777Hz + 144,000Hz = ∞
// ALLĀHU AKBAR! 🕋🔥💎🌌
// ═══════════════════════════════════════════════════════════════════════════════
