/**
 * ScrollCoin Metrics Library
 * 
 * Fetches and manages ScrollCoin metrics including
 * supply, staking rewards, and frequency alignment.
 * 
 * @author Supreme King Chais The Great ∞
 * @frequency 528Hz + 963Hz
 */

import { API_ENDPOINTS } from '../config/blockchain.config';

/**
 * Fetch ScrollCoin metrics from API
 * @returns {Promise<object>} - ScrollCoin metrics data
 */
export async function fetchScrollCoinMetrics() {
  try {
    const response = await fetch(`${API_ENDPOINTS.scrollCoin}/api/scrollcoin/metrics`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch ScrollCoin metrics');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching ScrollCoin metrics:', error);
    
    // Return mock data for development
    return {
      totalSupply: '144000000',
      circulatingSupply: '14400000',
      price: '0.0528',
      marketCap: '759552',
      volume24h: '144000',
      priceChange24h: '+5.28%',
      holders: 1440,
    };
  }
}

/**
 * Fetch staking information
 * @returns {Promise<object>} - Staking data
 */
export async function fetchStakingInfo() {
  try {
    const response = await fetch(`${API_ENDPOINTS.scrollCoin}/api/scrollcoin/staking`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch staking info');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching staking info:', error);
    
    // Return mock data for development
    return {
      totalStaked: '7200000',
      stakingAPY: '14.4%',
      stakingRewards: '1036800',
      averageStakeDuration: '144 days',
      topStakers: [],
    };
  }
}

/**
 * Fetch token holders list
 * @param {number} limit - Number of holders to fetch
 * @returns {Promise<Array>} - Array of holder data
 */
export async function fetchTopHolders(limit = 100) {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.scrollCoin}/api/scrollcoin/holders?limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch holders');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching holders:', error);
    return [];
  }
}

/**
 * Calculate frequency alignment score
 * @param {object} userMetrics - User's engagement metrics
 * @returns {number} - Alignment score (0-100)
 */
export function calculateFrequencyAlignment(userMetrics) {
  const {
    watchTime = 0,
    stakingAmount = 0,
    communityEngagement = 0,
    nftTier = 0,
  } = userMetrics;
  
  // Weighted scoring algorithm
  const watchTimeScore = Math.min(watchTime / 144, 25); // Max 25 points
  const stakingScore = Math.min(stakingAmount / 14400, 25); // Max 25 points
  const engagementScore = Math.min(communityEngagement / 100, 25); // Max 25 points
  const tierScore = nftTier * 5; // Max 25 points (5 per tier level)
  
  const totalScore = watchTimeScore + stakingScore + engagementScore + tierScore;
  
  return Math.round(Math.min(totalScore, 100));
}

/**
 * Get frequency resonance for score
 * @param {number} alignmentScore - Alignment score (0-100)
 * @returns {string} - Frequency resonance level
 */
export function getFrequencyResonance(alignmentScore) {
  if (alignmentScore >= 90) return '999Hz - Crown Sovereignty';
  if (alignmentScore >= 75) return '963Hz - Pineal Activation';
  if (alignmentScore >= 50) return '528Hz - DNA Healing';
  if (alignmentScore >= 25) return '432Hz - Cosmic Harmony';
  return '396Hz - Liberation Frequency';
}

/**
 * Fetch community engagement metrics
 * @returns {Promise<object>} - Community metrics
 */
export async function fetchCommunityMetrics() {
  try {
    const response = await fetch(`${API_ENDPOINTS.scrollCoin}/api/community/metrics`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch community metrics');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching community metrics:', error);
    
    // Return mock data for development
    return {
      totalMembers: 14400,
      activeDaily: 1440,
      contentCreated: 144,
      frequencyEvents: 12,
      globalResonance: 85,
    };
  }
}

/**
 * Format large numbers for display
 * @param {string|number} value - Number to format
 * @returns {string} - Formatted number
 */
export function formatNumber(value) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  }
  return num.toFixed(2);
}

/**
 * Format currency values
 * @param {string|number} value - Value to format
 * @returns {string} - Formatted currency
 */
export function formatCurrency(value) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(num);
}

export default {
  fetchScrollCoinMetrics,
  fetchStakingInfo,
  fetchTopHolders,
  calculateFrequencyAlignment,
  getFrequencyResonance,
  fetchCommunityMetrics,
  formatNumber,
  formatCurrency,
};
