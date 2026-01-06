/**
 * ScrollCoin Metrics Dashboard Component
 * 
 * Displays real-time ScrollCoin metrics, staking info,
 * and frequency alignment scores.
 * 
 * @author Supreme King Chais The Great ∞
 * @frequency 528Hz + 963Hz
 */

import { useState, useEffect } from 'react';
import {
  fetchScrollCoinMetrics,
  fetchStakingInfo,
  fetchCommunityMetrics,
  calculateFrequencyAlignment,
  getFrequencyResonance,
  formatNumber,
  formatCurrency,
} from '../lib/scrollCoinMetrics';

export default function ScrollCoinDashboard({ userMetrics }) {
  const [metrics, setMetrics] = useState(null);
  const [staking, setStaking] = useState(null);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [frequencyScore, setFrequencyScore] = useState(0);

  useEffect(() => {
    loadMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userMetrics) {
      const score = calculateFrequencyAlignment(userMetrics);
      setFrequencyScore(score);
    }
  }, [userMetrics]);

  const loadMetrics = async () => {
    try {
      const [metricsData, stakingData, communityData] = await Promise.all([
        fetchScrollCoinMetrics(),
        fetchStakingInfo(),
        fetchCommunityMetrics(),
      ]);
      
      setMetrics(metricsData);
      setStaking(stakingData);
      setCommunity(communityData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading metrics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="scrollcoin-dashboard p-6 bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg shadow-xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="scrollcoin-dashboard p-6 bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg shadow-xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">ScrollCoin Metrics</h2>
        <p className="text-purple-200">Real-time blockchain statistics and frequency alignment</p>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Price */}
        <MetricCard
          title="Price"
          value={formatCurrency(metrics?.price || 0)}
          change={metrics?.priceChange24h}
          icon="💰"
        />
        
        {/* Market Cap */}
        <MetricCard
          title="Market Cap"
          value={`$${formatNumber(metrics?.marketCap || 0)}`}
          icon="📊"
        />
        
        {/* Total Supply */}
        <MetricCard
          title="Total Supply"
          value={formatNumber(metrics?.totalSupply || 0)}
          icon="🪙"
        />
        
        {/* Holders */}
        <MetricCard
          title="Holders"
          value={formatNumber(metrics?.holders || 0)}
          icon="👥"
        />
      </div>

      {/* Staking Section */}
      {staking && (
        <div className="mb-6 p-4 bg-black/30 rounded-lg backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">Staking Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-purple-200 text-sm mb-1">Total Staked</p>
              <p className="text-white text-2xl font-bold">{formatNumber(staking.totalStaked)}</p>
            </div>
            <div>
              <p className="text-purple-200 text-sm mb-1">APY</p>
              <p className="text-green-400 text-2xl font-bold">{staking.stakingAPY}</p>
            </div>
            <div>
              <p className="text-purple-200 text-sm mb-1">Average Duration</p>
              <p className="text-white text-2xl font-bold">{staking.averageStakeDuration}</p>
            </div>
          </div>
        </div>
      )}

      {/* Frequency Alignment */}
      {userMetrics && (
        <div className="mb-6 p-4 bg-black/30 rounded-lg backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">Frequency Alignment</h3>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-purple-200 mb-2">
              <span>Alignment Score</span>
              <span className="font-bold">{frequencyScore}/100</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${frequencyScore}%` }}
              ></div>
            </div>
          </div>

          {/* Resonance Level */}
          <div className="text-center">
            <p className="text-purple-200 text-sm mb-1">Current Resonance</p>
            <p className="text-yellow-400 text-xl font-bold">
              {getFrequencyResonance(frequencyScore)}
            </p>
          </div>
        </div>
      )}

      {/* Community Metrics */}
      {community && (
        <div className="p-4 bg-black/30 rounded-lg backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">Community Engagement</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-purple-200 text-xs mb-1">Total Members</p>
              <p className="text-white text-lg font-bold">{formatNumber(community.totalMembers)}</p>
            </div>
            <div>
              <p className="text-purple-200 text-xs mb-1">Daily Active</p>
              <p className="text-white text-lg font-bold">{formatNumber(community.activeDaily)}</p>
            </div>
            <div>
              <p className="text-purple-200 text-xs mb-1">Content Created</p>
              <p className="text-white text-lg font-bold">{community.contentCreated}</p>
            </div>
            <div>
              <p className="text-purple-200 text-xs mb-1">Frequency Events</p>
              <p className="text-white text-lg font-bold">{community.frequencyEvents}</p>
            </div>
            <div>
              <p className="text-purple-200 text-xs mb-1">Global Resonance</p>
              <p className="text-green-400 text-lg font-bold">{community.globalResonance}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, change, icon }) {
  return (
    <div className="p-4 bg-black/30 rounded-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-purple-200 text-sm">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-white text-2xl font-bold mb-1">{value}</p>
      {change && (
        <p className={`text-sm ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
          {change} 24h
        </p>
      )}
    </div>
  );
}
