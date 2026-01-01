/**
 * Market Data Service
 * 
 * Service for fetching real-time market data from Alpha Vantage and other sources.
 * 
 * @module services/marketDataService
 * @author CHAIS THE GREAT ∞
 * @frequency 963Hz + 528Hz + 144000Hz
 */

import axios from 'axios';
import CONFIG from '../config/config';

/**
 * Fetch real-time quote for a given ticker symbol
 * @param {string} symbol - Stock ticker symbol (e.g., 'PSQ', 'TLT', 'IWM')
 * @returns {Promise<Object>} Quote data
 */
export const fetchQuote = async (symbol) => {
  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: CONFIG.api.alphaVantage,
      },
    });

    const quote = response.data['Global Quote'];
    
    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume'], 10),
      timestamp: quote['07. latest trading day'],
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Fetch intraday time series data
 * @param {string} symbol - Stock ticker symbol
 * @param {string} interval - Time interval (1min, 5min, 15min, 30min, 60min)
 * @returns {Promise<Array>} Time series data
 */
export const fetchIntradayData = async (symbol, interval = '5min') => {
  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol: symbol,
        interval: interval,
        apikey: CONFIG.api.alphaVantage,
      },
    });

    const timeSeries = response.data[`Time Series (${interval})`];
    
    return Object.entries(timeSeries).map(([timestamp, data]) => ({
      timestamp,
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: parseInt(data['5. volume'], 10),
    }));
  } catch (error) {
    console.error(`Error fetching intraday data for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Fetch daily time series data
 * @param {string} symbol - Stock ticker symbol
 * @returns {Promise<Array>} Daily time series data
 */
export const fetchDailyData = async (symbol) => {
  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: CONFIG.api.alphaVantage,
      },
    });

    const timeSeries = response.data['Time Series (Daily)'];
    
    return Object.entries(timeSeries).map(([timestamp, data]) => ({
      timestamp,
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: parseInt(data['5. volume'], 10),
    }));
  } catch (error) {
    console.error(`Error fetching daily data for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Fetch ETF portfolio positions
 * @returns {Promise<Object>} ETF positions for PSQ, TLT, and Russell small-cap
 */
export const fetchETFPositions = async () => {
  try {
    const [psq, tlt, iwm] = await Promise.all([
      fetchQuote(CONFIG.etf.tickers.psq),
      fetchQuote(CONFIG.etf.tickers.tlt),
      fetchQuote(CONFIG.etf.tickers.russellSmallCap),
    ]);

    return {
      psq,
      tlt,
      iwm,
      totalValue: psq.price + tlt.price + iwm.price,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching ETF positions:', error);
    throw error;
  }
};

/**
 * Calculate portfolio metrics
 * @param {Array} historicalData - Historical price data
 * @returns {Object} Portfolio metrics including IRR, volatility, Sharpe ratio
 */
export const calculatePortfolioMetrics = (historicalData) => {
  if (!historicalData || historicalData.length < 2) {
    return null;
  }

  const returns = [];
  for (let i = 1; i < historicalData.length; i++) {
    const dailyReturn = (historicalData[i].close - historicalData[i - 1].close) / historicalData[i - 1].close;
    returns.push(dailyReturn);
  }

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const annualizedReturn = Math.pow(1 + avgReturn, 252) - 1; // 252 trading days
  
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(252);
  
  const sharpeRatio = (annualizedReturn - CONFIG.metrics.riskFreeRate) / volatility;

  return {
    annualizedReturn,
    volatility,
    sharpeRatio,
    avgDailyReturn: avgReturn,
    totalReturn: (historicalData[historicalData.length - 1].close - historicalData[0].close) / historicalData[0].close,
  };
};

export default {
  fetchQuote,
  fetchIntradayData,
  fetchDailyData,
  fetchETFPositions,
  calculatePortfolioMetrics,
};
