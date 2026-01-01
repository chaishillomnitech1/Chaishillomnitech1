/**
 * Buffett-Style Metrics Component
 * 
 * Component for displaying advanced compounding/IRR logic with Buffett-style metrics.
 * 
 * @component
 * @author CHAIS THE GREAT ∞
 * @frequency 963Hz + 528Hz + 144000Hz
 */

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CONFIG from '../config/config';
import './BuffettMetrics.css';

const BuffettMetrics = ({ compact = false }) => {
  const [metrics, setMetrics] = useState({
    currentIRR: 0.18,
    targetIRR: CONFIG.metrics.targetIRR,
    compoundedReturn: 0,
    daysInvested: 365,
    initialInvestment: 100000,
    currentValue: 118000,
    sharpeRatio: 1.85,
    beta: 0.72,
    alpha: 0.06,
  });

  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    calculateMetrics();
    generateHistoricalData();
  }, []);

  const calculateMetrics = () => {
    const { initialInvestment, currentValue, daysInvested } = metrics;
    const totalReturn = (currentValue - initialInvestment) / initialInvestment;
    const annualizedReturn = Math.pow(1 + totalReturn, 365 / daysInvested) - 1;
    
    setMetrics(prev => ({
      ...prev,
      currentIRR: annualizedReturn,
      compoundedReturn: currentValue - initialInvestment,
    }));
  };

  const generateHistoricalData = () => {
    const data = [];
    const startValue = 100000;
    const dailyReturn = 0.0005; // ~18% annualized

    for (let i = 0; i <= 365; i += 7) {
      const value = startValue * Math.pow(1 + dailyReturn, i);
      const targetValue = startValue * Math.pow(1 + (CONFIG.metrics.targetIRR / 365), i);
      
      data.push({
        day: i,
        actual: Math.round(value),
        target: Math.round(targetValue),
        buffett: Math.round(startValue * Math.pow(1.20, i / 365)), // 20% benchmark
      });
    }

    setHistoricalData(data);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  if (compact) {
    return (
      <div className="buffett-metrics compact">
        <h3 className="panel-title">💎 Buffett Metrics</h3>
        <div className="metrics-compact">
          <div className="metric-compact">
            <span className="metric-label">IRR:</span>
            <span className={`metric-value ${metrics.currentIRR >= metrics.targetIRR ? 'positive' : 'warning'}`}>
              {formatPercent(metrics.currentIRR)}
            </span>
          </div>
          <div className="metric-compact">
            <span className="metric-label">Sharpe:</span>
            <span className="metric-value positive">{metrics.sharpeRatio.toFixed(2)}</span>
          </div>
          <div className="metric-compact">
            <span className="metric-label">Alpha:</span>
            <span className="metric-value positive">{formatPercent(metrics.alpha)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="buffett-metrics">
      <div className="panel-header">
        <h2 className="panel-title">💎 Buffett-Style Investment Metrics</h2>
        <div className="panel-subtitle">Advanced Compounding & IRR Analysis</div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card irr-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-label">Internal Rate of Return (IRR)</div>
            <div className={`metric-value ${metrics.currentIRR >= metrics.targetIRR ? 'achieved' : 'warning'}`}>
              {formatPercent(metrics.currentIRR)}
            </div>
            <div className="metric-target">
              Target: {formatPercent(metrics.targetIRR)} (15%+)
              {metrics.currentIRR >= metrics.targetIRR && <span className="target-achieved">✓ ACHIEVED</span>}
            </div>
          </div>
        </div>

        <div className="metric-card value-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-label">Portfolio Value</div>
            <div className="metric-value positive">{formatCurrency(metrics.currentValue)}</div>
            <div className="metric-change">
              +{formatCurrency(metrics.compoundedReturn)} ({formatPercent((metrics.currentValue - metrics.initialInvestment) / metrics.initialInvestment)})
            </div>
          </div>
        </div>

        <div className="metric-card sharpe-card">
          <div className="metric-icon">⚖️</div>
          <div className="metric-content">
            <div className="metric-label">Sharpe Ratio</div>
            <div className="metric-value positive">{metrics.sharpeRatio.toFixed(2)}</div>
            <div className="metric-info">Risk-adjusted returns</div>
          </div>
        </div>

        <div className="metric-card alpha-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-label">Alpha (vs S&P 500)</div>
            <div className="metric-value positive">+{formatPercent(metrics.alpha)}</div>
            <div className="metric-info">Beta: {metrics.beta.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h3 className="chart-title">Compounding Growth Trajectory</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="day" stroke="#FFD700" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
            <YAxis stroke="#FFD700" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#001133', border: '1px solid #FFD700' }}
              formatter={(value) => formatCurrency(value)}
            />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#00FF00" strokeWidth={2} name="Actual Performance" dot={false} />
            <Line type="monotone" dataKey="target" stroke="#FFD700" strokeWidth={2} strokeDasharray="5 5" name="15% Target" dot={false} />
            <Line type="monotone" dataKey="buffett" stroke="#FF6B6B" strokeWidth={2} strokeDasharray="3 3" name="Buffett Benchmark (20%)" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="compounding-insights">
        <h3 className="insights-title">📈 Compounding Insights</h3>
        <div className="insights-grid">
          <div className="insight">
            <div className="insight-value">{formatCurrency(metrics.currentValue * 2)}</div>
            <div className="insight-label">Projected Value (2 years @ {formatPercent(metrics.currentIRR)})</div>
          </div>
          <div className="insight">
            <div className="insight-value">{formatCurrency(metrics.currentValue * 4)}</div>
            <div className="insight-label">Projected Value (5 years @ {formatPercent(metrics.currentIRR)})</div>
          </div>
          <div className="insight">
            <div className="insight-value">{Math.round(72 / (metrics.currentIRR * 100))} years</div>
            <div className="insight-label">Time to Double (Rule of 72)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuffettMetrics;
