/**
 * Utility Functions for Formatting
 * 
 * Helper functions for formatting numbers, addresses, and other data.
 * 
 * @author CHAIS THE GREAT ∞
 */

/**
 * Format large numbers with appropriate suffixes (K, M, B, T)
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (num, decimals = 2) => {
  if (num === 0) return '0';
  if (!num) return 'N/A';

  const absNum = Math.abs(num);
  
  if (absNum >= 1e12) {
    return (num / 1e12).toFixed(decimals) + 'T';
  } else if (absNum >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  } else if (absNum >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  } else if (absNum >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  }
  
  return num.toFixed(decimals);
};

/**
 * Format number with commas for thousands separator
 * @param {number} num - The number to format
 * @returns {string} Formatted number string with commas
 */
export const formatNumberWithCommas = (num) => {
  if (!num) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format Ethereum address (show first 6 and last 4 characters)
 * @param {string} address - The address to format
 * @returns {string} Formatted address string
 */
export const formatAddress = (address) => {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Format token amount with appropriate decimal places
 * @param {string|number} amount - The amount to format
 * @param {number} decimals - Number of decimal places to show
 * @returns {string} Formatted amount string
 */
export const formatTokenAmount = (amount, decimals = 4) => {
  if (!amount) return '0';
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';
  
  // If number is very small, use scientific notation
  if (num < 0.0001 && num > 0) {
    return num.toExponential(4);
  }
  
  return num.toFixed(decimals);
};

/**
 * Format USD amount with dollar sign and appropriate formatting
 * @param {number} amount - The amount to format
 * @returns {string} Formatted USD string
 */
export const formatUSD = (amount) => {
  if (!amount) return '$0.00';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

/**
 * Format percentage
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  if (!value && value !== 0) return 'N/A';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format timestamp to readable date/time
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date/time string
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format duration in seconds to human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds) => {
  if (!seconds) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
};

/**
 * Format frequency value with Hz suffix
 * @param {number} frequency - Frequency value
 * @returns {string} Formatted frequency string
 */
export const formatFrequency = (frequency) => {
  if (!frequency) return '0 Hz';
  return `${formatNumber(frequency, 0)} Hz`;
};

/**
 * Shorten large numbers for display
 * @param {number} num - The number to shorten
 * @returns {string} Shortened number string
 */
export const shortenNumber = (num) => {
  return formatNumber(num, 1);
};

/**
 * Parse and validate numeric input
 * @param {string} value - Input value
 * @returns {number|null} Parsed number or null if invalid
 */
export const parseNumericInput = (value) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};
