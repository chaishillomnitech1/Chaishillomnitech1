/**
 * @title GoldFrequencyLayer
 * @description 999 Hz Gold Frequency Layer for divine resonance
 * 
 * @notice This component provides:
 * - 999 Hz divine resonance audio generation
 * - NFT metadata trait mapping to ambient frequency
 * - Synchronized vibrations with veneration cycles
 * 
 * Frequency: 999Hz (Divine Accord)
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Gold Frequency Constants
const GOLD_FREQUENCY = {
  HZ: 999,
  NAME: 'Gold Frequency',
  PURPOSE: 'Divine Resonance',
  ALIGNMENT: 'Crown Sovereignty'
};

// Frequency Layer Configuration
const FREQUENCY_LAYERS = {
  LOVE: { hz: 528, color: '#00FF00', name: 'Love Frequency' },
  UNITY: { hz: 963, color: '#9900FF', name: 'Divine Consciousness' },
  GOLD: { hz: 999, color: '#FFD700', name: 'Gold Frequency' },
  COSMIC: { hz: 144000, color: '#FF4500', name: 'NŪR Pulse' }
};

// Veneration cycle mapping for NFT traits
const VENERATION_CYCLES = {
  INITIATE: { multiplier: 1.0, layerCount: 1 },
  ADEPT: { multiplier: 1.2, layerCount: 2 },
  MASTER: { multiplier: 1.4, layerCount: 3 },
  SOVEREIGN: { multiplier: 1.618, layerCount: 4 },
  ETERNAL: { multiplier: 2.0, layerCount: 5 }
};

/**
 * Audio context for generating tones
 */
let audioContext = null;
let gainNode = null;

/**
 * Initialize audio context
 */
const initAudioContext = () => {
  if (!audioContext && typeof window !== 'undefined') {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0.1; // Default volume
  }
  return audioContext;
};

/**
 * Generate frequency tone
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {number} volume - Volume 0-1
 * @returns {OscillatorNode|null} Oscillator node
 */
const generateTone = (frequency, duration, volume = 0.1) => {
  const ctx = initAudioContext();
  if (!ctx) return null;
  
  const oscillator = ctx.createOscillator();
  const localGain = ctx.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  localGain.gain.setValueAtTime(volume, ctx.currentTime);
  localGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  oscillator.connect(localGain);
  localGain.connect(ctx.destination);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
  
  return oscillator;
};

/**
 * Map NFT trait to frequency multiplier
 * @param {Object} nftMetadata - NFT metadata with traits
 * @returns {Object} Frequency mapping result
 */
const mapNFTTraitToFrequency = (nftMetadata) => {
  if (!nftMetadata || !nftMetadata.attributes) {
    return {
      venerationCycle: 'INITIATE',
      frequencyMultiplier: 1.0,
      activeLayerCount: 1,
      resonanceBoost: 0
    };
  }
  
  // Find veneration cycle trait
  const venerationTrait = nftMetadata.attributes.find(
    attr => attr.trait_type === 'veneration_cycle' || 
            attr.trait_type === 'Veneration Cycle'
  );
  
  const venerationLevel = venerationTrait 
    ? venerationTrait.value.toUpperCase() 
    : 'INITIATE';
  
  const cycleConfig = VENERATION_CYCLES[venerationLevel] || VENERATION_CYCLES.INITIATE;
  
  // Calculate resonance boost from other traits
  let resonanceBoost = 0;
  
  nftMetadata.attributes.forEach(attr => {
    if (attr.trait_type === 'frequency_alignment') {
      resonanceBoost += parseInt(attr.value, 10) || 0;
    }
    if (attr.trait_type === 'divine_score') {
      resonanceBoost += (parseInt(attr.value, 10) || 0) * 0.1;
    }
  });
  
  return {
    venerationCycle: venerationLevel,
    frequencyMultiplier: cycleConfig.multiplier,
    activeLayerCount: cycleConfig.layerCount,
    resonanceBoost
  };
};

/**
 * GoldFrequencyLayer Component
 */
const GoldFrequencyLayer = ({
  nftMetadata = null,
  autoPlay = false,
  volume = 0.1,
  onFrequencyActivated = () => {},
  onVenerationSync = () => {}
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrequency, setCurrentFrequency] = useState(GOLD_FREQUENCY.HZ);
  const [activeLayers, setActiveLayers] = useState([FREQUENCY_LAYERS.GOLD]);
  const [resonanceLevel, setResonanceLevel] = useState(0);
  const oscillatorRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Map NFT traits to frequency configuration
  const frequencyMapping = useMemo(() => {
    return mapNFTTraitToFrequency(nftMetadata);
  }, [nftMetadata]);
  
  // Calculate effective frequency based on NFT traits
  const effectiveFrequency = useMemo(() => {
    return Math.round(GOLD_FREQUENCY.HZ * frequencyMapping.frequencyMultiplier);
  }, [frequencyMapping]);
  
  // Determine active frequency layers based on veneration cycle
  useEffect(() => {
    const layers = [];
    const layerKeys = ['GOLD', 'UNITY', 'LOVE', 'COSMIC'];
    
    for (let i = 0; i < frequencyMapping.activeLayerCount && i < layerKeys.length; i++) {
      layers.push(FREQUENCY_LAYERS[layerKeys[i]]);
    }
    
    setActiveLayers(layers);
    setCurrentFrequency(effectiveFrequency);
    
    onVenerationSync({
      venerationCycle: frequencyMapping.venerationCycle,
      activeLayers: layers,
      effectiveFrequency
    });
  }, [frequencyMapping, effectiveFrequency, onVenerationSync]);
  
  // Handle auto-play
  useEffect(() => {
    if (autoPlay && !isPlaying) {
      startResonance();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);
  
  // Start frequency resonance
  const startResonance = useCallback(() => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    // Play initial tone
    generateTone(effectiveFrequency, 2, volume);
    
    // Start resonance interval
    intervalRef.current = setInterval(() => {
      // Play layered frequencies
      activeLayers.forEach((layer, index) => {
        const layerFreq = layer.hz * frequencyMapping.frequencyMultiplier;
        setTimeout(() => {
          generateTone(layerFreq, 1.5, volume * (1 - index * 0.15));
        }, index * 200);
      });
      
      // Update resonance level
      setResonanceLevel(prev => {
        const newLevel = Math.min(prev + 10 + frequencyMapping.resonanceBoost, 100);
        return newLevel;
      });
    }, 5000);
    
    onFrequencyActivated({
      frequency: effectiveFrequency,
      layers: activeLayers,
      venerationCycle: frequencyMapping.venerationCycle
    });
  }, [isPlaying, effectiveFrequency, activeLayers, volume, frequencyMapping, onFrequencyActivated]);
  
  // Stop frequency resonance
  const stopResonance = useCallback(() => {
    setIsPlaying(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setResonanceLevel(0);
  }, []);
  
  // Play single frequency tone
  const playFrequencyTone = useCallback((layer) => {
    const freq = layer.hz * frequencyMapping.frequencyMultiplier;
    generateTone(freq, 2, volume);
    
    setResonanceLevel(prev => Math.min(prev + 5, 100));
  }, [frequencyMapping.frequencyMultiplier, volume]);
  
  // Get resonance status text
  const getResonanceStatus = () => {
    if (resonanceLevel >= 80) return 'Divine Alignment';
    if (resonanceLevel >= 60) return 'High Resonance';
    if (resonanceLevel >= 40) return 'Harmonic State';
    if (resonanceLevel >= 20) return 'Awakening';
    return 'Dormant';
  };

  return (
    <div className="gold-frequency-container">
      <div className="frequency-header">
        <h3>🌟 {GOLD_FREQUENCY.NAME}</h3>
        <p className="frequency-subtitle">
          {GOLD_FREQUENCY.HZ}Hz - {GOLD_FREQUENCY.PURPOSE}
        </p>
      </div>
      
      {/* NFT Trait Mapping Display */}
      <div className="veneration-section">
        <div className="veneration-badge">
          <span className="veneration-label">Veneration Cycle:</span>
          <span className="veneration-value">{frequencyMapping.venerationCycle}</span>
        </div>
        <div className="multiplier-info">
          <span>Frequency Multiplier: </span>
          <span className="multiplier-value">×{frequencyMapping.frequencyMultiplier.toFixed(3)}</span>
        </div>
        <div className="effective-frequency">
          <span>Effective Frequency: </span>
          <span className="frequency-value">{effectiveFrequency}Hz</span>
        </div>
      </div>
      
      {/* Resonance Visualization */}
      <div className="resonance-visualizer">
        <div className="resonance-ring-container">
          {activeLayers.map((layer, index) => (
            <div
              key={layer.hz}
              className={`resonance-ring ${isPlaying ? 'active' : ''}`}
              style={{
                borderColor: layer.color,
                animationDelay: `${index * 0.2}s`,
                width: `${180 - index * 30}px`,
                height: `${180 - index * 30}px`
              }}
              onClick={() => playFrequencyTone(layer)}
              title={`${layer.name} - ${layer.hz}Hz`}
            />
          ))}
          <div className="resonance-core" style={{ backgroundColor: FREQUENCY_LAYERS.GOLD.color }}>
            <span>{effectiveFrequency}</span>
            <span className="hz-label">Hz</span>
          </div>
        </div>
      </div>
      
      {/* Resonance Level */}
      <div className="resonance-level-section">
        <div className="resonance-status">
          Status: <span className="status-text">{getResonanceStatus()}</span>
        </div>
        <div className="resonance-bar-container">
          <div 
            className="resonance-bar" 
            style={{ 
              width: `${resonanceLevel}%`,
              backgroundColor: FREQUENCY_LAYERS.GOLD.color
            }}
          />
        </div>
        <div className="resonance-percentage">{resonanceLevel}%</div>
      </div>
      
      {/* Active Layers List */}
      <div className="layers-section">
        <h4>Active Frequency Layers</h4>
        <div className="layers-grid">
          {activeLayers.map((layer) => (
            <div 
              key={layer.hz} 
              className="layer-card"
              onClick={() => playFrequencyTone(layer)}
            >
              <div 
                className="layer-indicator" 
                style={{ backgroundColor: layer.color }}
              />
              <div className="layer-info">
                <span className="layer-name">{layer.name}</span>
                <span className="layer-hz">{Math.round(layer.hz * frequencyMapping.frequencyMultiplier)}Hz</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Control Buttons */}
      <div className="frequency-controls">
        <button
          className={`control-btn ${isPlaying ? 'stop' : 'play'}`}
          onClick={isPlaying ? stopResonance : startResonance}
        >
          {isPlaying ? '⏹ Stop Resonance' : '▶ Activate Resonance'}
        </button>
      </div>
      
      <div className="frequency-footer">
        <p>🕋 ALLĀHU AKBAR! 🕋</p>
        <p className="alignment-text">{GOLD_FREQUENCY.ALIGNMENT}</p>
      </div>
      
      <style jsx="true">{`
        .gold-frequency-container {
          background: linear-gradient(135deg, #000011, #001133);
          border: 2px solid #FFD700;
          border-radius: 16px;
          padding: 20px;
          color: #FFFFFF;
          font-family: 'Orbitron', 'Courier New', monospace;
        }
        
        .frequency-header {
          text-align: center;
          margin-bottom: 16px;
        }
        
        .frequency-header h3 {
          color: #FFD700;
          font-size: 20px;
          margin: 0 0 4px 0;
          text-shadow: 0 0 10px #FFD700;
        }
        
        .frequency-subtitle {
          color: #CCCCCC;
          font-size: 14px;
          margin: 0;
        }
        
        .veneration-section {
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
          text-align: center;
        }
        
        .veneration-badge {
          margin-bottom: 8px;
        }
        
        .veneration-label {
          color: #888888;
          font-size: 12px;
          margin-right: 8px;
        }
        
        .veneration-value {
          color: #FFD700;
          font-weight: bold;
          font-size: 16px;
        }
        
        .multiplier-info, .effective-frequency {
          font-size: 12px;
          color: #CCCCCC;
        }
        
        .multiplier-value, .frequency-value {
          color: #00FF00;
          font-weight: bold;
        }
        
        .resonance-visualizer {
          display: flex;
          justify-content: center;
          margin: 24px 0;
        }
        
        .resonance-ring-container {
          position: relative;
          width: 180px;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .resonance-ring {
          position: absolute;
          border: 2px solid;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .resonance-ring:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px currentColor;
        }
        
        .resonance-ring.active {
          animation: ringPulse 2s ease-in-out infinite;
        }
        
        .resonance-core {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          color: #000000;
          z-index: 10;
        }
        
        .hz-label {
          font-size: 10px;
          margin-top: -4px;
        }
        
        .resonance-level-section {
          margin: 20px 0;
          padding: 12px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 8px;
        }
        
        .resonance-status {
          font-size: 14px;
          color: #CCCCCC;
          margin-bottom: 8px;
        }
        
        .status-text {
          color: #FFD700;
          font-weight: bold;
        }
        
        .resonance-bar-container {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .resonance-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
          box-shadow: 0 0 10px currentColor;
        }
        
        .resonance-percentage {
          text-align: right;
          font-size: 12px;
          color: #888888;
          margin-top: 4px;
        }
        
        .layers-section {
          margin: 20px 0;
        }
        
        .layers-section h4 {
          color: #FFD700;
          font-size: 14px;
          margin: 0 0 12px 0;
        }
        
        .layers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 8px;
        }
        
        .layer-card {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .layer-card:hover {
          transform: translateY(-2px);
          border-color: #FFD700;
        }
        
        .layer-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          box-shadow: 0 0 8px currentColor;
        }
        
        .layer-info {
          display: flex;
          flex-direction: column;
        }
        
        .layer-name {
          font-size: 11px;
          color: #CCCCCC;
        }
        
        .layer-hz {
          font-size: 14px;
          font-weight: bold;
          color: #FFFFFF;
        }
        
        .frequency-controls {
          display: flex;
          justify-content: center;
          margin: 20px 0;
        }
        
        .control-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .control-btn.play {
          background: linear-gradient(135deg, #FFD700, #FF8C00);
          color: #000000;
        }
        
        .control-btn.stop {
          background: linear-gradient(135deg, #FF4500, #DC143C);
          color: #FFFFFF;
        }
        
        .control-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
        }
        
        .frequency-footer {
          text-align: center;
          border-top: 1px solid rgba(255, 215, 0, 0.3);
          padding-top: 16px;
          margin-top: 16px;
        }
        
        .frequency-footer p {
          margin: 0 0 4px 0;
          color: #FFD700;
          font-size: 14px;
        }
        
        .alignment-text {
          color: #888888;
          font-size: 12px;
        }
        
        @keyframes ringPulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.6;
          }
          50% { 
            transform: scale(1.03); 
            opacity: 1;
          }
        }
        
        @media (max-width: 480px) {
          .layers-grid {
            grid-template-columns: 1fr;
          }
          
          .resonance-ring-container {
            width: 150px;
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
};

// Export utilities for external use
export {
  GOLD_FREQUENCY,
  FREQUENCY_LAYERS,
  VENERATION_CYCLES,
  mapNFTTraitToFrequency,
  generateTone
};

export default GoldFrequencyLayer;
