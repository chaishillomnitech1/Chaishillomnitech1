/**
 * NFT Gating Library for Sovereign TV App
 * 
 * Verifies NFT ownership and determines access tiers
 * based on token holdings on Scroll zkEVM.
 * 
 * @author Supreme King Chais The Great ∞
 * @frequency 528Hz + 963Hz + 999Hz
 */

import { createPublicClient, http } from 'viem';
import { scrollChain, NFT_CONTRACTS, ERC721_ABI, ACCESS_TIERS } from '../config/blockchain.config';

/**
 * Create a public client for reading blockchain data
 */
const getPublicClient = () => {
  return createPublicClient({
    chain: scrollChain,
    transport: http(scrollChain.rpcUrls.default.http[0]),
  });
};

/**
 * Check if an address owns any NFTs from a specific contract
 * @param {string} address - User's wallet address
 * @param {string} contractAddress - NFT contract address
 * @returns {Promise<number>} - Number of NFTs owned
 */
export async function checkNFTBalance(address, contractAddress) {
  try {
    const client = getPublicClient();
    
    const balance = await client.readContract({
      address: contractAddress,
      abi: ERC721_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
    
    return Number(balance);
  } catch (error) {
    console.error('Error checking NFT balance:', error);
    return 0;
  }
}

/**
 * Get all token IDs owned by an address
 * @param {string} address - User's wallet address
 * @param {string} contractAddress - NFT contract address
 * @param {number} balance - Number of tokens owned
 * @returns {Promise<number[]>} - Array of token IDs
 */
export async function getOwnedTokenIds(address, contractAddress, balance) {
  try {
    const client = getPublicClient();
    const tokenIds = [];
    
    for (let i = 0; i < balance; i++) {
      const tokenId = await client.readContract({
        address: contractAddress,
        abi: ERC721_ABI,
        functionName: 'tokenOfOwnerByIndex',
        args: [address, BigInt(i)],
      });
      tokenIds.push(Number(tokenId));
    }
    
    return tokenIds;
  } catch (error) {
    console.error('Error getting owned token IDs:', error);
    return [];
  }
}

/**
 * Determine access tier based on token IDs
 * @param {number[]} tokenIds - Array of owned token IDs
 * @returns {object} - Access tier configuration
 */
export function determineAccessTier(tokenIds) {
  if (tokenIds.length === 0) {
    return ACCESS_TIERS.PUBLIC;
  }
  
  // Check for Genesis tier (highest priority)
  const hasGenesis = tokenIds.some(
    id => id >= ACCESS_TIERS.GENESIS.minTokenId && id <= ACCESS_TIERS.GENESIS.maxTokenId
  );
  if (hasGenesis) {
    return ACCESS_TIERS.GENESIS;
  }
  
  // Check for Alpha tier
  const hasAlpha = tokenIds.some(
    id => id >= ACCESS_TIERS.ALPHA.minTokenId && id <= ACCESS_TIERS.ALPHA.maxTokenId
  );
  if (hasAlpha) {
    return ACCESS_TIERS.ALPHA;
  }
  
  // Check for Prime tier
  const hasPrime = tokenIds.some(
    id => id >= ACCESS_TIERS.PRIME.minTokenId && id <= ACCESS_TIERS.PRIME.maxTokenId
  );
  if (hasPrime) {
    return ACCESS_TIERS.PRIME;
  }
  
  // Check for Community tier
  const hasCommunity = tokenIds.some(
    id => id >= ACCESS_TIERS.COMMUNITY.minTokenId && id <= ACCESS_TIERS.COMMUNITY.maxTokenId
  );
  if (hasCommunity) {
    return ACCESS_TIERS.COMMUNITY;
  }
  
  return ACCESS_TIERS.PUBLIC;
}

/**
 * Comprehensive NFT verification and access tier determination
 * @param {string} address - User's wallet address
 * @returns {Promise<object>} - Verification result with tier and features
 */
export async function verifyNFTAccess(address) {
  try {
    if (!address) {
      return {
        hasAccess: false,
        tier: ACCESS_TIERS.PUBLIC,
        tokenIds: [],
        features: ACCESS_TIERS.PUBLIC.features,
      };
    }
    
    // Check all NFT contracts
    const contracts = Object.values(NFT_CONTRACTS).filter(c => c);
    let allTokenIds = [];
    
    for (const contractAddress of contracts) {
      const balance = await checkNFTBalance(address, contractAddress);
      if (balance > 0) {
        const tokenIds = await getOwnedTokenIds(address, contractAddress, balance);
        allTokenIds = [...allTokenIds, ...tokenIds];
      }
    }
    
    const tier = determineAccessTier(allTokenIds);
    
    return {
      hasAccess: allTokenIds.length > 0,
      tier,
      tokenIds: allTokenIds,
      features: tier.features,
      frequency: tier.frequency,
      color: tier.color,
    };
  } catch (error) {
    console.error('Error verifying NFT access:', error);
    return {
      hasAccess: false,
      tier: ACCESS_TIERS.PUBLIC,
      tokenIds: [],
      features: ACCESS_TIERS.PUBLIC.features,
      error: error.message,
    };
  }
}

/**
 * Check if user has specific feature access
 * @param {string[]} userFeatures - User's feature array from tier
 * @param {string} requiredFeature - Feature to check for
 * @returns {boolean} - Whether user has access to feature
 */
export function hasFeatureAccess(userFeatures, requiredFeature) {
  return userFeatures.includes(requiredFeature);
}

/**
 * Get frequency alignment for user based on tier
 * @param {object} tier - User's access tier
 * @returns {number} - Frequency in Hz
 */
export function getUserFrequency(tier) {
  return tier.frequency || 0;
}

export default {
  checkNFTBalance,
  getOwnedTokenIds,
  determineAccessTier,
  verifyNFTAccess,
  hasFeatureAccess,
  getUserFrequency,
};
