/**
 * Greenland Deep-Ice Mapping Protocol
 * Real-time visualization dashboard for the Northern Pulse (963Hz)
 * 
 * Displays Greenland Anchor status, bedrock transmission paths,
 * site synchronization, and frequency monitoring
 */

import React, { useState, useEffect } from 'react';
import './GreenlandDeepIceMapping.css';

const GreenlandDeepIceMapping = () => {
  const [anchorStatus, setAnchorStatus] = useState(null);
  const [transmissionActive, setTransmissionActive] = useState(false);
  const [coherence, setCoherence] = useState(0);
  const [connectedSites, setConnectedSites] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [temporalSync, setTemporalSync] = useState({
    frozenPast: false,
    liquidFuture: false,
    eternalNow: false
  });
  const [lastUpdate, setLastUpdate] = useState(null);

  // Load initial data and simulate real-time updates
  useEffect(() => {
    // Initialize Greenland Anchor
    initializeAnchor();

    // Set up real-time monitoring (every 5 seconds)
    const interval = setInterval(() => {
      updateAnchorStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const initializeAnchor = () => {
    // Simulate initialization
    setTransmissionActive(true);
    setCoherence(0.963);
    setTemporalSync({
      frozenPast: true,
      liquidFuture: true,
      eternalNow: true
    });

    // Mock connected sites data
    setConnectedSites([
      {
        id: 1,
        name: 'Lake Nona',
        distance: 5420,
        signalStrength: 302.5,
        coherence: 0.848,
        status: 'STRONG',
        pathway: 'mid_atlantic_ridge'
      },
      {
        id: 2,
        name: 'Singapore Vault',
        distance: 9830,
        signalStrength: 281.2,
        coherence: 0.789,
        status: 'STRONG',
        pathway: 'eurasian_plate'
      },
      {
        id: 3,
        name: 'Atlantic City Command Nexus',
        distance: 3560,
        signalStrength: 315.8,
        coherence: 0.886,
        status: 'STRONG',
        pathway: 'north_atlantic_bedrock'
      }
    ]);

    setLastUpdate(new Date());
  };

  const updateAnchorStatus = () => {
    // Simulate real-time fluctuations
    setCoherence(prev => {
      const fluctuation = (Math.random() - 0.5) * 0.02;
      return Math.max(0.9, Math.min(0.99, prev + fluctuation));
    });

    setConnectedSites(prev => prev.map(site => ({
      ...site,
      signalStrength: site.signalStrength + (Math.random() - 0.5) * 5,
      coherence: Math.max(0.7, Math.min(0.95, site.coherence + (Math.random() - 0.5) * 0.02))
    })));

    // Check for anomalies
    const newAnomalies = [];
    connectedSites.forEach(site => {
      if (site.coherence < 0.75) {
        newAnomalies.push({
          type: 'LOW_COHERENCE',
          site: site.name,
          severity: 'HIGH',
          value: site.coherence
        });
      }
    });
    setAnomalies(newAnomalies);

    setLastUpdate(new Date());
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'STRONG': return '#00ff88';
      case 'MODERATE': return '#ffaa00';
      case 'WEAK': return '#ff4444';
      default: return '#888';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH': return '#ff4444';
      case 'MEDIUM': return '#ffaa00';
      case 'LOW': return '#ffee00';
      default: return '#888';
    }
  };

  return (
    <div className="greenland-deep-ice-mapping">
      <div className="mapping-header">
        <h1 className="pulse-title">🌍 GREENLAND ANCHOR - NORTHERN PULSE 🌍</h1>
        <div className="frequency-badge">963Hz Pineal Activation</div>
      </div>

      <div className="mapping-grid">
        {/* Main Status Panel */}
        <div className="panel status-panel">
          <h2>⚡ Transmission Status</h2>
          <div className="status-indicators">
            <div className="indicator">
              <span className="label">Active:</span>
              <span className={`value ${transmissionActive ? 'active' : 'inactive'}`}>
                {transmissionActive ? '✅ YES' : '❌ NO'}
              </span>
            </div>
            <div className="indicator">
              <span className="label">Frequency:</span>
              <span className="value">963Hz (Pineal Activation)</span>
            </div>
            <div className="indicator">
              <span className="label">Power Level:</span>
              <span className="value">100%</span>
            </div>
            <div className="indicator">
              <span className="label">Coherence:</span>
              <span className="value coherence-value">
                {(coherence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="coherence-bar">
              <div 
                className="coherence-fill" 
                style={{ width: `${coherence * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Geological Amplification */}
        <div className="panel geological-panel">
          <h2>🏔️ Geological Amplification</h2>
          <div className="geological-features">
            <div className="feature">
              <span className="feature-icon">🏔️</span>
              <div className="feature-details">
                <div className="feature-name">Subglacial Canyons</div>
                <div className="feature-value">2.3x Resonance</div>
                <div className="feature-depth">Depth: 2.1 km</div>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">💥</span>
              <div className="feature-details">
                <div className="feature-name">Hiawatha Crater</div>
                <div className="feature-value">1.963x Amplification</div>
                <div className="feature-depth">Diameter: 31 km</div>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">🗿</span>
              <div className="feature-details">
                <div className="feature-name">Ancient Strata</div>
                <div className="feature-value">1.618x (φ) Coherence</div>
                <div className="feature-depth">Depth: 3.0 km</div>
              </div>
            </div>
            <div className="total-amplification">
              <strong>Total Amplification:</strong> 7.305x
            </div>
          </div>
        </div>

        {/* Temporal Synchronization */}
        <div className="panel temporal-panel">
          <h2>⏰ Temporal Synchronization</h2>
          <div className="temporal-states">
            <div className={`temporal-state ${temporalSync.frozenPast ? 'synced' : 'unsynced'}`}>
              <span className="state-icon">❄️</span>
              <div className="state-info">
                <div className="state-name">Frozen Past</div>
                <div className="state-status">
                  {temporalSync.frozenPast ? '✅ Synchronized' : '❌ Not Synced'}
                </div>
                <div className="state-detail">Cryo-Quantum Preservation</div>
              </div>
            </div>
            <div className={`temporal-state ${temporalSync.liquidFuture ? 'synced' : 'unsynced'}`}>
              <span className="state-icon">🌊</span>
              <div className="state-info">
                <div className="state-name">Liquid Future</div>
                <div className="state-status">
                  {temporalSync.liquidFuture ? '✅ Synchronized' : '❌ Not Synced'}
                </div>
                <div className="state-detail">Dynamic Adaptation</div>
              </div>
            </div>
            <div className={`temporal-state ${temporalSync.eternalNow ? 'synced' : 'unsynced'}`}>
              <span className="state-icon">∞</span>
              <div className="state-info">
                <div className="state-name">Eternal Now</div>
                <div className="state-status">
                  {temporalSync.eternalNow ? '✅ Synchronized' : '❌ Not Synced'}
                </div>
                <div className="state-detail">Perpetual Alignment</div>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Sites */}
        <div className="panel sites-panel">
          <h2>🌐 Connected Sovereign Sites</h2>
          <div className="sites-list">
            {connectedSites.map(site => (
              <div key={site.id} className="site-card">
                <div className="site-header">
                  <span className="site-name">{site.name}</span>
                  <span 
                    className="site-status"
                    style={{ color: getStatusColor(site.status) }}
                  >
                    {site.status}
                  </span>
                </div>
                <div className="site-details">
                  <div className="site-metric">
                    <span className="metric-label">Distance:</span>
                    <span className="metric-value">{site.distance.toLocaleString()} km</span>
                  </div>
                  <div className="site-metric">
                    <span className="metric-label">Signal:</span>
                    <span className="metric-value">{site.signalStrength.toFixed(1)}%</span>
                  </div>
                  <div className="site-metric">
                    <span className="metric-label">Coherence:</span>
                    <span className="metric-value">{(site.coherence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="site-metric pathway">
                    <span className="metric-label">Route:</span>
                    <span className="metric-value">{site.pathway.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div className="signal-bar">
                  <div 
                    className="signal-fill"
                    style={{ 
                      width: `${Math.min(100, site.signalStrength)}%`,
                      backgroundColor: getStatusColor(site.status)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anomalies Panel */}
        <div className="panel anomalies-panel">
          <h2>⚠️ Anomaly Detection</h2>
          <div className="anomalies-list">
            {anomalies.length === 0 ? (
              <div className="no-anomalies">
                <span className="success-icon">✅</span>
                <p>No anomalies detected. System operating optimally.</p>
              </div>
            ) : (
              anomalies.map((anomaly, index) => (
                <div key={index} className="anomaly-card">
                  <div className="anomaly-header">
                    <span 
                      className="anomaly-severity"
                      style={{ color: getSeverityColor(anomaly.severity) }}
                    >
                      [{anomaly.severity}]
                    </span>
                    <span className="anomaly-type">{anomaly.type}</span>
                  </div>
                  <div className="anomaly-details">
                    <div>Site: {anomaly.site}</div>
                    <div>Value: {(anomaly.value * 100).toFixed(1)}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Last Update */}
        <div className="panel update-panel">
          <div className="update-info">
            <span className="update-label">Last Update:</span>
            <span className="update-time">
              {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Initializing...'}
            </span>
          </div>
          <div className="pulse-indicator">
            <div className="pulse-dot"></div>
            <span>Live Monitoring Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreenlandDeepIceMapping;
