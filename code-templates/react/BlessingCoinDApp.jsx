/**
 * @title BlessingCoin dApp Frontend
 * @description Enhanced dApp with 888 Hz empathy frequencies and cosmic resonance
 * @author Supreme King Allah Chais Kenyatta Hill ∞
 * 
 * Phase-1 Redemption Narrative Deployment Features:
 * - ScrollCommand_AllTheAbove_Execution integration
 * - 888 Hz empathy frequency UI components
 * - Cosmic resonance visualization
 * - Storytelling functions with philanthropy awareness
 * - Real-time frequency alignment display
 * - Divine narrative overlay system
 * 
 * Frequency Integration:
 * - 888 Hz: Empathy and cosmic resonance
 * - 528 Hz: Love and healing visualization
 * - 963 Hz: Pineal activation effects
 * - 144,000 Hz: Supreme consciousness indicators
 * 
 * Status: PHASE-1 REDEMPTION NARRATIVE ACTIVE
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import './BlessingCoinDApp.css';

// ============ FREQUENCY CONSTANTS ============

const FREQUENCIES = {
  EMPATHY: 888,
  HEALING: 528,
  PINEAL: 963,
  CROWN: 999,
  NUR_PULSE: 144000
};

const COSMIC_COLORS = {
  888: '#FF6B9D', // Pink/Rose - Empathy
  528: '#00D9FF', // Cyan - Healing
  963: '#9D4EDD', // Purple - Pineal
  999: '#FFD700', // Gold - Crown
  144000: '#FFFFFF' // White - Divine
};

// ============ CUSTOM HOOKS ============

/**
 * Cosmic Resonance Audio Hook
 * Generates frequency-based audio feedback
 */
const useCosmicResonance = (frequency) => {
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  
  const playResonance = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
    oscillator.stop(context.currentTime + 0.5);
  }, [frequency]);
  
  return { playResonance };
};

/**
 * Frequency Alignment Hook
 */
const useFrequencyAlignment = (initialFrequency = FREQUENCIES.EMPATHY) => {
  const [currentFrequency, setCurrentFrequency] = useState(initialFrequency);
  const [alignmentLevel, setAlignmentLevel] = useState(0);
  
  useEffect(() => {
    // Simulate frequency alignment progress
    const interval = setInterval(() => {
      setAlignmentLevel(prev => {
        const newLevel = Math.min(prev + 1, 100);
        return newLevel;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [currentFrequency]);
  
  const alignToFrequency = useCallback((frequency) => {
    setCurrentFrequency(frequency);
    setAlignmentLevel(0);
  }, []);
  
  return { currentFrequency, alignmentLevel, alignToFrequency };
};

// ============ COMPONENTS ============

/**
 * Cosmic Resonance Visualizer
 * Displays real-time frequency visualization
 */
const CosmicResonanceVisualizer = ({ frequency, alignment }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw resonance wave
    ctx.strokeStyle = COSMIC_COLORS[frequency] || COSMIC_COLORS[888];
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const amplitude = (alignment / 100) * (height / 4);
    const frequencyScale = frequency / 100;
    
    for (let x = 0; x < width; x++) {
      const y = height / 2 + Math.sin((x * frequencyScale * Math.PI) / 180) * amplitude;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw alignment circle
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, alignment, 0, 2 * Math.PI);
    ctx.strokeStyle = COSMIC_COLORS[frequency];
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;
    
  }, [frequency, alignment]);
  
  return (
    <div className="cosmic-visualizer">
      <canvas ref={canvasRef} width={400} height={200} />
      <div className="frequency-label" style={{ color: COSMIC_COLORS[frequency] }}>
        {frequency} Hz - {alignment}% Aligned
      </div>
    </div>
  );
};

/**
 * Empathy Frequency Selector
 */
const EmpathyFrequencySelector = ({ onFrequencySelect, currentFrequency }) => {
  const frequencyOptions = [
    { value: FREQUENCIES.HEALING, label: '528 Hz - Love & Healing', desc: 'DNA repair and transformation' },
    { value: FREQUENCIES.EMPATHY, label: '888 Hz - Cosmic Empathy', desc: 'Empathy and resonance' },
    { value: FREQUENCIES.PINEAL, label: '963 Hz - Pineal Activation', desc: 'Divine connection' },
    { value: FREQUENCIES.CROWN, label: '999 Hz - Crown Frequency', desc: 'Tawhid flames' }
  ];
  
  return (
    <div className="frequency-selector">
      <h3>🔊 Select Cosmic Frequency</h3>
      <div className="frequency-grid">
        {frequencyOptions.map((option) => (
          <button
            key={option.value}
            className={`frequency-btn ${currentFrequency === option.value ? 'active' : ''}`}
            onClick={() => onFrequencySelect(option.value)}
            style={{
              borderColor: COSMIC_COLORS[option.value],
              backgroundColor: currentFrequency === option.value ? COSMIC_COLORS[option.value] + '20' : 'transparent'
            }}
          >
            <div className="frequency-label">{option.label}</div>
            <div className="frequency-desc">{option.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Blessing Distribution Card
 */
const BlessingDistributionCard = ({ onDistribute }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState(FREQUENCIES.EMPATHY);
  const { playResonance } = useCosmicResonance(selectedFrequency);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    playResonance();
    onDistribute({ recipient, amount, frequency: selectedFrequency });
    setRecipient('');
    setAmount('');
  };
  
  return (
    <div className="blessing-card">
      <h2>✨ Distribute BlessingCoins</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>
        
        <div className="form-group">
          <label>Amount (BLESS)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="1"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Empathy Frequency</label>
          <select
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(Number(e.target.value))}
          >
            <option value={FREQUENCIES.HEALING}>528 Hz - Healing</option>
            <option value={FREQUENCIES.EMPATHY}>888 Hz - Empathy</option>
            <option value={FREQUENCIES.PINEAL}>963 Hz - Pineal</option>
            <option value={FREQUENCIES.CROWN}>999 Hz - Crown</option>
          </select>
        </div>
        
        <button type="submit" className="btn-primary">
          🎁 Distribute Blessing
        </button>
      </form>
    </div>
  );
};

/**
 * Philanthropy Awareness Storytelling Component
 */
const PhilanthropyStory = () => {
  const [currentStory, setCurrentStory] = useState(0);
  
  const stories = [
    {
      title: "The Divine Mandate of Empathy",
      content: "Through 888 Hz cosmic resonance, BlessingCoins carry the frequency of universal empathy. Each transaction is an act of divine philanthropy, spreading love and abundance across the ScrollVerse.",
      frequency: FREQUENCIES.EMPATHY
    },
    {
      title: "ScrollCommand: All The Above Execution",
      content: "The ScrollCommand protocol executes all blessings simultaneously across dimensions. What was prophesied is now manifested through quantum alignment and sovereign transactions.",
      frequency: FREQUENCIES.CROWN
    },
    {
      title: "528 Hz Healing Integration",
      content: "Every BlessingCoin distribution carries the 528 Hz love frequency, initiating DNA repair and transformation in both sender and receiver, creating a perpetual healing cycle.",
      frequency: FREQUENCIES.HEALING
    },
    {
      title: "The Redemption Narrative",
      content: "Phase-1 deployment brings forth the redemption narrative where technology meets divine purpose. Each user interaction aligns with cosmic principles of abundance and sovereignty.",
      frequency: FREQUENCIES.PINEAL
    }
  ];
  
  const currentStoryData = stories[currentStory];
  
  const nextStory = () => {
    setCurrentStory((prev) => (prev + 1) % stories.length);
  };
  
  const prevStory = () => {
    setCurrentStory((prev) => (prev - 1 + stories.length) % stories.length);
  };
  
  return (
    <div className="philanthropy-story">
      <h2>📖 Divine Narrative</h2>
      <div className="story-content" style={{ borderColor: COSMIC_COLORS[currentStoryData.frequency] }}>
        <h3>{currentStoryData.title}</h3>
        <p>{currentStoryData.content}</p>
        <div className="story-frequency">
          Resonance: {currentStoryData.frequency} Hz
        </div>
      </div>
      <div className="story-navigation">
        <button onClick={prevStory} className="btn-nav">← Previous</button>
        <span className="story-indicator">{currentStory + 1} / {stories.length}</span>
        <button onClick={nextStory} className="btn-nav">Next →</button>
      </div>
    </div>
  );
};

/**
 * ScrollDrop Airdrop Component
 */
const ScrollDropAirdrop = ({ onClaimAirdrop }) => {
  const [merkleProof, setMerkleProof] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [claiming, setClaiming] = useState(false);
  const { playResonance } = useCosmicResonance(FREQUENCIES.EMPATHY);
  
  const handleClaim = async (e) => {
    e.preventDefault();
    setClaiming(true);
    playResonance();
    
    try {
      await onClaimAirdrop({ amount: claimAmount, proof: merkleProof });
    } finally {
      setClaiming(false);
    }
  };
  
  return (
    <div className="scrolldrop-card">
      <h2>🎁 ScrollDrop™ Airdrop</h2>
      <p className="airdrop-desc">
        Claim your BlessingCoins through the divine ScrollDrop mechanism. 
        Verified participants receive instant distributions with Layer-2 optimization.
      </p>
      
      <form onSubmit={handleClaim}>
        <div className="form-group">
          <label>Claim Amount (BLESS)</label>
          <input
            type="number"
            value={claimAmount}
            onChange={(e) => setClaimAmount(e.target.value)}
            placeholder="Enter claim amount"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Merkle Proof (JSON)</label>
          <textarea
            value={merkleProof}
            onChange={(e) => setMerkleProof(e.target.value)}
            placeholder='["0x...", "0x..."]'
            rows="4"
            required
          />
        </div>
        
        <button type="submit" className="btn-claim" disabled={claiming}>
          {claiming ? '⏳ Claiming...' : '✨ Claim BlessingCoins'}
        </button>
      </form>
    </div>
  );
};

// ============ MAIN COMPONENT ============

const BlessingCoinDApp = () => {
  const { currentFrequency, alignmentLevel, alignToFrequency } = useFrequencyAlignment();
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('distribute');
  
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error('Wallet connection failed:', error);
      }
    } else {
      alert('Please install MetaMask');
    }
  };
  
  const handleDistribute = async (data) => {
    console.log('Distributing blessing:', data);
    // Implement actual contract interaction
  };
  
  const handleClaimAirdrop = async (data) => {
    console.log('Claiming airdrop:', data);
    // Implement actual contract interaction
  };
  
  return (
    <div className="blessingcoin-dapp">
      {/* Header with Cosmic Resonance */}
      <header className="dapp-header">
        <div className="header-content">
          <h1 className="title-gradient">✨ BlessingCoin dApp ✨</h1>
          <p className="subtitle">Phase-1 Redemption Narrative | 888 Hz Empathy Frequency Active</p>
        </div>
        
        {!isConnected ? (
          <button className="btn-connect" onClick={connectWallet}>
            🔗 Connect Wallet
          </button>
        ) : (
          <div className="wallet-info">
            <div className="address">{account?.substring(0, 6)}...{account?.substring(38)}</div>
            <div className="balance">{balance} BLESS</div>
          </div>
        )}
      </header>
      
      {/* Cosmic Resonance Visualizer */}
      <section className="visualizer-section">
        <CosmicResonanceVisualizer 
          frequency={currentFrequency} 
          alignment={alignmentLevel} 
        />
      </section>
      
      {/* Frequency Selector */}
      <section className="frequency-section">
        <EmpathyFrequencySelector 
          onFrequencySelect={alignToFrequency}
          currentFrequency={currentFrequency}
        />
      </section>
      
      {/* Navigation Tabs */}
      <nav className="dapp-nav">
        <button 
          className={`nav-tab ${activeTab === 'distribute' ? 'active' : ''}`}
          onClick={() => setActiveTab('distribute')}
        >
          💝 Distribute
        </button>
        <button 
          className={`nav-tab ${activeTab === 'airdrop' ? 'active' : ''}`}
          onClick={() => setActiveTab('airdrop')}
        >
          🎁 ScrollDrop
        </button>
        <button 
          className={`nav-tab ${activeTab === 'story' ? 'active' : ''}`}
          onClick={() => setActiveTab('story')}
        >
          📖 Narrative
        </button>
      </nav>
      
      {/* Main Content */}
      <main className="dapp-content">
        {activeTab === 'distribute' && (
          <BlessingDistributionCard onDistribute={handleDistribute} />
        )}
        
        {activeTab === 'airdrop' && (
          <ScrollDropAirdrop onClaimAirdrop={handleClaimAirdrop} />
        )}
        
        {activeTab === 'story' && (
          <PhilanthropyStory />
        )}
      </main>
      
      {/* Footer */}
      <footer className="dapp-footer">
        <p>🕋 ScrollVerse Sovereign Deployment | VaultBinder™ Protocol Active</p>
        <p>Supreme King Allah Chais Kenyatta Hill ∞</p>
      </footer>
    </div>
  );
};

export default BlessingCoinDApp;
