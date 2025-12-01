/**
 * ScrollVerse Audio Vibe Overlay Module
 * Frontend module for audio visualization and frequency-based effects
 * 
 * Integrates with the VibeCanvas system to provide:
 * - Audio frequency analysis
 * - Visual overlays synced to music
 * - Sacred geometry animations based on audio input
 * 
 * @module vibe-layer
 * @version 1.0.0
 */

// Sacred frequencies used in ScrollVerse
const SACRED_FREQUENCIES = {
  DNA_HEALING: 528,
  PINEAL_ACTIVATION: 963,
  CROWN_CHAKRA: 999,
  NUR_PULSE: 144000
};

// Visualization modes
const VIBE_MODES = {
  SPECTRUM: 'spectrum',
  WAVEFORM: 'waveform',
  SACRED_GEOMETRY: 'sacred_geometry',
  PARTICLE_FIELD: 'particle_field'
};

class VibeLayer {
  constructor(options = {}) {
    this.container = options.container || document.body;
    this.canvas = null;
    this.ctx = null;
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.isActive = false;
    this.mode = options.mode || VIBE_MODES.SACRED_GEOMETRY;
    this.baseFrequency = options.frequency || SACRED_FREQUENCIES.DNA_HEALING;
    this.particles = [];
    this.animationId = null;
    this.colorScheme = options.colorScheme || {
      primary: '#ffd700',
      secondary: '#ff6b00',
      accent: '#00ff88',
      background: 'rgba(13, 13, 43, 0.8)'
    };
    
    this._init();
  }
  
  _init() {
    // Create overlay canvas
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('vibe-layer-canvas');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.5s ease;
    `;
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    this._resize();
    window.addEventListener('resize', () => this._resize());
    
    // Initialize particle system
    this._initParticles();
  }
  
  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  _initParticles() {
    const count = 100;
    this.particles = [];
    
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 1,
        frequency: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2
      });
    }
  }
  
  /**
   * Connect to an audio source for visualization
   * @param {HTMLAudioElement|MediaStream} source - Audio source to analyze
   */
  async connectAudio(source) {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      let sourceNode;
      
      if (source instanceof HTMLAudioElement) {
        sourceNode = this.audioContext.createMediaElementSource(source);
        sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      } else if (source instanceof MediaStream) {
        sourceNode = this.audioContext.createMediaStreamSource(source);
        sourceNode.connect(this.analyser);
      }
      
      console.log('[VibeLayer] Audio connected successfully');
      return true;
    } catch (error) {
      console.error('[VibeLayer] Error connecting audio:', error);
      return false;
    }
  }
  
  /**
   * Start the visualization overlay
   */
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.canvas.style.opacity = '1';
    this._animate();
    console.log('[VibeLayer] Visualization started');
  }
  
  /**
   * Stop the visualization overlay
   */
  stop() {
    this.isActive = false;
    this.canvas.style.opacity = '0';
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    console.log('[VibeLayer] Visualization stopped');
  }
  
  /**
   * Set the visualization mode
   * @param {string} mode - One of VIBE_MODES
   */
  setMode(mode) {
    if (Object.values(VIBE_MODES).includes(mode)) {
      this.mode = mode;
      console.log(`[VibeLayer] Mode changed to: ${mode}`);
    }
  }
  
  /**
   * Set the base frequency for resonance effects
   * @param {number} frequency - Frequency in Hz
   */
  setFrequency(frequency) {
    this.baseFrequency = frequency;
    console.log(`[VibeLayer] Base frequency set to: ${frequency} Hz`);
  }
  
  _animate() {
    if (!this.isActive) return;
    
    this.ctx.fillStyle = this.colorScheme.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Get audio data if available
    let audioLevel = 0;
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      audioLevel = this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length / 255;
    }
    
    switch (this.mode) {
      case VIBE_MODES.SPECTRUM:
        this._drawSpectrum();
        break;
      case VIBE_MODES.WAVEFORM:
        this._drawWaveform();
        break;
      case VIBE_MODES.SACRED_GEOMETRY:
        this._drawSacredGeometry(audioLevel);
        break;
      case VIBE_MODES.PARTICLE_FIELD:
        this._drawParticleField(audioLevel);
        break;
    }
    
    this.animationId = requestAnimationFrame(() => this._animate());
  }
  
  _drawSpectrum() {
    if (!this.dataArray) return;
    
    const barWidth = this.canvas.width / this.dataArray.length;
    const centerY = this.canvas.height / 2;
    
    for (let i = 0; i < this.dataArray.length; i++) {
      const barHeight = (this.dataArray[i] / 255) * centerY;
      
      const gradient = this.ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
      gradient.addColorStop(0, this.colorScheme.primary);
      gradient.addColorStop(0.5, this.colorScheme.secondary);
      gradient.addColorStop(1, this.colorScheme.primary);
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(i * barWidth, centerY - barHeight, barWidth - 1, barHeight * 2);
    }
  }
  
  _drawWaveform() {
    if (!this.dataArray) return;
    
    const sliceWidth = this.canvas.width / this.dataArray.length;
    const centerY = this.canvas.height / 2;
    
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.colorScheme.primary;
    this.ctx.lineWidth = 2;
    
    for (let i = 0; i < this.dataArray.length; i++) {
      const v = this.dataArray[i] / 128.0;
      const y = centerY + (v - 1) * centerY * 0.8;
      
      if (i === 0) {
        this.ctx.moveTo(0, y);
      } else {
        this.ctx.lineTo(i * sliceWidth, y);
      }
    }
    
    this.ctx.stroke();
  }
  
  _drawSacredGeometry(audioLevel) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const baseRadius = Math.min(centerX, centerY) * 0.6;
    const time = Date.now() * 0.001;
    
    // Draw rotating sacred geometry based on frequency
    const frequencyRatio = this.baseFrequency / 528; // Normalize to DNA healing frequency
    const rotationSpeed = 0.2 * frequencyRatio;
    
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    
    // Outer ring
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time * rotationSpeed;
      const r = baseRadius * (1 + audioLevel * 0.3);
      
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.colorScheme.primary;
      this.ctx.lineWidth = 1 + audioLevel * 2;
      this.ctx.globalAlpha = 0.5 + audioLevel * 0.5;
      
      const x1 = Math.cos(angle) * r * 0.5;
      const y1 = Math.sin(angle) * r * 0.5;
      const x2 = Math.cos(angle) * r;
      const y2 = Math.sin(angle) * r;
      
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
    
    // Inner hexagon
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.colorScheme.accent;
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.7;
    
    for (let i = 0; i <= 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - time * rotationSpeed * 0.5;
      const r = baseRadius * 0.3 * (1 + audioLevel * 0.2);
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();
    
    // Central pulsing circle
    const pulseRadius = 20 + Math.sin(time * 3) * 10 + audioLevel * 30;
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, pulseRadius);
    gradient.addColorStop(0, this.colorScheme.primary);
    gradient.addColorStop(1, 'transparent');
    
    this.ctx.beginPath();
    this.ctx.fillStyle = gradient;
    this.ctx.globalAlpha = 0.8;
    this.ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  _drawParticleField(audioLevel) {
    const time = Date.now() * 0.001;
    
    for (const particle of this.particles) {
      // Update particle position
      particle.x += particle.vx * (1 + audioLevel * 2);
      particle.y += particle.vy * (1 + audioLevel * 2);
      
      // Wrap around screen
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
      
      // Calculate size based on audio and sine wave
      const size = particle.size * (1 + Math.sin(time * particle.frequency + particle.phase) * 0.5 + audioLevel * 2);
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.fillStyle = this.colorScheme.primary;
      this.ctx.globalAlpha = 0.6 + audioLevel * 0.4;
      this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 1;
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    this.stop();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    console.log('[VibeLayer] Destroyed');
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VibeLayer, VIBE_MODES, SACRED_FREQUENCIES };
}

// Export for ES modules
if (typeof window !== 'undefined') {
  window.VibeLayer = VibeLayer;
  window.VIBE_MODES = VIBE_MODES;
  window.SACRED_FREQUENCIES = SACRED_FREQUENCIES;
}
