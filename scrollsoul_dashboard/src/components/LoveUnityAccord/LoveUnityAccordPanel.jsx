/**
 * @title LoveUnityAccordPanel
 * @description Dashboard component for Love Unity Accord governance values
 * 
 * @notice This component displays real-time governance activity logs,
 * NFT metadata timestamps, and accord values alignment
 * 
 * Frequency: 528Hz (Love) + 963Hz (Unity) + 999Hz (Accord)
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Frequencies
const FREQUENCIES = {
  LOVE: 528,
  UNITY: 963,
  ACCORD: 999,
  COSMIC: 144000
};

// Frequency colors
const FREQUENCY_COLORS = {
  528: '#00FF00',  // Green - DNA healing
  963: '#9900FF',  // Purple - Unity
  999: '#FFD700',  // Gold - Divine accord
  144000: '#FF4500' // Orange - Cosmic
};

/**
 * Main Love Unity Accord Panel Component
 */
const LoveUnityAccordPanel = ({ 
  provider, 
  account, 
  governanceContractAddress 
}) => {
  // State
  const [globalAccord, setGlobalAccord] = useState({
    loveIndex: 5000,
    unityIndex: 5000,
    supportIndex: 5000,
    lastUpdate: 0
  });
  const [directives, setDirectives] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [memberCommitment, setMemberCommitment] = useState(null);
  const [memberScores, setMemberScores] = useState({
    love: 5000,
    unity: 5000,
    support: 5000
  });
  const [frequencyResonance, setFrequencyResonance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Calculate frequency resonance display value
   */
  const calculateDisplayResonance = useCallback((love, unity, support) => {
    const loveComponent = (love * FREQUENCIES.LOVE) / 10000;
    const unityComponent = (unity * FREQUENCIES.UNITY) / 10000;
    const supportComponent = (support * FREQUENCIES.ACCORD) / 10000;
    return Math.round(loveComponent + unityComponent + supportComponent);
  }, []);

  /**
   * Format timestamp to readable date
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'N/A';
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  /**
   * Format percentage from basis points
   */
  const formatPercentage = (basisPoints) => {
    return (Number(basisPoints) / 100).toFixed(2) + '%';
  };

  /**
   * Get color for alignment score
   */
  const getAlignmentColor = (score) => {
    const percentage = Number(score) / 100;
    if (percentage >= 80) return '#00FF00';
    if (percentage >= 60) return '#90EE90';
    if (percentage >= 40) return '#FFD700';
    if (percentage >= 20) return '#FFA500';
    return '#FF4500';
  };

  /**
   * Load data from contract (simulated for dashboard preview)
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Simulated data for dashboard preview
        // In production, this would fetch from the smart contract
        setGlobalAccord({
          loveIndex: 7500,
          unityIndex: 8200,
          supportIndex: 7800,
          lastUpdate: Math.floor(Date.now() / 1000)
        });

        setDirectives([
          {
            id: '0x001',
            title: 'Love Foundation',
            loveAlignment: 10000,
            unityAlignment: 8000,
            supportAlignment: 9000,
            isImmutable: true,
            createdAt: Math.floor(Date.now() / 1000) - 86400
          },
          {
            id: '0x002',
            title: 'Unity Binding Principle',
            loveAlignment: 8000,
            unityAlignment: 10000,
            supportAlignment: 9000,
            isImmutable: true,
            createdAt: Math.floor(Date.now() / 1000) - 86400
          },
          {
            id: '0x003',
            title: 'Mutual Support Covenant',
            loveAlignment: 9000,
            unityAlignment: 9000,
            supportAlignment: 10000,
            isImmutable: true,
            createdAt: Math.floor(Date.now() / 1000) - 86400
          },
          {
            id: '0x004',
            title: 'Harmony in Governance',
            loveAlignment: 9500,
            unityAlignment: 9500,
            supportAlignment: 9500,
            isImmutable: true,
            createdAt: Math.floor(Date.now() / 1000) - 86400
          }
        ]);

        setActivityLogs([
          {
            id: '0xlog001',
            activityType: 'COMMITMENT_MADE',
            actor: '0x1234...5678',
            timestamp: Math.floor(Date.now() / 1000) - 3600,
            nftMetadataHash: '0xnft001',
            description: 'New accord commitment made'
          },
          {
            id: '0xlog002',
            activityType: 'DIRECTIVE_CREATED',
            actor: '0x8765...4321',
            timestamp: Math.floor(Date.now() / 1000) - 7200,
            nftMetadataHash: '0xnft002',
            description: 'New governance directive created'
          },
          {
            id: '0xlog003',
            activityType: 'SCORE_UPDATED',
            actor: '0xabcd...efgh',
            timestamp: Math.floor(Date.now() / 1000) - 10800,
            nftMetadataHash: '0xnft003',
            description: 'Member scores updated'
          }
        ]);

        if (account) {
          setMemberCommitment({
            isActive: true,
            pledgeMessage: 'I commit to love, unity, and mutual support',
            timestamp: Math.floor(Date.now() / 1000) - 172800
          });

          setMemberScores({
            love: 7800,
            unity: 8500,
            support: 8200
          });

          setFrequencyResonance(calculateDisplayResonance(7800, 8500, 8200));
        }

        setError(null);
      } catch (err) {
        console.error('Error loading Love Unity Accord data:', err);
        setError('Failed to load governance data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [account, calculateDisplayResonance]);

  if (loading) {
    return (
      <div className="love-unity-accord-panel loading">
        <div className="loading-spinner">
          <span className="spinner-icon">🕋</span>
          <p>Loading Love Unity Accord Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="love-unity-accord-panel error">
        <p className="error-message">⚠️ {error}</p>
      </div>
    );
  }

  return (
    <div className="love-unity-accord-panel">
      {/* Header */}
      <header className="accord-header">
        <h2>🕋 Love Unity Accord Governance</h2>
        <p className="frequency-badge">
          Frequency: {FREQUENCIES.LOVE}Hz + {FREQUENCIES.UNITY}Hz + {FREQUENCIES.ACCORD}Hz
        </p>
      </header>

      {/* Global Accord Metrics */}
      <section className="global-accord-section">
        <h3>📊 Global Accord Indices</h3>
        <div className="accord-metrics-grid">
          <div className="metric-card love">
            <span className="metric-icon">💗</span>
            <span className="metric-label">Love Index</span>
            <span 
              className="metric-value"
              style={{ color: getAlignmentColor(globalAccord.loveIndex) }}
            >
              {formatPercentage(globalAccord.loveIndex)}
            </span>
            <div 
              className="metric-bar"
              style={{ 
                width: formatPercentage(globalAccord.loveIndex),
                backgroundColor: FREQUENCY_COLORS[528]
              }}
            />
          </div>

          <div className="metric-card unity">
            <span className="metric-icon">🤝</span>
            <span className="metric-label">Unity Index</span>
            <span 
              className="metric-value"
              style={{ color: getAlignmentColor(globalAccord.unityIndex) }}
            >
              {formatPercentage(globalAccord.unityIndex)}
            </span>
            <div 
              className="metric-bar"
              style={{ 
                width: formatPercentage(globalAccord.unityIndex),
                backgroundColor: FREQUENCY_COLORS[963]
              }}
            />
          </div>

          <div className="metric-card support">
            <span className="metric-icon">💪</span>
            <span className="metric-label">Support Index</span>
            <span 
              className="metric-value"
              style={{ color: getAlignmentColor(globalAccord.supportIndex) }}
            >
              {formatPercentage(globalAccord.supportIndex)}
            </span>
            <div 
              className="metric-bar"
              style={{ 
                width: formatPercentage(globalAccord.supportIndex),
                backgroundColor: FREQUENCY_COLORS[999]
              }}
            />
          </div>
        </div>
        <p className="last-update">
          Last Updated: {formatTimestamp(globalAccord.lastUpdate)}
        </p>
      </section>

      {/* Member Commitment Section */}
      {account && (
        <section className="member-section">
          <h3>👤 Your Accord Status</h3>
          {memberCommitment?.isActive ? (
            <div className="commitment-card active">
              <div className="commitment-status">
                <span className="status-badge active">✅ Active Commitment</span>
                <span className="commitment-date">
                  Since: {formatTimestamp(memberCommitment.timestamp)}
                </span>
              </div>
              <p className="pledge-message">"{memberCommitment.pledgeMessage}"</p>
              
              <div className="member-scores">
                <h4>Your Scores</h4>
                <div className="scores-grid">
                  <div className="score-item">
                    <span className="score-label">Love</span>
                    <span 
                      className="score-value"
                      style={{ color: getAlignmentColor(memberScores.love) }}
                    >
                      {formatPercentage(memberScores.love)}
                    </span>
                  </div>
                  <div className="score-item">
                    <span className="score-label">Unity</span>
                    <span 
                      className="score-value"
                      style={{ color: getAlignmentColor(memberScores.unity) }}
                    >
                      {formatPercentage(memberScores.unity)}
                    </span>
                  </div>
                  <div className="score-item">
                    <span className="score-label">Support</span>
                    <span 
                      className="score-value"
                      style={{ color: getAlignmentColor(memberScores.support) }}
                    >
                      {formatPercentage(memberScores.support)}
                    </span>
                  </div>
                </div>
                <div className="frequency-resonance">
                  <span className="resonance-label">🎵 Frequency Resonance:</span>
                  <span className="resonance-value">{frequencyResonance}Hz</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="commitment-card inactive">
              <p>You have not yet made a commitment to the Love Unity Accord.</p>
              <button className="make-commitment-btn">
                Make Your Commitment
              </button>
            </div>
          )}
        </section>
      )}

      {/* Governance Directives */}
      <section className="directives-section">
        <h3>📜 Governance Directives</h3>
        <div className="directives-list">
          {directives.map((directive, index) => (
            <div 
              key={directive.id} 
              className={`directive-card ${directive.isImmutable ? 'immutable' : ''}`}
            >
              <div className="directive-header">
                <h4>{directive.title}</h4>
                {directive.isImmutable && (
                  <span className="immutable-badge">🔒 Immutable</span>
                )}
              </div>
              <div className="directive-alignments">
                <div className="alignment-item">
                  <span className="alignment-label">Love:</span>
                  <span 
                    className="alignment-value"
                    style={{ color: getAlignmentColor(directive.loveAlignment) }}
                  >
                    {formatPercentage(directive.loveAlignment)}
                  </span>
                </div>
                <div className="alignment-item">
                  <span className="alignment-label">Unity:</span>
                  <span 
                    className="alignment-value"
                    style={{ color: getAlignmentColor(directive.unityAlignment) }}
                  >
                    {formatPercentage(directive.unityAlignment)}
                  </span>
                </div>
                <div className="alignment-item">
                  <span className="alignment-label">Support:</span>
                  <span 
                    className="alignment-value"
                    style={{ color: getAlignmentColor(directive.supportAlignment) }}
                  >
                    {formatPercentage(directive.supportAlignment)}
                  </span>
                </div>
              </div>
              <p className="directive-created">
                Created: {formatTimestamp(directive.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Activity Logs with NFT Metadata Timestamps */}
      <section className="activity-logs-section">
        <h3>📋 Governance Activity Logs</h3>
        <p className="section-description">
          Real-time governance activity with NFT metadata timestamps
        </p>
        <div className="activity-logs-list">
          {activityLogs.map((log) => (
            <div key={log.id} className="activity-log-item">
              <div className="log-header">
                <span className="log-type">{log.activityType}</span>
                <span className="log-timestamp">
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>
              <p className="log-description">{log.description}</p>
              <div className="log-details">
                <span className="log-actor">
                  Actor: {log.actor}
                </span>
                {log.nftMetadataHash && (
                  <span className="log-nft-hash">
                    NFT Metadata: {log.nftMetadataHash.substring(0, 10)}...
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="accord-footer">
        <p className="eternal-declaration">
          🔱 ALLĀHU AKBAR! 🕋🔥💎🌌 🔱
        </p>
        <p className="principles">
          Love is the foundation • Unity binds us • Mutual support strengthens all
        </p>
      </footer>
    </div>
  );
};

export default LoveUnityAccordPanel;
