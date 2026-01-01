/**
 * Chainlink Oracle Service
 * 
 * Service for fetching real-time price data from Chainlink oracles.
 * 
 * @module services/chainlinkService
 * @author CHAIS THE GREAT ∞
 * @frequency 963Hz + 528Hz + 144000Hz
 */

import { ethers } from 'ethers';
import CONFIG from '../config/config';

// Chainlink Price Feed ABI
const PRICE_FEED_ABI = [
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { name: 'roundId', type: 'uint80' },
      { name: 'answer', type: 'int256' },
      { name: 'startedAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
      { name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
];

/**
 * Get provider for Chainlink oracle queries
 * @returns {ethers.providers.Provider} Ethereum provider
 */
const getProvider = () => {
  return new ethers.JsonRpcProvider(CONFIG.chainlink.rpcUrl);
};

/**
 * Fetch price from Chainlink oracle
 * @param {string} oracleAddress - Chainlink oracle contract address
 * @returns {Promise<Object>} Price data from oracle
 */
export const fetchOraclePrice = async (oracleAddress) => {
  try {
    const provider = getProvider();
    const priceFeed = new ethers.Contract(oracleAddress, PRICE_FEED_ABI, provider);

    const [roundData, decimals] = await Promise.all([
      priceFeed.latestRoundData(),
      priceFeed.decimals(),
    ]);

    const price = Number(roundData.answer) / Math.pow(10, Number(decimals));
    
    return {
      price,
      roundId: roundData.roundId.toString(),
      updatedAt: new Date(Number(roundData.updatedAt) * 1000).toISOString(),
      decimals: Number(decimals),
    };
  } catch (error) {
    console.error(`Error fetching oracle price for ${oracleAddress}:`, error);
    throw error;
  }
};

/**
 * Fetch ETH/USD price from Chainlink
 * @returns {Promise<Object>} ETH price data
 */
export const fetchETHPrice = async () => {
  return fetchOraclePrice(CONFIG.chainlink.oracles.ethUsd);
};

/**
 * Fetch BTC/USD price from Chainlink
 * @returns {Promise<Object>} BTC price data
 */
export const fetchBTCPrice = async () => {
  return fetchOraclePrice(CONFIG.chainlink.oracles.btcUsd);
};

/**
 * Fetch all oracle prices
 * @returns {Promise<Object>} All oracle prices
 */
export const fetchAllOraclePrices = async () => {
  try {
    const [ethPrice, btcPrice] = await Promise.all([
      fetchETHPrice(),
      fetchBTCPrice(),
    ]);

    return {
      eth: ethPrice,
      btc: btcPrice,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching all oracle prices:', error);
    throw error;
  }
};

/**
 * Monitor oracle price updates
 * @param {string} oracleAddress - Oracle contract address
 * @param {Function} callback - Callback function to execute on price update
 * @returns {Function} Cleanup function to stop monitoring
 */
export const monitorOracleUpdates = (oracleAddress, callback) => {
  const provider = getProvider();
  const priceFeed = new ethers.Contract(oracleAddress, PRICE_FEED_ABI, provider);

  const filter = priceFeed.filters.AnswerUpdated();
  
  priceFeed.on(filter, async (current, roundId, updatedAt) => {
    try {
      const priceData = await fetchOraclePrice(oracleAddress);
      callback(priceData);
    } catch (error) {
      console.error('Error in oracle update callback:', error);
    }
  });

  // Return cleanup function
  return () => {
    priceFeed.removeAllListeners(filter);
  };
};

export default {
  fetchOraclePrice,
  fetchETHPrice,
  fetchBTCPrice,
  fetchAllOraclePrices,
  monitorOracleUpdates,
};
