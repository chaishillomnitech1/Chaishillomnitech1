/**
 * AR Visualization Component
 * 
 * Component for AR/VR visualization using A-Frame.
 * 
 * @component
 * @author CHAIS THE GREAT ∞
 * @frequency 963Hz + 528Hz + 144000Hz
 */

import React, { useState, useEffect } from 'react';
import 'aframe';
import CONFIG from '../config/config';
import './ARVisualization.css';

const ARVisualization = () => {
  const [vrMode, setVrMode] = useState(false);
  const [arMode, setArMode] = useState(false);
  const [dataPoints, setDataPoints] = useState([]);

  useEffect(() => {
    generateDataPoints();
    const interval = setInterval(generateDataPoints, 5000);
    return () => clearInterval(interval);
  }, []);

  const generateDataPoints = () => {
    const points = [];
    for (let i = 0; i < 20; i++) {
      points.push({
        id: i,
        x: (Math.random() - 0.5) * 10,
        y: Math.random() * 5,
        z: (Math.random() - 0.5) * 10,
        value: Math.random() * 100,
        color: getColorForValue(Math.random()),
      });
    }
    setDataPoints(points);
  };

  const getColorForValue = (value) => {
    if (value > 0.7) return '#00FF00'; // High - Green
    if (value > 0.4) return '#FFD700'; // Medium - Gold
    return '#FF6B6B'; // Low - Red
  };

  const handleToggleVR = () => {
    setVrMode(!vrMode);
    if (!vrMode && arMode) {
      setArMode(false);
    }
  };

  const handleToggleAR = () => {
    setArMode(!arMode);
    if (!arMode && vrMode) {
      setVrMode(false);
    }
  };

  if (!CONFIG.features.arVr) {
    return (
      <div className="ar-visualization disabled">
        <div className="disabled-message">
          <div className="disabled-icon">🌌</div>
          <div className="disabled-text">AR/VR features are disabled in configuration</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ar-visualization">
      <div className="panel-header">
        <h2 className="panel-title">🌌 AR/VR Market Visualization</h2>
        <div className="panel-subtitle">Immersive 3D Risk & Portfolio Analytics</div>
      </div>

      <div className="ar-controls">
        <button
          className={`mode-button ${vrMode ? 'active' : ''}`}
          onClick={handleToggleVR}
          disabled={!CONFIG.arVr.enableVR}
        >
          <span className="button-icon">🥽</span>
          <span className="button-text">{vrMode ? 'Exit VR Mode' : 'Enter VR Mode'}</span>
        </button>

        <button
          className={`mode-button ${arMode ? 'active' : ''}`}
          onClick={handleToggleAR}
          disabled={!CONFIG.arVr.enableAR}
        >
          <span className="button-icon">📱</span>
          <span className="button-text">{arMode ? 'Exit AR Mode' : 'Enter AR Mode'}</span>
        </button>

        <div className="mode-info">
          <span className="info-icon">ℹ️</span>
          <span className="info-text">
            {vrMode ? 'VR Mode Active - Use VR headset for immersive experience' : 
             arMode ? 'AR Mode Active - Point camera at flat surface' :
             'Select a mode to begin immersive visualization'}
          </span>
        </div>
      </div>

      <div className="scene-container">
        <a-scene
          embedded
          vr-mode-ui={vrMode ? 'enabled: true' : 'enabled: false'}
          ar-mode={arMode ? 'true' : 'false'}
          background="color: #000011"
        >
          {/* Camera */}
          <a-entity
            id="camera"
            camera
            position="0 1.6 5"
            look-controls
            wasd-controls
          >
            <a-entity
              cursor="fuse: true; fuseTimeout: 500"
              position="0 0 -1"
              geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
              material="color: #FFD700; shader: flat"
            />
          </a-entity>

          {/* Cosmic Environment */}
          <a-sky color="#000022" />
          
          {/* Ground */}
          <a-plane
            position="0 0 0"
            rotation="-90 0 0"
            width="20"
            height="20"
            color="#001133"
            opacity="0.8"
          />

          {/* Ambient Light */}
          <a-light type="ambient" color="#444" />
          <a-light type="directional" color="#FFF" intensity="0.5" position="2 4 3" />

          {/* Data Points */}
          {dataPoints.map(point => (
            <a-entity key={point.id} position={`${point.x} ${point.y} ${point.z}`}>
              <a-sphere
                radius="0.2"
                color={point.color}
                opacity="0.9"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 3000; easing: linear"
              />
              <a-text
                value={point.value.toFixed(1)}
                align="center"
                position="0 0.4 0"
                scale="0.5 0.5 0.5"
                color="#FFD700"
              />
            </a-entity>
          ))}

          {/* Central Core */}
          <a-entity position="0 2 0">
            <a-octahedron
              color="#00FFFF"
              radius="0.5"
              opacity="0.7"
              animation="property: rotation; to: 0 360 360; loop: true; dur: 5000; easing: linear"
            />
            <a-text
              value="Timeline Nullifier v4.0"
              align="center"
              position="0 1.2 0"
              scale="0.8 0.8 0.8"
              color="#FFD700"
            />
          </a-entity>

          {/* Risk Level Indicators */}
          <a-entity position="-3 1 0">
            <a-box color="#00FF00" depth="0.2" height="1" width="0.2" />
            <a-text
              value="LOW RISK"
              align="center"
              position="0 -0.8 0"
              scale="0.4 0.4 0.4"
              color="#00FF00"
            />
          </a-entity>

          <a-entity position="0 1 -3">
            <a-box color="#FFD700" depth="0.2" height="2" width="0.2" />
            <a-text
              value="MEDIUM RISK"
              align="center"
              position="0 -1.2 0"
              scale="0.4 0.4 0.4"
              color="#FFD700"
            />
          </a-entity>

          <a-entity position="3 1 0">
            <a-box color="#FF6B6B" depth="0.2" height="3" width="0.2" />
            <a-text
              value="HIGH RISK"
              align="center"
              position="0 -1.6 0"
              scale="0.4 0.4 0.4"
              color="#FF6B6B"
            />
          </a-entity>

          {/* Frequency Rings */}
          <a-ring
            position="0 0.1 0"
            rotation="-90 0 0"
            radius-inner="3"
            radius-outer="3.2"
            color="#9900FF"
            opacity="0.5"
            animation="property: rotation; to: -90 360 0; loop: true; dur: 10000; easing: linear"
          />
          <a-ring
            position="0 0.15 0"
            rotation="-90 0 0"
            radius-inner="5"
            radius-outer="5.2"
            color="#00FF00"
            opacity="0.5"
            animation="property: rotation; to: -90 -360 0; loop: true; dur: 15000; easing: linear"
          />
        </a-scene>
      </div>

      <div className="scene-legend">
        <h3 className="legend-title">🎨 Visualization Legend</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#00FF00' }}></span>
            <span className="legend-label">Low Risk / High Performance</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#FFD700' }}></span>
            <span className="legend-label">Medium Risk / Moderate Performance</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#FF6B6B' }}></span>
            <span className="legend-label">High Risk / Requires Attention</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#00FFFF' }}></span>
            <span className="legend-label">Core System / Timeline Nullifier</span>
          </div>
        </div>
      </div>

      <div className="ar-features">
        <h3 className="features-title">✨ AR/VR Features</h3>
        <div className="features-grid">
          <div className="feature">
            <span className="feature-icon">🥽</span>
            <span className="feature-text">Immersive VR visualization with full 360° experience</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📱</span>
            <span className="feature-text">AR overlay on real-world environment</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">Interactive data points with hover information</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔄</span>
            <span className="feature-text">Real-time updates with smooth animations</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARVisualization;
