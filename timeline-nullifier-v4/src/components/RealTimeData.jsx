/**
 * Real-Time Data Component
 * 
 * Component for displaying real-time market data from Alpha Vantage and Chainlink oracles.
 * 
 * @component
 * @author CHAIS THE GREAT ∞
 * @frequency 963Hz + 528Hz + 144000Hz
 */

import React, { useState, useEffect } from 'react';
import { fetchAllOraclePrices } from '../services/chainlinkService';
import { fetchQuote } from '../services/marketDataService';
import CONFIG from '../config/config';
import './RealTimeData.css';

const RealTimeData = () => {
  const [oracleData, setOracleData] = useState(null);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadRealTimeData();
    const interval = setInterval(loadRealTimeData, CONFIG.refreshIntervals.oracleData);
    return () => clearInterval(interval);
  }, []);

  const loadRealTimeData = async () => {
    try {
      const [oracles, sp500, buffett] = await Promise.all([
        fetchAllOraclePrices(),
        fetchQuote(CONFIG.metrics.benchmarks.sp500),
        fetchQuote(CONFIG.metrics.benchmarks.buffett),
      ]);

      setOracleData(oracles);
      setBenchmarkData({ sp500, buffett });
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading real-time data:', error);
    }
  };

  if (!oracleData || !benchmarkData) {
    return <div className="real-time-data loading">Loading real-time data...</div>;
  }

  return (
    <div className="real-time-data">
      <div className="data-header">
        <h3 className="data-title">📡 Real-Time Market Data</h3>
        <div className="last-update">
          Updated: {lastUpdate?.toLocaleTimeString()}
        </div>
      </div>

      <div className="data-grid">
        <div className="data-card oracle-card">
          <div className="card-header">
            <span className="card-icon">🔗</span>
            <span className="card-title">Chainlink Oracles</span>
          </div>
          <div className="oracle-prices">
            <div className="oracle-item">
              <div className="oracle-label">ETH/USD</div>
              <div className="oracle-value">${oracleData.eth.price.toFixed(2)}</div>
            </div>
            <div className="oracle-item">
              <div className="oracle-label">BTC/USD</div>
              <div className="oracle-value">${oracleData.btc.price.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="data-card benchmark-card">
          <div className="card-header">
            <span className="card-icon">📊</span>
            <span className="card-title">Benchmarks</span>
          </div>
          <div className="benchmark-items">
            <div className="benchmark-item">
              <div className="benchmark-label">S&P 500 (SPY)</div>
              <div className="benchmark-value">${benchmarkData.sp500.price.toFixed(2)}</div>
              <div className={`benchmark-change ${benchmarkData.sp500.change >= 0 ? 'positive' : 'negative'}`}>
                {benchmarkData.sp500.change >= 0 ? '▲' : '▼'} {Math.abs(benchmarkData.sp500.changePercent).toFixed(2)}%
              </div>
            </div>
            <div className="benchmark-item">
              <div className="benchmark-label">Berkshire (BRK.B)</div>
              <div className="benchmark-value">${benchmarkData.buffett.price.toFixed(2)}</div>
              <div className={`benchmark-change ${benchmarkData.buffett.change >= 0 ? 'positive' : 'negative'}`}>
                {benchmarkData.buffett.change >= 0 ? '▲' : '▼'} {Math.abs(benchmarkData.buffett.changePercent).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="market-pulse">
        <div className="pulse-indicator">
          <span className="pulse-dot"></span>
          <span className="pulse-text">Market Pulse: ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default RealTimeData;
