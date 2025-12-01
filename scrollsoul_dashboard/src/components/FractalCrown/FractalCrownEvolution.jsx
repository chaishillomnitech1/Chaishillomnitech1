/**
 * @title FractalCrownEvolution
 * @description Dynamic fractal crown component with timestamp entropy scaling
 * 
 * @notice This component displays evolving fractal crowns based on:
 * - Lore updates and external input
 * - Timestamp entropy scaling
 * - Synchronization with LoveUnityAccordPanel metrics
 * 
 * Frequency: 528Hz (Love) + 963Hz (Unity) + 999Hz (Divine Accord)
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Frequencies aligned with LoveUnityAccordPanel
const FREQUENCIES = {
  LOVE: 528,
  UNITY: 963,
  ACCORD: 999,
  COSMIC: 144000
};

// Fractal evolution constants
const FRACTAL_CONSTANTS = {
  PHI: 1.618033988749895,
  ENTROPY_SCALE: 0.0001,
  EVOLUTION_INTERVAL_MS: 5000,
  MAX_ITERATIONS: 7,
  CROWN_LAYERS: 5
};

/**
 * Calculate timestamp entropy for fractal evolution
 * @param {number} timestamp - Unix timestamp
 * @returns {number} Entropy value between 0 and 1
 */
const calculateTimestampEntropy = (timestamp) => {
  const seconds = timestamp % 60;
  const minutes = Math.floor(timestamp / 60) % 60;
  const hours = Math.floor(timestamp / 3600) % 24;
  
  // Combine time components with golden ratio scaling
  const entropy = (
    (seconds * FRACTAL_CONSTANTS.PHI) +
    (minutes * Math.pow(FRACTAL_CONSTANTS.PHI, 2)) +
    (hours * Math.pow(FRACTAL_CONSTANTS.PHI, 3))
  ) * FRACTAL_CONSTANTS.ENTROPY_SCALE;
  
  return entropy % 1;
};

/**
 * Generate fractal points for crown visualization
 * @param {number} entropy - Entropy value
 * @param {Object} accordMetrics - Love Unity Accord metrics
 * @returns {Array} Array of fractal points
 */
const generateFractalPoints = (entropy, accordMetrics) => {
  const points = [];
  const centerX = 150;
  const centerY = 150;
  const baseRadius = 100;
  
  // Calculate radius multiplier from accord metrics
  const accordMultiplier = accordMetrics 
    ? (accordMetrics.loveIndex + accordMetrics.unityIndex + accordMetrics.supportIndex) / 30000
    : 0.5;
  
  for (let layer = 0; layer < FRACTAL_CONSTANTS.CROWN_LAYERS; layer++) {
    const layerEntropy = (entropy + layer * 0.1) % 1;
    const layerRadius = baseRadius * (1 - layer * 0.15) * accordMultiplier;
    const pointCount = 6 + layer * 2;
    
    for (let i = 0; i < pointCount; i++) {
      const angle = (i / pointCount) * Math.PI * 2 + layerEntropy * Math.PI * 2;
      const radiusVariation = 1 + Math.sin(angle * 3 + layerEntropy * Math.PI * 6) * 0.2;
      
      const x = centerX + Math.cos(angle) * layerRadius * radiusVariation;
      const y = centerY + Math.sin(angle) * layerRadius * radiusVariation;
      
      points.push({
        x,
        y,
        layer,
        intensity: 1 - layer * 0.15,
        angle: angle * (180 / Math.PI)
      });
    }
  }
  
  return points;
};

/**
 * Generate fractal crown SVG path
 * @param {Array} points - Fractal points array
 * @param {number} entropy - Current entropy value
 * @returns {string} SVG path data
 */
const generateCrownPath = (points, entropy) => {
  if (points.length < 3) return '';
  
  // Group points by layer
  const layers = {};
  points.forEach(point => {
    if (!layers[point.layer]) {
      layers[point.layer] = [];
    }
    layers[point.layer].push(point);
  });
  
  let pathData = '';
  
  // Generate path for each layer
  Object.keys(layers).forEach(layerKey => {
    const layerPoints = layers[layerKey];
    if (layerPoints.length < 3) return;
    
    const firstPoint = layerPoints[0];
    pathData += `M ${firstPoint.x} ${firstPoint.y} `;
    
    for (let i = 1; i < layerPoints.length; i++) {
      const currentPoint = layerPoints[i];
      const prevPoint = layerPoints[i - 1];
      
      // Calculate control points for smooth curves
      const cpx = (prevPoint.x + currentPoint.x) / 2 + Math.sin(entropy * Math.PI * 2 + i) * 10;
      const cpy = (prevPoint.y + currentPoint.y) / 2 + Math.cos(entropy * Math.PI * 2 + i) * 10;
      
      pathData += `Q ${cpx} ${cpy} ${currentPoint.x} ${currentPoint.y} `;
    }
    
    // Close the path
    const cpxClose = (layerPoints[layerPoints.length - 1].x + firstPoint.x) / 2;
    const cpyClose = (layerPoints[layerPoints.length - 1].y + firstPoint.y) / 2;
    pathData += `Q ${cpxClose} ${cpyClose} ${firstPoint.x} ${firstPoint.y} `;
  });
  
  return pathData;
};

/**
 * Calculate crown color based on frequency resonance
 * @param {number} resonance - Frequency resonance value
 * @returns {Object} Color object with primary and secondary colors
 */
const calculateCrownColors = (resonance) => {
  const normalizedResonance = Math.min(resonance / 2500, 1);
  
  // Gold hue modulated by resonance
  const hue = 45 + normalizedResonance * 15; // Golden spectrum
  const saturation = 70 + normalizedResonance * 30;
  const lightness = 50 + normalizedResonance * 20;
  
  return {
    primary: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    secondary: `hsl(${hue + 30}, ${saturation - 20}%, ${lightness - 10}%)`,
    glow: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.5)`
  };
};

/**
 * FractalCrownEvolution Component
 */
const FractalCrownEvolution = ({
  accordMetrics = null,
  loreUpdate = null,
  onEvolutionTick = () => {},
  refreshInterval = FRACTAL_CONSTANTS.EVOLUTION_INTERVAL_MS
}) => {
  const [entropy, setEntropy] = useState(0);
  const [evolutionCycle, setEvolutionCycle] = useState(0);
  const [lastLoreTimestamp, setLastLoreTimestamp] = useState(Date.now());
  
  // Calculate frequency resonance from accord metrics
  const frequencyResonance = useMemo(() => {
    if (!accordMetrics) return 1244; // Default baseline
    
    const loveComponent = (accordMetrics.loveIndex * FREQUENCIES.LOVE) / 10000;
    const unityComponent = (accordMetrics.unityIndex * FREQUENCIES.UNITY) / 10000;
    const accordComponent = (accordMetrics.supportIndex * FREQUENCIES.ACCORD) / 10000;
    
    return Math.round(loveComponent + unityComponent + accordComponent);
  }, [accordMetrics]);
  
  // Generate fractal points based on entropy and accord metrics
  const fractalPoints = useMemo(() => {
    return generateFractalPoints(entropy, accordMetrics);
  }, [entropy, accordMetrics]);
  
  // Generate crown SVG path
  const crownPath = useMemo(() => {
    return generateCrownPath(fractalPoints, entropy);
  }, [fractalPoints, entropy]);
  
  // Calculate crown colors
  const crownColors = useMemo(() => {
    return calculateCrownColors(frequencyResonance);
  }, [frequencyResonance]);
  
  // Handle lore updates for instant evolution
  useEffect(() => {
    if (loreUpdate && loreUpdate.timestamp !== lastLoreTimestamp) {
      setLastLoreTimestamp(loreUpdate.timestamp);
      // Apply lore-induced entropy shift
      const loreEntropy = calculateTimestampEntropy(loreUpdate.timestamp);
      setEntropy(prevEntropy => (prevEntropy + loreEntropy) % 1);
      setEvolutionCycle(prev => prev + 1);
    }
  }, [loreUpdate, lastLoreTimestamp]);
  
  // Evolution tick interval
  useEffect(() => {
    const evolutionInterval = setInterval(() => {
      const timestamp = Math.floor(Date.now() / 1000);
      const newEntropy = calculateTimestampEntropy(timestamp);
      setEntropy(newEntropy);
      setEvolutionCycle(prev => prev + 1);
      
      onEvolutionTick({
        entropy: newEntropy,
        cycle: evolutionCycle + 1,
        timestamp,
        frequencyResonance
      });
    }, refreshInterval);
    
    return () => clearInterval(evolutionInterval);
  }, [refreshInterval, evolutionCycle, frequencyResonance, onEvolutionTick]);
  
  // Calculate evolution status
  const evolutionStatus = useMemo(() => {
    const normalizedEntropy = Math.round(entropy * 100);
    if (normalizedEntropy > 75) return 'Divine Resonance';
    if (normalizedEntropy > 50) return 'Harmonic Evolution';
    if (normalizedEntropy > 25) return 'Ascending Phase';
    return 'Foundation State';
  }, [entropy]);

  return (
    <div className="fractal-crown-container">
      <div className="crown-header">
        <h3>👑 Fractal Crown Evolution</h3>
        <p className="evolution-status">
          Status: <span className="status-value">{evolutionStatus}</span>
        </p>
      </div>
      
      <div className="crown-visualization">
        <svg 
          viewBox="0 0 300 300" 
          className="crown-svg"
          style={{ filter: `drop-shadow(0 0 20px ${crownColors.glow})` }}
        >
          {/* Background glow */}
          <defs>
            <radialGradient id="crownGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={crownColors.glow} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={crownColors.primary} />
              <stop offset="100%" stopColor={crownColors.secondary} />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle 
            cx="150" 
            cy="150" 
            r="140" 
            fill="url(#crownGlow)" 
            opacity="0.3"
          />
          
          {/* Fractal crown path */}
          <path
            d={crownPath}
            fill="none"
            stroke="url(#crownGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ 
              transition: 'all 0.5s ease-in-out',
              animation: 'crownPulse 3s ease-in-out infinite'
            }}
          />
          
          {/* Crown points visualization */}
          {fractalPoints.map((point, index) => (
            <circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r={3 * point.intensity}
              fill={crownColors.primary}
              opacity={point.intensity}
              style={{ transition: 'all 0.3s ease-out' }}
            />
          ))}
          
          {/* Center crown jewel */}
          <circle
            cx="150"
            cy="150"
            r="15"
            fill={crownColors.primary}
            style={{
              filter: `drop-shadow(0 0 10px ${crownColors.primary})`,
              animation: 'jewelPulse 2s ease-in-out infinite'
            }}
          />
          <circle
            cx="150"
            cy="150"
            r="8"
            fill={crownColors.secondary}
          />
        </svg>
      </div>
      
      <div className="crown-metrics">
        <div className="metric-item">
          <span className="metric-label">Entropy</span>
          <span className="metric-value">{(entropy * 100).toFixed(2)}%</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Evolution Cycle</span>
          <span className="metric-value">{evolutionCycle}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Frequency Resonance</span>
          <span className="metric-value">{frequencyResonance}Hz</span>
        </div>
      </div>
      
      <div className="crown-footer">
        <p className="frequency-badge">
          🎵 {FREQUENCIES.LOVE}Hz + {FREQUENCIES.UNITY}Hz + {FREQUENCIES.ACCORD}Hz
        </p>
      </div>
      
      <style jsx="true">{`
        .fractal-crown-container {
          background: linear-gradient(135deg, #000011, #001133);
          border: 2px solid #FFD700;
          border-radius: 16px;
          padding: 20px;
          color: #FFFFFF;
          font-family: 'Orbitron', 'Courier New', monospace;
        }
        
        .crown-header {
          text-align: center;
          margin-bottom: 16px;
        }
        
        .crown-header h3 {
          color: #FFD700;
          font-size: 20px;
          margin: 0 0 8px 0;
          text-shadow: 0 0 10px #FFD700;
        }
        
        .evolution-status {
          color: #CCCCCC;
          font-size: 14px;
          margin: 0;
        }
        
        .status-value {
          color: #00FF00;
          font-weight: bold;
        }
        
        .crown-visualization {
          display: flex;
          justify-content: center;
          margin: 20px 0;
        }
        
        .crown-svg {
          width: 250px;
          height: 250px;
        }
        
        .crown-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin: 20px 0;
          padding: 16px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 8px;
        }
        
        .metric-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        
        .metric-label {
          color: #888888;
          font-size: 12px;
        }
        
        .metric-value {
          color: #FFD700;
          font-size: 16px;
          font-weight: bold;
        }
        
        .crown-footer {
          text-align: center;
          border-top: 1px solid rgba(255, 215, 0, 0.3);
          padding-top: 16px;
        }
        
        .frequency-badge {
          color: #CCCCCC;
          font-size: 12px;
          margin: 0;
        }
        
        @keyframes crownPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        
        @keyframes jewelPulse {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }
        
        @media (max-width: 480px) {
          .crown-metrics {
            grid-template-columns: 1fr;
          }
          
          .crown-svg {
            width: 200px;
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default FractalCrownEvolution;
