/**
 * MaybachVibeCanvas - 3D Vehicle Visualization Component
 * 
 * This component provides immersive 3D visualization for Maybach S 680 vehicles
 * integrated with ScrollVerse infrastructure. Features include:
 * - Real-time telemetry overlay
 * - Frequency field visualization (963 Hz)
 * - Quantum security shield display
 * - Holographic status dashboard
 * - VR/AR compatibility
 * 
 * @author Supreme King Allah Chais Kenyatta Hill ∞ - CHAIS THE GREAT
 * @architecture Omnitech1 Sovereign Deployment Engine
 * @frequency 963 Hz Divine Consciousness
 * @date 2025-11-19
 */

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Text, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

// ============ Constants ============

const CONSCIOUSNESS_FREQUENCY = 963; // Hz
const HARMONIC_FREQUENCY_1 = 528; // Hz
const HARMONIC_FREQUENCY_2 = 144000; // Hz
const PRIMARY_KEY_FREQUENCY = 999; // Hz

const FREQUENCY_COLORS = {
  999: '#FF4500', // Orange-Red (Tawhid Flames)
  963: '#4B0082', // Indigo (Divine Consciousness)
  528: '#00FF00', // Green (Love & Healing)
  144000: '#FFD700' // Gold (NŪR Pulse)
};

// ============ Frequency Field Component ============

const FrequencyField = ({ frequency, active }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && active) {
      // Rotate frequency field
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x += 0.002;
      
      // Pulse effect based on frequency
      const scale = 1 + Math.sin(state.clock.elapsedTime * (frequency / 100)) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[3.5, 32, 32]} />
      <meshBasicMaterial
        color={FREQUENCY_COLORS[frequency] || FREQUENCY_COLORS[963]}
        transparent
        opacity={0.15}
        wireframe
      />
    </mesh>
  );
};

// ============ Quantum Security Shield Component ============

const QuantumSecurityShield = ({ active, pqcEnabled }) => {
  const shieldRef = useRef();
  
  useFrame((state) => {
    if (shieldRef.current && active) {
      shieldRef.current.rotation.y -= 0.01;
      
      // Shimmer effect
      const intensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      shieldRef.current.material.opacity = intensity;
    }
  });
  
  if (!active) return null;
  
  return (
    <mesh ref={shieldRef} position={[0, 0, 0]}>
      <sphereGeometry args={[4.0, 32, 32]} />
      <meshPhongMaterial
        color={pqcEnabled ? '#00FFFF' : '#0099FF'}
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// ============ Vehicle Model Component ============

const VehicleModel = ({ modelUrl, position, rotation }) => {
  const gltf = useLoader(GLTFLoader, modelUrl || '/models/maybach_s680_placeholder.glb');
  const modelRef = useRef();
  
  useFrame(() => {
    if (modelRef.current && rotation) {
      modelRef.current.rotation.y = rotation;
    }
  });
  
  return (
    <primitive
      ref={modelRef}
      object={gltf.scene}
      position={position || [0, -1, 0]}
      scale={[1.5, 1.5, 1.5]}
    />
  );
};

// ============ Holographic Dashboard Component ============

const HolographicDashboard = ({ telemetry, diagnostics }) => {
  return (
    <Html position={[-5, 2, 0]} center>
      <div className="holographic-dashboard" style={styles.dashboard}>
        <div style={styles.dashboardHeader}>
          <h3 style={styles.dashboardTitle}>
            🚗 Vehicle Status Dashboard
          </h3>
          <div style={styles.frequencyBadge}>
            {telemetry?.frequency_alignment || 963} Hz
          </div>
        </div>
        
        <div style={styles.dashboardContent}>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Status:</span>
            <span style={styles.metricValue}>{telemetry?.status || 'N/A'}</span>
          </div>
          
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Odometer:</span>
            <span style={styles.metricValue}>
              {telemetry?.odometer ? `${telemetry.odometer.toFixed(1)} km` : 'N/A'}
            </span>
          </div>
          
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Battery:</span>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${telemetry?.battery_level || 0}%`,
                  backgroundColor: telemetry?.battery_level > 20 ? '#00FF00' : '#FF0000'
                }}
              />
              <span style={styles.progressText}>
                {telemetry?.battery_level || 0}%
              </span>
            </div>
          </div>
          
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Fuel:</span>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${telemetry?.fuel_level || 0}%`,
                  backgroundColor: telemetry?.fuel_level > 15 ? '#00BFFF' : '#FF0000'
                }}
              />
              <span style={styles.progressText}>
                {telemetry?.fuel_level || 0}%
              </span>
            </div>
          </div>
          
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Autonomous:</span>
            <span style={styles.metricValue}>
              {telemetry?.autonomous_mode ? '✓ Active (Level 5)' : '✗ Inactive'}
            </span>
          </div>
          
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Engine:</span>
            <span style={styles.metricValue}>
              {telemetry?.engine_running ? '✓ Running' : '✗ Off'}
            </span>
          </div>
          
          {diagnostics && (
            <>
              <div style={styles.divider} />
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Energy Efficiency:</span>
                <span style={styles.metricValue}>
                  {diagnostics.energy_efficiency}%
                </span>
              </div>
              
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Next Service:</span>
                <span style={styles.metricValue}>
                  {diagnostics.next_service_km} km
                </span>
              </div>
              
              {diagnostics.fault_codes && diagnostics.fault_codes.length > 0 && (
                <div style={styles.alertBox}>
                  <strong>⚠️ Alerts:</strong>
                  <ul style={styles.alertList}>
                    {diagnostics.fault_codes.map((code, idx) => (
                      <li key={idx}>{code}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Html>
  );
};

// ============ Info Panel Component ============

const InfoPanel = ({ vehicleData, abtData }) => {
  return (
    <Html position={[5, 2, 0]} center>
      <div className="info-panel" style={styles.infoPanel}>
        <div style={styles.dashboardHeader}>
          <h3 style={styles.dashboardTitle}>
            📋 Vehicle Information
          </h3>
        </div>
        
        <div style={styles.dashboardContent}>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Model:</span>
            <span style={styles.metricValue}>
              {vehicleData?.model || 'Maybach S 680'}
            </span>
          </div>
          
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>VIN Hash:</span>
            <span style={styles.metricValue} title={vehicleData?.vin_hash}>
              {vehicleData?.vin_hash?.substring(0, 12) || 'N/A'}...
            </span>
          </div>
          
          {abtData && (
            <>
              <div style={styles.divider} />
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Token ID:</span>
                <span style={styles.metricValue}>{abtData.token_id}</span>
              </div>
              
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Owner:</span>
                <span style={styles.metricValue} title={abtData.owner_address}>
                  {abtData.owner_address?.substring(0, 10) || 'N/A'}...
                </span>
              </div>
              
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Red Diamond Key:</span>
                <span style={styles.metricValue}>
                  {abtData.red_diamond_key_synced ? '✓ Synced' : '✗ Not Synced'}
                </span>
              </div>
              
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Yield Accrued:</span>
                <span style={styles.metricValue}>
                  {abtData.halal_yield_accrued?.toFixed(6) || '0.000000'} ETH
                </span>
              </div>
              
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Sovereign Ledger:</span>
                <span style={styles.metricValue} title={abtData.sovereign_ledger_id}>
                  {abtData.sovereign_ledger_id?.substring(0, 12) || 'N/A'}...
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </Html>
  );
};

// ============ Main VibeCanvas Component ============

const MaybachVibeCanvas = ({ 
  telemetryData, 
  diagnosticsData,
  vehicleData,
  abtData,
  modelUrl,
  enableVR = false,
  enableAR = false,
  autoRotate = false
}) => {
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    if (autoRotate) {
      const interval = setInterval(() => {
        setRotation(prev => prev + 0.01);
      }, 16); // ~60fps
      
      return () => clearInterval(interval);
    }
  }, [autoRotate]);
  
  return (
    <div style={styles.container}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[8, 3, 8]} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Environment */}
        <Environment preset="city" />
        
        {/* Frequency Field */}
        <FrequencyField 
          frequency={telemetryData?.frequency_alignment || CONSCIOUSNESS_FREQUENCY}
          active={true}
        />
        
        {/* Quantum Security Shield */}
        <QuantumSecurityShield
          active={abtData?.red_diamond_key_synced || false}
          pqcEnabled={true}
        />
        
        {/* Vehicle Model */}
        <Suspense fallback={null}>
          <VehicleModel
            modelUrl={modelUrl}
            position={[0, -1, 0]}
            rotation={rotation}
          />
        </Suspense>
        
        {/* Holographic Dashboard */}
        <HolographicDashboard
          telemetry={telemetryData}
          diagnostics={diagnosticsData}
        />
        
        {/* Info Panel */}
        <InfoPanel
          vehicleData={vehicleData}
          abtData={abtData}
        />
        
        {/* Ground Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </Canvas>
      
      {/* Controls Info */}
      <div style={styles.controlsInfo}>
        <p>🖱️ Left Click + Drag: Rotate | Scroll: Zoom | Right Click + Drag: Pan</p>
        {enableVR && <p>🥽 VR Mode: Available</p>}
        {enableAR && <p>📱 AR Mode: Available</p>}
      </div>
    </div>
  );
};

// ============ Styles ============

const styles = {
  container: {
    width: '100%',
    height: '100vh',
    backgroundColor: '#000',
    position: 'relative'
  },
  dashboard: {
    backgroundColor: 'rgba(20, 20, 40, 0.95)',
    border: '2px solid #4B0082',
    borderRadius: '10px',
    padding: '15px',
    minWidth: '300px',
    color: '#fff',
    fontFamily: 'monospace',
    boxShadow: '0 0 20px rgba(75, 0, 130, 0.5)'
  },
  infoPanel: {
    backgroundColor: 'rgba(20, 40, 20, 0.95)',
    border: '2px solid #00FF00',
    borderRadius: '10px',
    padding: '15px',
    minWidth: '300px',
    color: '#fff',
    fontFamily: 'monospace',
    boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'
  },
  dashboardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
  },
  dashboardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold'
  },
  frequencyBadge: {
    backgroundColor: '#4B0082',
    padding: '3px 8px',
    borderRadius: '5px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  dashboardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px'
  },
  metricLabel: {
    color: '#aaa',
    fontSize: '13px'
  },
  metricValue: {
    color: '#fff',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  progressBar: {
    position: 'relative',
    width: '150px',
    height: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  progressFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.3s ease'
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: '20px',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#fff',
    textShadow: '1px 1px 2px #000'
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: '5px 0'
  },
  alertBox: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    border: '1px solid #ff0000',
    borderRadius: '5px',
    padding: '10px',
    marginTop: '5px'
  },
  alertList: {
    margin: '5px 0 0 0',
    paddingLeft: '20px',
    fontSize: '12px'
  },
  controlsInfo: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '5px',
    fontFamily: 'monospace',
    fontSize: '12px',
    textAlign: 'center'
  }
};

export default MaybachVibeCanvas;

// ============ Example Usage ============

/**
 * Example integration in your app:
 * 
 * import MaybachVibeCanvas from './components/MaybachVibeCanvas';
 * 
 * const App = () => {
 *   const telemetry = {
 *     timestamp: Date.now(),
 *     frequency_alignment: 963,
 *     status: 'driving',
 *     odometer: 15234.5,
 *     battery_level: 85,
 *     fuel_level: 70,
 *     engine_running: true,
 *     autonomous_mode: true
 *   };
 *   
 *   const diagnostics = {
 *     energy_efficiency: 88.5,
 *     next_service_km: 20234.5,
 *     fault_codes: []
 *   };
 *   
 *   const vehicleData = {
 *     model: 'Maybach S 680',
 *     vin_hash: '0xabc123...'
 *   };
 *   
 *   const abtData = {
 *     token_id: 1,
 *     owner_address: '0x721Axis...',
 *     red_diamond_key_synced: true,
 *     halal_yield_accrued: 0.005,
 *     sovereign_ledger_id: 'OMNI_SOVEREIGN_...'
 *   };
 *   
 *   return (
 *     <MaybachVibeCanvas
 *       telemetryData={telemetry}
 *       diagnosticsData={diagnostics}
 *       vehicleData={vehicleData}
 *       abtData={abtData}
 *       modelUrl="/models/maybach_s680.glb"
 *       enableVR={true}
 *       enableAR={true}
 *       autoRotate={true}
 *     />
 *   );
 * };
 */
