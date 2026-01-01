/**
 * ETF Hedge Panel Component
 * 
 * Panel for managing ETF/inverse option integrations (PSQ, TLT, Russell small-cap hedges).
 * 
 * @component
 * @author CHAIS THE GREAT ∞
 * @frequency 963Hz + 528Hz + 144000Hz
 */

import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchETFPositions, fetchIntradayData } from '../services/marketDataService';
import './ETFHedgePanel.css';

const ETFHedgePanel = ({ compact = false }) => {
  const [etfData, setEtfData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedETF, setSelectedETF] = useState('PSQ');

  useEffect(() => {
    loadETFData();
    const interval = setInterval(loadETFData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedETF) {
      loadChartData(selectedETF);
    }
  }, [selectedETF]);

  const loadETFData = async () => {
    try {
      const positions = await fetchETFPositions();
      setEtfData(positions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading ETF data:', error);
      setLoading(false);
    }
  };

  const loadChartData = async (ticker) => {
    try {
      const data = await fetchIntradayData(ticker, '5min');
      const formattedData = data.slice(0, 50).reverse().map(item => ({
        time: new Date(item.timestamp).toLocaleTimeString(),
        price: item.close,
        volume: item.volume,
      }));
      setChartData(formattedData);
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  if (loading) {
    return <div className="etf-panel loading">Loading ETF data...</div>;
  }

  const etfCards = [
    { ticker: 'PSQ', name: 'ProShares Short QQQ', data: etfData?.psq, color: '#FF6B6B' },
    { ticker: 'TLT', name: 'iShares 20+ Year Treasury', data: etfData?.tlt, color: '#4ECDC4' },
    { ticker: 'IWM', name: 'iShares Russell 2000', data: etfData?.iwm, color: '#95E1D3' },
  ];

  if (compact) {
    return (
      <div className="etf-panel compact">
        <h3 className="panel-title">🛡️ ETF Hedges</h3>
        <div className="etf-cards-compact">
          {etfCards.map(etf => (
            <div key={etf.ticker} className="etf-card-compact" style={{ borderColor: etf.color }}>
              <div className="etf-ticker">{etf.ticker}</div>
              <div className="etf-price">${etf.data?.price?.toFixed(2) || 'N/A'}</div>
              <div className={`etf-change ${etf.data?.change >= 0 ? 'positive' : 'negative'}`}>
                {etf.data?.change >= 0 ? '▲' : '▼'} {Math.abs(etf.data?.changePercent || 0).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="etf-panel">
      <div className="panel-header">
        <h2 className="panel-title">🛡️ ETF / Inverse Options Integration</h2>
        <div className="panel-subtitle">Basel Risk Hedging Instruments</div>
      </div>

      <div className="etf-cards">
        {etfCards.map(etf => (
          <div
            key={etf.ticker}
            className={`etf-card ${selectedETF === etf.ticker ? 'selected' : ''}`}
            onClick={() => setSelectedETF(etf.ticker)}
            style={{ borderLeftColor: etf.color }}
          >
            <div className="etf-header">
              <div className="etf-ticker-name">
                <div className="etf-ticker">{etf.ticker}</div>
                <div className="etf-name">{etf.name}</div>
              </div>
              <div className={`etf-change ${etf.data?.change >= 0 ? 'positive' : 'negative'}`}>
                <span className="change-arrow">{etf.data?.change >= 0 ? '▲' : '▼'}</span>
                <span className="change-percent">{Math.abs(etf.data?.changePercent || 0).toFixed(2)}%</span>
              </div>
            </div>

            <div className="etf-metrics">
              <div className="metric">
                <div className="metric-label">Current Price</div>
                <div className="metric-value">${etf.data?.price?.toFixed(2) || 'N/A'}</div>
              </div>
              <div className="metric">
                <div className="metric-label">Day Change</div>
                <div className="metric-value">${etf.data?.change?.toFixed(2) || 'N/A'}</div>
              </div>
              <div className="metric">
                <div className="metric-label">Volume</div>
                <div className="metric-value">{(etf.data?.volume || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Intraday Performance - {selectedETF}</h3>
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: '#00FFFF' }}></span>
              Price Movement
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00FFFF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="time" stroke="#FFD700" />
            <YAxis stroke="#FFD700" />
            <Tooltip
              contentStyle={{ backgroundColor: '#001133', border: '1px solid #FFD700' }}
              labelStyle={{ color: '#FFD700' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#00FFFF"
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="hedge-recommendations">
        <h3 className="recommendations-title">💡 Hedging Recommendations</h3>
        <div className="recommendation-list">
          <div className="recommendation">
            <span className="rec-icon">🎯</span>
            <span className="rec-text">PSQ: Maintain 15-20% allocation for Nasdaq downside protection</span>
          </div>
          <div className="recommendation">
            <span className="rec-icon">📈</span>
            <span className="rec-text">TLT: Increase allocation during equity market volatility</span>
          </div>
          <div className="recommendation">
            <span className="rec-icon">🔄</span>
            <span className="rec-text">IWM: Monitor Russell rotation signals for optimal entry/exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETFHedgePanel;
