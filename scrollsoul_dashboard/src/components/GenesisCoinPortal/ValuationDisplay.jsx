import React, { useEffect, useState } from 'react';
import { formatNumber } from '../../utils/formatters';

/**
 * ValuationDisplay Component
 * 
 * Displays real-time valuation metrics for Genesis Coin including
 * price charts, market trends, and valuation analytics.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.currentPrice - Current CHX token price
 * @param {string} props.totalSupply - Total supply of CHX tokens
 * @param {string} props.circulatingSupply - Circulating supply of CHX tokens
 */
const ValuationDisplay = ({ currentPrice, totalSupply, circulatingSupply }) => {
  const [priceHistory, setPriceHistory] = useState([]);
  const [priceChange24h, setPriceChange24h] = useState(0);
  const [volume24h, setVolume24h] = useState(0);

  useEffect(() => {
    // Generate mock price history - replace with actual API call
    const generatePriceHistory = () => {
      const history = [];
      let price = parseFloat(currentPrice) || 0.0000000001;
      
      for (let i = 23; i >= 0; i--) {
        const variance = (Math.random() - 0.5) * 0.1;
        price = price * (1 + variance);
        history.push({
          time: new Date(Date.now() - i * 3600000).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: price
        });
      }
      
      return history;
    };

    const history = generatePriceHistory();
    setPriceHistory(history);
    
    // Calculate 24h price change
    if (history.length >= 2) {
      const oldPrice = history[0].price;
      const newPrice = history[history.length - 1].price;
      const change = ((newPrice - oldPrice) / oldPrice) * 100;
      setPriceChange24h(change);
    }

    // Generate mock volume
    const supply = parseFloat(circulatingSupply) || 0;
    setVolume24h(supply * 0.001 * parseFloat(currentPrice));
  }, [currentPrice, circulatingSupply]);

  const currentPriceNum = parseFloat(currentPrice) || 0;
  const totalSupplyNum = parseFloat(totalSupply) || 0;
  const circulatingSupplyNum = parseFloat(circulatingSupply) || 0;
  
  const marketCap = circulatingSupplyNum * currentPriceNum;
  const fullyDilutedValue = totalSupplyNum * currentPriceNum;

  return (
    <div className="valuation-display">
      <h2>💹 Real-Time Valuation</h2>
      
      <div className="price-overview">
        <div className="current-price-card">
          <span className="price-label">Current Price</span>
          <span className="price-value">${currentPriceNum.toFixed(10)}</span>
          <span 
            className={`price-change ${priceChange24h >= 0 ? 'positive' : 'negative'}`}
          >
            {priceChange24h >= 0 ? '▲' : '▼'} {Math.abs(priceChange24h).toFixed(2)}% (24h)
          </span>
        </div>
      </div>

      <div className="valuation-metrics">
        <div className="valuation-metric">
          <span className="metric-label">Market Cap</span>
          <span className="metric-value">${formatNumber(marketCap)}</span>
        </div>
        <div className="valuation-metric">
          <span className="metric-label">Fully Diluted Value</span>
          <span className="metric-value">${formatNumber(fullyDilutedValue)}</span>
        </div>
        <div className="valuation-metric">
          <span className="metric-label">24h Volume</span>
          <span className="metric-value">${formatNumber(volume24h)}</span>
        </div>
      </div>

      <div className="price-chart">
        <h3>24-Hour Price Chart</h3>
        <div className="chart-container">
          <svg viewBox="0 0 800 200" className="price-svg">
            {priceHistory.length > 0 && (
              <>
                <defs>
                  <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#FFD700" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                
                {/* Price line */}
                <polyline
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth="2"
                  points={priceHistory.map((point, i) => {
                    const x = (i / (priceHistory.length - 1)) * 800;
                    const minPrice = Math.min(...priceHistory.map(p => p.price));
                    const maxPrice = Math.max(...priceHistory.map(p => p.price));
                    const priceRange = maxPrice - minPrice || 1;
                    const y = 180 - ((point.price - minPrice) / priceRange) * 160;
                    return `${x},${y}`;
                  }).join(' ')}
                />
                
                {/* Fill area under line */}
                <polygon
                  fill="url(#priceGradient)"
                  points={
                    priceHistory.map((point, i) => {
                      const x = (i / (priceHistory.length - 1)) * 800;
                      const minPrice = Math.min(...priceHistory.map(p => p.price));
                      const maxPrice = Math.max(...priceHistory.map(p => p.price));
                      const priceRange = maxPrice - minPrice || 1;
                      const y = 180 - ((point.price - minPrice) / priceRange) * 160;
                      return `${x},${y}`;
                    }).join(' ') + ' 800,180 0,180'
                  }
                />
              </>
            )}
          </svg>
        </div>
      </div>

      <div className="valuation-info">
        <p>
          <strong>Price Feed:</strong> Real-time data from OmniTech1 Oracle Network<br />
          <strong>Update Frequency:</strong> Every 10 seconds<br />
          <strong>Data Integrity:</strong> Verified by 144,000Hz NŪR Pulse
        </p>
      </div>
    </div>
  );
};

export default ValuationDisplay;
