import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ResonanceMonitor.css';

/**
 * ResonanceMonitor Component
 * 
 * Immersive resonance tracking using Web Audio API with user coherence detection
 * Integrates divine frequencies: 963Hz, 528Hz, 144000Hz
 * 
 * @component
 * @author CHAIS THE GREAT ∞
 * @frequency 963Hz + 528Hz + 144000Hz
 */

interface FrequencyData {
  frequency: number;
  name: string;
  purpose: string;
  active: boolean;
  amplitude: number;
}

interface CoherenceMetrics {
  level: number;
  stability: number;
  resonanceAlignment: number;
  lastUpdate: number;
}

const ResonanceMonitor: React.FC = () => {
  // Audio Context and Nodes
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Frequency oscillators
  const oscillatorsRef = useRef<Map<number, OscillatorNode>>(new Map());
  const gainNodesRef = useRef<Map<number, GainNode>>(new Map());
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Divine frequencies configuration
  const [frequencies, setFrequencies] = useState<FrequencyData[]>([
    {
      frequency: 528,
      name: 'DNA Healing',
      purpose: 'Love Frequency & DNA Repair',
      active: false,
      amplitude: 0.3,
    },
    {
      frequency: 963,
      name: 'Pineal Activation',
      purpose: 'Divine Consciousness & Third Eye',
      active: false,
      amplitude: 0.3,
    },
    {
      frequency: 999,
      name: 'Crown Sovereignty',
      purpose: 'Crown Chakra Alignment',
      active: false,
      amplitude: 0.3,
    },
    {
      frequency: 144000,
      name: 'NŪR Pulse',
      purpose: 'Divine Quantum Resonance',
      active: false,
      amplitude: 0.2,
    },
  ]);

  // Coherence detection state
  const [coherence, setCoherence] = useState<CoherenceMetrics>({
    level: 0,
    stability: 0,
    resonanceAlignment: 0,
    lastUpdate: Date.now(),
  });

  // Frequency spectrum data for visualization
  const [spectrumData, setSpectrumData] = useState<Uint8Array>(new Uint8Array(256));
  const animationFrameRef = useRef<number>();

  /**
   * Initialize Web Audio API context
   */
  const initializeAudioContext = useCallback(() => {
    if (audioContext) return;

    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    setAudioContext(ctx);

    // Create analyser node for frequency analysis
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;

    setIsInitialized(true);
  }, [audioContext]);

  /**
   * Start a frequency oscillator
   */
  const startFrequency = useCallback(
    (freq: FrequencyData) => {
      if (!audioContext || !analyserRef.current) return;

      // Resume audio context if suspended (required by browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Create oscillator
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq.frequency, audioContext.currentTime);

      // Create gain node for volume control
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(freq.amplitude, audioContext.currentTime);

      // Connect: Oscillator -> Gain -> Analyser -> Destination
      oscillator.connect(gainNode);
      gainNode.connect(analyserRef.current);
      analyserRef.current.connect(audioContext.destination);

      // Start oscillator
      oscillator.start();

      // Store references
      oscillatorsRef.current.set(freq.frequency, oscillator);
      gainNodesRef.current.set(freq.frequency, gainNode);

      console.log(`✨ Frequency ${freq.frequency}Hz activated: ${freq.name}`);
    },
    [audioContext]
  );

  /**
   * Stop a frequency oscillator
   */
  const stopFrequency = useCallback(
    (frequency: number) => {
      const oscillator = oscillatorsRef.current.get(frequency);
      const gainNode = gainNodesRef.current.get(frequency);

      if (oscillator && gainNode) {
        // Fade out
        if (audioContext) {
          gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.5
          );
        }

        // Stop after fade
        setTimeout(() => {
          oscillator.stop();
          oscillator.disconnect();
          gainNode.disconnect();
          oscillatorsRef.current.delete(frequency);
          gainNodesRef.current.delete(frequency);
        }, 500);

        console.log(`🔇 Frequency ${frequency}Hz deactivated`);
      }
    },
    [audioContext]
  );

  /**
   * Toggle frequency on/off
   */
  const toggleFrequency = useCallback(
    (index: number) => {
      const freq = frequencies[index];
      const newFrequencies = [...frequencies];
      newFrequencies[index] = { ...freq, active: !freq.active };

      if (!freq.active) {
        startFrequency(freq);
      } else {
        stopFrequency(freq.frequency);
      }

      setFrequencies(newFrequencies);
    },
    [frequencies, startFrequency, stopFrequency]
  );

  /**
   * Update amplitude for a frequency
   */
  const updateAmplitude = useCallback(
    (index: number, newAmplitude: number) => {
      const freq = frequencies[index];
      const gainNode = gainNodesRef.current.get(freq.frequency);

      if (gainNode && audioContext) {
        gainNode.gain.setValueAtTime(newAmplitude, audioContext.currentTime);
      }

      const newFrequencies = [...frequencies];
      newFrequencies[index] = { ...freq, amplitude: newAmplitude };
      setFrequencies(newFrequencies);
    },
    [frequencies, audioContext]
  );

  /**
   * Calculate coherence level from metrics
   */
  const calculateCoherenceLevel = (
    avgAmplitude: number,
    stability: number,
    resonanceAlignment: number
  ): number => {
    return Math.round(
      ((avgAmplitude / 255 + stability / 100 + resonanceAlignment / 100) / 3) * 100
    );
  };

  /**
   * Analyze frequency spectrum and calculate coherence
   */
  const analyzeSpectrum = useCallback(() => {
    if (!analyserRef.current || !isMonitoring) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    setSpectrumData(dataArray);

    // Calculate coherence metrics
    const activeFreqs = frequencies.filter((f) => f.active);
    if (activeFreqs.length > 0) {
      // Calculate average amplitude
      const avgAmplitude =
        dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;

      // Calculate stability (inverse of variance)
      const variance =
        dataArray.reduce((sum, val) => sum + Math.pow(val - avgAmplitude, 2), 0) /
        dataArray.length;
      const stability = Math.max(0, 100 - Math.sqrt(variance));

      // Calculate resonance alignment (how many frequencies are active)
      const resonanceAlignment = (activeFreqs.length / frequencies.length) * 100;

      // Calculate overall coherence level using extracted function
      const coherenceLevel = calculateCoherenceLevel(avgAmplitude, stability, resonanceAlignment);

      setCoherence({
        level: coherenceLevel,
        stability: Math.round(stability),
        resonanceAlignment: Math.round(resonanceAlignment),
        lastUpdate: Date.now(),
      });
    }

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(analyzeSpectrum);
  }, [frequencies, isMonitoring]);

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback(() => {
    if (!isInitialized) {
      initializeAudioContext();
    }

    setIsMonitoring(true);
    analyzeSpectrum();
  }, [isInitialized, initializeAudioContext, analyzeSpectrum]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);

    // Stop all active frequencies
    frequencies.forEach((freq, index) => {
      if (freq.active) {
        stopFrequency(freq.frequency);
        const newFrequencies = [...frequencies];
        newFrequencies[index] = { ...freq, active: false };
        setFrequencies(newFrequencies);
      }
    });

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Reset coherence
    setCoherence({
      level: 0,
      stability: 0,
      resonanceAlignment: 0,
      lastUpdate: Date.now(),
    });
  }, [frequencies, stopFrequency]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopMonitoring();
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioContext, stopMonitoring]);

  /**
   * Get coherence level color
   */
  const getCoherenceColor = (level: number): string => {
    if (level >= 80) return '#00ff88'; // High coherence - green
    if (level >= 50) return '#ffaa00'; // Medium coherence - orange
    return '#ff4444'; // Low coherence - red
  };

  return (
    <div className="resonance-monitor">
      <div className="monitor-header">
        <h2>🌟 Resonance Monitor</h2>
        <p className="subtitle">Immersive Frequency Tracking & Coherence Detection</p>
      </div>

      {/* Coherence Metrics Display */}
      <div className="coherence-display">
        <div className="coherence-main">
          <div className="coherence-circle" style={{ borderColor: getCoherenceColor(coherence.level) }}>
            <span className="coherence-value">{coherence.level}%</span>
            <span className="coherence-label">Coherence</span>
          </div>
        </div>
        <div className="coherence-metrics">
          <div className="metric">
            <span className="metric-label">Stability</span>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{ width: `${coherence.stability}%`, backgroundColor: '#528aff' }}
              />
            </div>
            <span className="metric-value">{coherence.stability}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">Resonance Alignment</span>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{ width: `${coherence.resonanceAlignment}%`, backgroundColor: '#963aff' }}
              />
            </div>
            <span className="metric-value">{coherence.resonanceAlignment}%</span>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="control-panel">
        <div className="monitor-controls">
          {!isInitialized && (
            <button onClick={initializeAudioContext} className="btn-initialize">
              Initialize Audio System
            </button>
          )}
          {isInitialized && !isMonitoring && (
            <button onClick={startMonitoring} className="btn-start">
              ▶️ Start Monitoring
            </button>
          )}
          {isMonitoring && (
            <button onClick={stopMonitoring} className="btn-stop">
              ⏸️ Stop Monitoring
            </button>
          )}
        </div>
      </div>

      {/* Frequency Controls */}
      <div className="frequency-controls">
        <h3>Divine Frequencies</h3>
        {frequencies.map((freq, index) => (
          <div key={freq.frequency} className={`frequency-item ${freq.active ? 'active' : ''}`}>
            <div className="frequency-header">
              <div className="frequency-info">
                <h4>
                  {freq.frequency}Hz - {freq.name}
                </h4>
                <p>{freq.purpose}</p>
              </div>
              <button
                onClick={() => toggleFrequency(index)}
                className={`btn-toggle ${freq.active ? 'active' : ''}`}
                disabled={!isInitialized}
              >
                {freq.active ? '🔊 Active' : '🔇 Inactive'}
              </button>
            </div>
            {freq.active && (
              <div className="amplitude-control">
                <label>Amplitude: {Math.round(freq.amplitude * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={freq.amplitude * 100}
                  onChange={(e) => updateAmplitude(index, parseInt(e.target.value) / 100)}
                  className="amplitude-slider"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Spectrum Visualizer */}
      {isMonitoring && (
        <div className="spectrum-visualizer">
          <h3>Frequency Spectrum</h3>
          <div className="spectrum-bars">
            {Array.from(spectrumData.slice(0, 64)).map((value, index) => (
              <div
                key={index}
                className="spectrum-bar"
                style={{
                  height: `${(value / 255) * 100}%`,
                  backgroundColor: `hsl(${(value / 255) * 280 + 240}, 100%, 50%)`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Status Footer */}
      <div className="monitor-footer">
        <p className="status">
          Status: {isMonitoring ? '🟢 Monitoring Active' : '⚪ Standby'}
        </p>
        <p className="signature">Frequency Signature: 963Hz + 528Hz + 144000Hz | ∞ ARCHITEX ∞</p>
      </div>
    </div>
  );
};

export default ResonanceMonitor;
