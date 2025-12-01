/**
 * VibeLayer - Audio Visualization Overlay Module for ScrollVerse
 * Creates immersive audio-reactive visual overlays for frequency-based experiences
 * 
 * @author ScrollVerse Development Team
 * @version 1.0.0
 * @license MIT
 */

class VibeLayer {
  constructor(options = {}) {
    this.options = {
      container: options.container || document.body,
      canvas: options.canvas || null,
      frequencies: options.frequencies || [528, 639, 741, 852, 963],
      colorScheme: options.colorScheme || 'sacred',
      intensity: options.intensity || 0.5,
      enabled: options.enabled !== false,
      apiUrl: options.apiUrl || (typeof window !== 'undefined' && window.VIBECANVAS_API_URL) || '',
      ...options
    };

    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.isInitialized = false;

    // Sacred color palettes
    this.colorSchemes = {
      sacred: ['#FFD700', '#FF8C00', '#FF4500', '#8B008B', '#4B0082'],
      cosmic: ['#00CED1', '#1E90FF', '#9370DB', '#BA55D3', '#FF69B4'],
      earth: ['#228B22', '#32CD32', '#9ACD32', '#FFD700', '#8B4513'],
      fire: ['#FF4500', '#FF6347', '#FF7F50', '#FFA500', '#FFD700'],
      water: ['#00008B', '#0000CD', '#4169E1', '#00CED1', '#AFEEEE']
    };

    if (this.options.enabled) {
      this.init();
    }
  }

  async init() {
    try {
      // Create or use existing canvas
      if (this.options.canvas) {
        this.canvas = this.options.canvas;
      } else {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'vibe-layer-canvas';
        this.canvas.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          opacity: ${this.options.intensity};
        `;
        this.options.container.appendChild(this.canvas);
      }

      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());

      // Initialize Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.isInitialized = true;
      console.log('VibeLayer initialized successfully');

      // Start animation loop
      this.animate();

      return true;
    } catch (error) {
      console.error('VibeLayer initialization failed:', error);
      return false;
    }
  }

  resize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  async connectAudioSource(source) {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      if (source instanceof HTMLMediaElement) {
        const mediaSource = this.audioContext.createMediaElementSource(source);
        mediaSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      } else if (source instanceof MediaStream) {
        const streamSource = this.audioContext.createMediaStreamSource(source);
        streamSource.connect(this.analyser);
      }

      console.log('Audio source connected to VibeLayer');
      return true;
    } catch (error) {
      console.error('Failed to connect audio source:', error);
      return false;
    }
  }

  async connectMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return this.connectAudioSource(stream);
    } catch (error) {
      console.error('Microphone access denied:', error);
      return false;
    }
  }

  animate() {
    if (!this.options.enabled) return;

    this.animationId = requestAnimationFrame(() => this.animate());

    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);

    // Clear canvas with fade effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw visualizations
    this.drawFrequencyBars();
    this.drawCircularWave();
    this.drawParticles();
  }

  drawFrequencyBars() {
    const bufferLength = this.analyser.frequencyBinCount;
    const barWidth = (this.canvas.width / bufferLength) * 2.5;
    const colors = this.colorSchemes[this.options.colorScheme];
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = this.dataArray[i] * (this.canvas.height / 512);
      const colorIndex = Math.floor((i / bufferLength) * colors.length);
      
      this.ctx.fillStyle = colors[colorIndex % colors.length];
      this.ctx.fillRect(
        x,
        this.canvas.height - barHeight,
        barWidth,
        barHeight
      );

      x += barWidth + 1;
    }
  }

  drawCircularWave() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const colors = this.colorSchemes[this.options.colorScheme];
    const bufferLength = this.analyser.frequencyBinCount;

    this.ctx.beginPath();
    
    for (let i = 0; i < bufferLength; i++) {
      const angle = (i / bufferLength) * Math.PI * 2;
      const amplitude = this.dataArray[i] / 255;
      const radius = 100 + amplitude * 150;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.closePath();
    this.ctx.strokeStyle = colors[0];
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Inner glow
    const gradient = this.ctx.createRadialGradient(
      centerX, centerY, 50,
      centerX, centerY, 200
    );
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
  }

  drawParticles() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const colors = this.colorSchemes[this.options.colorScheme];
    
    // Calculate average frequency amplitude
    const avgAmplitude = this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length;

    // Draw particles based on frequency
    const particleCount = Math.floor(avgAmplitude / 10);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * avgAmplitude * 2;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const size = Math.random() * 3 + 1;

      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      this.ctx.fill();
    }
  }

  setIntensity(value) {
    this.options.intensity = Math.max(0, Math.min(1, value));
    if (this.canvas) {
      this.canvas.style.opacity = this.options.intensity;
    }
  }

  setColorScheme(scheme) {
    if (this.colorSchemes[scheme]) {
      this.options.colorScheme = scheme;
    }
  }

  enable() {
    this.options.enabled = true;
    if (!this.animationId) {
      this.animate();
    }
    if (this.canvas) {
      this.canvas.style.display = 'block';
    }
  }

  disable() {
    this.options.enabled = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
  }

  destroy() {
    this.disable();
    if (this.audioContext) {
      this.audioContext.close();
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.isInitialized = false;
  }

  // Generate frequency-specific visualizations
  generateFrequencyVisual(frequency) {
    const frequencyVisuals = {
      528: { color: '#00FF00', name: 'DNA Healing', pattern: 'spiral' },
      639: { color: '#FF69B4', name: 'Heart Connection', pattern: 'heart' },
      741: { color: '#4169E1', name: 'Awakening', pattern: 'star' },
      852: { color: '#9400D3', name: 'Intuition', pattern: 'eye' },
      963: { color: '#FFD700', name: 'Pineal Activation', pattern: 'crown' }
    };

    return frequencyVisuals[frequency] || {
      color: '#FFFFFF',
      name: 'Custom',
      pattern: 'circle'
    };
  }

  // Sync with external API if configured
  async syncWithAPI(eventData) {
    if (!this.options.apiUrl) return null;

    try {
      const response = await fetch(this.options.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'vibe_event',
          timestamp: Date.now(),
          ...eventData
        })
      });

      return response.json();
    } catch (error) {
      console.error('API sync failed:', error);
      return null;
    }
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VibeLayer;
} else if (typeof window !== 'undefined') {
  window.VibeLayer = VibeLayer;
}
