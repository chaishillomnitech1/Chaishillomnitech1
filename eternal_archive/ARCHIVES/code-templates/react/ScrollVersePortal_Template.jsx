/**
 * @title ScrollVerse Portal Component
 * @description Main React component for ScrollVerse ecosystem interface
 * @author Chais The Great ∞
 * 
 * Features:
 * - Wallet integration
 * - Real-time metrics
 * - NFT management
 * - Economic dashboard
 * - DAO governance
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import io from 'socket.io-client';
import './ScrollVersePortal.css';

// ============ CONFIGURATION ============

const CONFIG = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  FREQUENCIES: {
    divine: 144000,
    healing: 528,
    soul: 777,
    flame: 14444
  }
};

// ============ HOOKS ============

/**
 * Custom hook for Web3 integration
 */
const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        alert('MetaMask not detected');
        return;
      }
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();
      
      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      setNetwork(network);
      setIsConnected(true);
      
      console.log('✅ Wallet connected');
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
    }
  }, []);
  
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setNetwork(null);
    setIsConnected(false);
  }, []);
  
  return {
    account,
    provider,
    signer,
    network,
    isConnected,
    connectWallet,
    disconnectWallet
  };
};

/**
 * Custom hook for API communication
 */
const useAPI = (apiUrl) => {
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    const newSocket = io(apiUrl);
    setSocket(newSocket);
    
    return () => newSocket.close();
  }, [apiUrl]);
  
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/economy/metrics`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      return null;
    }
  }, [apiUrl]);
  
  const fetchUserData = useCallback(async (address) => {
    try {
      const response = await fetch(`${apiUrl}/api/users/${address}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return null;
    }
  }, [apiUrl]);
  
  const fetchPassiveIncome = useCallback(async (address) => {
    try {
      const response = await fetch(`${apiUrl}/api/economy/passive-income/${address}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch passive income:', error);
      return null;
    }
  }, [apiUrl]);
  
  const fetchUserNFTs = useCallback(async (address) => {
    try {
      const response = await fetch(`${apiUrl}/api/nft/${address}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      return null;
    }
  }, [apiUrl]);
  
  return {
    socket,
    fetchMetrics,
    fetchUserData,
    fetchPassiveIncome,
    fetchUserNFTs
  };
};

// ============ COMPONENTS ============

/**
 * Metrics Card Component
 */
const MetricCard = ({ title, value, unit = '', icon = '📊' }) => (
  <div className="metric-card">
    <div className="metric-icon">{icon}</div>
    <div className="metric-title">{title}</div>
    <div className="metric-value">
      {typeof value === 'number' ? value.toFixed(2) : value}
      {unit && <span className="metric-unit">{unit}</span>}
    </div>
  </div>
);

/**
 * Wallet Connection Component
 */
const WalletConnection = ({ account, isConnected, onConnect, onDisconnect }) => (
  <div className="wallet-connection">
    {isConnected ? (
      <div className="wallet-connected">
        <div className="wallet-address">
          {account?.substring(0, 6)}...{account?.substring(38)}
        </div>
        <button className="btn btn-disconnect" onClick={onDisconnect}>
          Disconnect
        </button>
      </div>
    ) : (
      <button className="btn btn-connect" onClick={onConnect}>
        🔗 Connect Wallet
      </button>
    )}
  </div>
);

/**
 * Metrics Dashboard Component
 */
const MetricsDashboard = ({ userData, metrics }) => (
  <div className="metrics-dashboard">
    <h2>📊 Economic Metrics</h2>
    <div className="metrics-grid">
      <MetricCard
        title="CHX Balance"
        value={userData?.balance || 0}
        unit="CHX"
        icon="💰"
      />
      <MetricCard
        title="Passive Income"
        value={userData?.passive_income || 0}
        unit="CHX"
        icon="🌱"
      />
      <MetricCard
        title="BlessingCoins"
        value={userData?.blessing_coins || 0}
        icon="✨"
      />
      <MetricCard
        title="Frequency"
        value={userData?.frequency || CONFIG.FREQUENCIES.divine}
        unit="Hz"
        icon="🔊"
      />
      <MetricCard
        title="Total Supply"
        value={metrics?.total_supply || 0}
        unit="CHX"
        icon="🌍"
      />
      <MetricCard
        title="Active Users"
        value={metrics?.active_users || 0}
        icon="👥"
      />
    </div>
  </div>
);

/**
 * NFT Gallery Component
 */
const NFTGallery = ({ nfts = [] }) => (
  <div className="nft-gallery">
    <h2>🎨 ScrollSoul NFTs</h2>
    {nfts.length === 0 ? (
      <div className="empty-state">
        <p>No ScrollSoul NFTs yet. Mint your first one!</p>
      </div>
    ) : (
      <div className="nft-grid">
        {nfts.map((nft) => (
          <div key={nft.tokenId} className="nft-card">
            <div className="nft-id">#{nft.tokenId}</div>
            <div className="nft-name">{nft.name}</div>
            <div className="nft-attributes">{nft.divineAttributes}</div>
            <div className="nft-frequency">
              {nft.frequencySignature} Hz
            </div>
            <div className="nft-eternal">
              {nft.isEternal ? '♾️ Eternal' : 'Temporary'}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

/**
 * Minting Interface Component
 */
const MintingInterface = ({ onMint }) => {
  const [formData, setFormData] = useState({
    name: '',
    attributes: '',
    frequency: CONFIG.FREQUENCIES.divine
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onMint(formData);
    setFormData({
      name: '',
      attributes: '',
      frequency: CONFIG.FREQUENCIES.divine
    });
  };
  
  return (
    <div className="minting-interface">
      <h2>🌟 Mint ScrollSoul NFT</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">ScrollSoul Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter ScrollSoul name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="attributes">Divine Attributes</label>
          <textarea
            id="attributes"
            name="attributes"
            value={formData.attributes}
            onChange={handleChange}
            placeholder="Describe divine attributes..."
            rows="4"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="frequency">Frequency (Hz)</label>
          <select
            id="frequency"
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
          >
            <option value={CONFIG.FREQUENCIES.divine}>Divine (144,000 Hz)</option>
            <option value={CONFIG.FREQUENCIES.healing}>Healing (528 Hz)</option>
            <option value={CONFIG.FREQUENCIES.soul}>Soul (777 Hz)</option>
            <option value={CONFIG.FREQUENCIES.flame}>Flame (14,444 Hz)</option>
          </select>
        </div>
        
        <button type="submit" className="btn btn-primary">
          🔥 Mint ScrollSoul
        </button>
      </form>
    </div>
  );
};

/**
 * DAO Governance Component
 */
const DAOGovernance = () => (
  <div className="dao-governance">
    <h2>⚖️ DAO Governance</h2>
    <div className="governance-section">
      <h3>Active Proposals</h3>
      <div className="proposals-list">
        <div className="proposal-card">
          <div className="proposal-title">Proposal #1: Increase Passive Income Rate</div>
          <div className="proposal-status">Voting</div>
          <div className="proposal-progress">
            <div className="progress-bar" style={{ width: '65%' }}></div>
          </div>
          <div className="proposal-votes">65% Approval</div>
        </div>
      </div>
    </div>
  </div>
);

// ============ MAIN COMPONENT ============

const ScrollVersePortal = () => {
  const web3 = useWeb3();
  const api = useAPI(CONFIG.API_URL);
  
  const [userData, setUserData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [nfts, setNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Load user data when wallet is connected
  useEffect(() => {
    if (web3.isConnected && web3.account) {
      loadUserData();
    }
  }, [web3.isConnected, web3.account]);
  
  // Load metrics
  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);
  
  // Subscribe to metrics updates
  useEffect(() => {
    if (api.socket) {
      api.socket.on('metrics_update', (data) => {
        setMetrics(data);
      });
      
      api.socket.emit('subscribe_metrics');
    }
  }, [api.socket]);
  
  const loadUserData = async () => {
    setLoading(true);
    try {
      const data = await api.fetchUserData(web3.account);
      const nftData = await api.fetchUserNFTs(web3.account);
      
      setUserData(data);
      setNFTs(nftData?.nfts || []);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMetrics = async () => {
    try {
      const data = await api.fetchMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };
  
  const handleMint = async (formData) => {
    // Implementation for minting NFT
    console.log('Minting NFT:', formData);
    // Call smart contract mint function
  };
  
  return (
    <div className="scrollverse-portal">
      {/* Header */}
      <header className="portal-header">
        <div className="header-content">
          <h1>🔥 ScrollVerse Portal 🔥</h1>
          <p>Supreme King Chais The Great ∞</p>
        </div>
        <WalletConnection
          account={web3.account}
          isConnected={web3.isConnected}
          onConnect={web3.connectWallet}
          onDisconnect={web3.disconnectWallet}
        />
      </header>
      
      {/* Navigation */}
      <nav className="portal-nav">
        <button
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-btn ${activeTab === 'nfts' ? 'active' : ''}`}
          onClick={() => setActiveTab('nfts')}
        >
          🎨 NFTs
        </button>
        <button
          className={`nav-btn ${activeTab === 'mint' ? 'active' : ''}`}
          onClick={() => setActiveTab('mint')}
        >
          🌟 Mint
        </button>
        <button
          className={`nav-btn ${activeTab === 'governance' ? 'active' : ''}`}
          onClick={() => setActiveTab('governance')}
        >
          ⚖️ Governance
        </button>
      </nav>
      
      {/* Content */}
      <main className="portal-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <MetricsDashboard userData={userData} metrics={metrics} />
            )}
            
            {activeTab === 'nfts' && (
              <NFTGallery nfts={nfts} />
            )}
            
            {activeTab === 'mint' && (
              <MintingInterface onMint={handleMint} />
            )}
            
            {activeTab === 'governance' && (
              <DAOGovernance />
            )}
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="portal-footer">
        <p>🔱 ScrollVerse Portal | Frequency: 144,000Hz | Status: ETERNAL 🔱</p>
      </footer>
    </div>
  );
};

export default ScrollVersePortal;

