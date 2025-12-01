import React from 'react';
import { formatNumber } from '../../utils/formatters';

/**
 * TokenomicsPanel Component
 * 
 * Displays Genesis Coin tokenomics including total supply,
 * circulating supply, and current valuation.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.totalSupply - Total supply of CHX tokens
 * @param {string} props.circulatingSupply - Circulating supply of CHX tokens
 * @param {string} props.currentValuation - Current CHX token price
 */
const TokenomicsPanel = ({ totalSupply, circulatingSupply, currentValuation }) => {
  const totalSupplyNum = parseFloat(totalSupply) || 0;
  const circulatingSupplyNum = parseFloat(circulatingSupply) || 0;
  const valuationNum = parseFloat(currentValuation) || 0;
  
  const marketCap = circulatingSupplyNum * valuationNum;
  const circulatingPercentage = totalSupplyNum > 0 
    ? ((circulatingSupplyNum / totalSupplyNum) * 100).toFixed(2)
    : 0;

  return (
    <div className="tokenomics-panel">
      <h2>📊 Genesis Coin Tokenomics</h2>
      <div className="tokenomics-grid">
        <div className="metric-card">
          <div className="metric-icon">💎</div>
          <div className="metric-content">
            <span className="metric-label">Total Supply</span>
            <span className="metric-value">{formatNumber(totalSupplyNum)}</span>
            <span className="metric-unit">CHX</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🌊</div>
          <div className="metric-content">
            <span className="metric-label">Circulating Supply</span>
            <span className="metric-value">{formatNumber(circulatingSupplyNum)}</span>
            <span className="metric-unit">CHX ({circulatingPercentage}%)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <span className="metric-label">Current Price</span>
            <span className="metric-value">{valuationNum.toFixed(10)}</span>
            <span className="metric-unit">USD</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🏆</div>
          <div className="metric-content">
            <span className="metric-label">Market Cap</span>
            <span className="metric-value">${formatNumber(marketCap)}</span>
            <span className="metric-unit">USD</span>
          </div>
        </div>
      </div>

      <div className="tokenomics-details">
        <h3>Token Distribution</h3>
        <div className="distribution-bar">
          <div 
            className="distribution-segment circulating"
            style={{ width: `${circulatingPercentage}%` }}
            title={`Circulating: ${circulatingPercentage}%`}
          >
            <span>Circulating</span>
          </div>
          <div 
            className="distribution-segment reserved"
            style={{ width: `${100 - circulatingPercentage}%` }}
            title={`Reserved: ${(100 - circulatingPercentage).toFixed(2)}%`}
          >
            <span>Reserved</span>
          </div>
        </div>
      </div>

      <div className="tokenomics-info">
        <p>
          <strong>Divine Frequency:</strong> 144,000Hz NŪR Pulse<br />
          <strong>Daily Passive Income:</strong> 0.005% of holdings<br />
          <strong>Royalties:</strong> 10% Creator, 5% Ambassador, 2% DAO
        </p>
      </div>
    </div>
  );
};

export default TokenomicsPanel;
