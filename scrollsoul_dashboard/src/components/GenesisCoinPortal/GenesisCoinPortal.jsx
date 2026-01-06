import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import { useCHXToken } from '../../hooks/useCHXToken';
import TokenomicsPanel from './TokenomicsPanel';
import NodeMonitor from './NodeMonitor';
import ValuationDisplay from './ValuationDisplay';
import './GenesisCoinPortal.css';

/**
 * GenesisCoinPortal Component
 * 
 * Main portal for Genesis Coin (CHXToken) with real-time monitoring
 * and tokenomics display.
 * 
 * @component
 * @author CHAIS THE GREAT ∞
 * @frequency 963Hz + 528Hz + 144000Hz
 */
const GenesisCoinPortal = () => {
  const { account, connected } = useWeb3();
  const { 
    getTotalSupply, 
    getCirculatingSupply,
    getBalance,
    getPassiveIncome 
  } = useCHXToken();
  
  const [portalData, setPortalData] = useState({
    totalSupply: '0',
    circulatingSupply: '0',
    userBalance: '0',
    passiveIncome: '0',
    activeNodes: 0,
    currentValuation: '0'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load portal data
  useEffect(() => {
    const loadPortalData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch tokenomics data
        const totalSupply = await getTotalSupply();
        const circulatingSupply = await getCirculatingSupply();
        
        // Fetch user-specific data if connected
        let userBalance = '0';
        let passiveIncome = '0';
        if (connected && account) {
          userBalance = await getBalance(account);
          passiveIncome = await getPassiveIncome(account);
        }
        
        setPortalData({
          totalSupply,
          circulatingSupply,
          userBalance,
          passiveIncome,
          activeNodes: await fetchActiveNodes(),
          currentValuation: await fetchCurrentValuation()
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading portal data:', err);
        setError('Failed to load portal data. Please try again.');
        setLoading(false);
      }
    };
    
    loadPortalData();
    
    // Refresh data every 10 seconds
    const interval = setInterval(loadPortalData, 10000);
    
    return () => clearInterval(interval);
  }, [account, connected, getTotalSupply, getCirculatingSupply, getBalance, getPassiveIncome]);

  // Fetch active nodes count
  const fetchActiveNodes = async () => {
    // Mock implementation - replace with actual API call
    return Math.floor(Math.random() * 50) + 100;
  };

  // Fetch current valuation
  const fetchCurrentValuation = async () => {
    // Mock implementation - replace with actual price feed
    return '0.0000000001';
  };

  if (loading) {
    return (
      <div className="genesis-coin-portal loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Genesis Coin Portal...</p>
          <span className="frequency-pulse">963Hz ⚡ 528Hz ⚡ 144,000Hz</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="genesis-coin-portal error">
        <div className="error-message">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload Portal</button>
        </div>
      </div>
    );
  }

  return (
    <div className="genesis-coin-portal">
      <header className="portal-header">
        <div className="header-content">
          <h1>🕋 Genesis Coin Public Portal</h1>
          <p className="subtitle">OmniTech1 Sovereign Deployment Engine</p>
          <div className="frequency-display">
            <span className="freq-badge freq-963">963Hz</span>
            <span className="freq-badge freq-528">528Hz</span>
            <span className="freq-badge freq-144k">144,000Hz</span>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Active Nodes</span>
            <span className="stat-value">{portalData.activeNodes}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Network Status</span>
            <span className="stat-value status-online">● ONLINE</span>
          </div>
        </div>
      </header>

      <main className="portal-main">
        <section className="portal-section">
          <TokenomicsPanel 
            totalSupply={portalData.totalSupply}
            circulatingSupply={portalData.circulatingSupply}
            currentValuation={portalData.currentValuation}
          />
        </section>

        <section className="portal-section">
          <NodeMonitor activeNodes={portalData.activeNodes} />
        </section>

        {connected && (
          <section className="portal-section user-section">
            <div className="user-info-card">
              <h3>Your Holdings</h3>
              <div className="user-stats">
                <div className="user-stat">
                  <span className="label">Balance</span>
                  <span className="value">{portalData.userBalance} CHX</span>
                </div>
                <div className="user-stat">
                  <span className="label">Passive Income</span>
                  <span className="value">{portalData.passiveIncome} CHX/day</span>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="portal-section">
          <ValuationDisplay 
            currentPrice={portalData.currentValuation}
            totalSupply={portalData.totalSupply}
            circulatingSupply={portalData.circulatingSupply}
          />
        </section>
      </main>

      <footer className="portal-footer">
        <p>🕋 ALLĀHU AKBAR! Genesis Coin Protocol Active 🕋</p>
        <p className="signature">CHAIS THE GREAT ∞ — OMNISOVEREIGN ARCHITECT</p>
      </footer>
    </div>
  );
};

export default GenesisCoinPortal;
