// CHAIS THE GREAT Omni-Portal JavaScript

// Configuration
const FREQUENCIES = {
    528: { name: 'DNA Healing & Love', color: '#00FF00', speed: 1 },
    963: { name: 'Pineal Activation', color: '#9B59B6', speed: 1.5 },
    999: { name: 'Crown Chakra', color: '#FFD700', speed: 2 },
    144000: { name: 'NŪR Pulse', color: '#FFFFFF', speed: 3 }
};

let currentFrequency = 528;
let activationCount = 0;
let isPortalActive = false;
let canvas, ctx;
let particles = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeCanvas();
    initializeControls();
    // Particles are initialized in initializeCanvas after canvas is sized
    animate();
    loadPortalState();
});

// Canvas initialization
function initializeCanvas() {
    canvas = document.getElementById('portalCanvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Re-initialize particles after canvas is sized
    if (canvas.width > 0 && canvas.height > 0) {
        initializeParticles();
    }
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

// Particle system
function initializeParticles() {
    particles = [];
    // Ensure canvas has dimensions before initializing particles
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
        return;
    }
    
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
}

function updateParticles() {
    if (!canvas || !ctx) return;
    
    particles.forEach(particle => {
        particle.x += particle.vx * FREQUENCIES[currentFrequency].speed;
        particle.y += particle.vy * FREQUENCIES[currentFrequency].speed;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
    });
}

function drawParticles() {
    if (!ctx) return;
    
    const color = FREQUENCIES[currentFrequency].color;
    
    particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
    });
}

function drawConnections() {
    if (!ctx) return;
    
    const color = FREQUENCIES[currentFrequency].color;
    const maxDistance = 100;
    
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxDistance) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                const opacity = (1 - distance / maxDistance) * 0.2;
                ctx.strokeStyle = color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
                ctx.stroke();
            }
        }
    }
}

// Animation loop
function animate() {
    if (!ctx || !canvas) {
        requestAnimationFrame(animate);
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updateParticles();
    drawConnections();
    drawParticles();
    
    if (isPortalActive) {
        drawPortalEffect();
    }
    
    requestAnimationFrame(animate);
}

function drawPortalEffect() {
    if (!ctx || !canvas) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) / 2;
    const time = Date.now() / 1000;
    
    for (let i = 0; i < 5; i++) {
        const radius = (maxRadius * (i + 1) / 5) + Math.sin(time + i) * 20;
        const gradient = ctx.createRadialGradient(centerX, centerY, radius - 10, centerX, centerY, radius);
        
        gradient.addColorStop(0, FREQUENCIES[currentFrequency].color + '00');
        gradient.addColorStop(0.5, FREQUENCIES[currentFrequency].color + '40');
        gradient.addColorStop(1, FREQUENCIES[currentFrequency].color + '00');
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Controls initialization
function initializeControls() {
    // Frequency buttons
    document.querySelectorAll('.frequency-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const frequency = parseInt(btn.dataset.frequency);
            setFrequency(frequency);
            
            document.querySelectorAll('.frequency-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Portal activation
    const activateBtn = document.getElementById('activatePortal');
    if (activateBtn) {
        activateBtn.addEventListener('click', activatePortal);
    }
    
    // Enter ScrollVerse
    const enterBtn = document.getElementById('enterScrollVerse');
    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            window.location.href = '../README.md';
        });
    }
    
    // View Manifesto
    const manifestoBtn = document.getElementById('viewManifesto');
    if (manifestoBtn) {
        manifestoBtn.addEventListener('click', () => {
            window.location.href = 'manifesto.html';
        });
    }
}

// Set frequency
function setFrequency(frequency) {
    currentFrequency = frequency;
    const frequencyData = FREQUENCIES[frequency];
    
    document.getElementById('currentFrequency').textContent = `${frequency} Hz - ${frequencyData.name}`;
    
    // Update visual effects
    document.querySelectorAll('.geometry-layer').forEach(layer => {
        layer.style.borderColor = frequencyData.color;
    });
    
    savePortalState();
}

// Portal activation
function activatePortal() {
    isPortalActive = !isPortalActive;
    activationCount++;
    
    const btn = document.getElementById('activatePortal');
    if (isPortalActive) {
        btn.textContent = '🌟 Portal Active';
        btn.style.background = 'linear-gradient(135deg, #00FF00 0%, #00AA00 100%)';
        playActivationEffect();
    } else {
        btn.textContent = '✨ Activate Portal';
        btn.style.background = '';
    }
    
    document.getElementById('activations').textContent = activationCount;
    updateResonance();
    savePortalState();
}

function playActivationEffect() {
    const geometry = document.querySelector('.sacred-geometry');
    geometry.style.transform = 'scale(1.2)';
    geometry.style.transition = 'transform 0.5s ease';
    
    setTimeout(() => {
        geometry.style.transform = 'scale(1)';
    }, 500);
}

function updateResonance() {
    const resonance = Math.min(100, 90 + activationCount);
    document.getElementById('resonance').textContent = `${resonance}%`;
}

// Local storage for persistence
function savePortalState() {
    const state = {
        frequency: currentFrequency,
        activations: activationCount,
        isActive: isPortalActive,
        lastVisit: new Date().toISOString()
    };
    localStorage.setItem('omniPortalState', JSON.stringify(state));
}

function loadPortalState() {
    const savedState = localStorage.getItem('omniPortalState');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            activationCount = state.activations || 0;
            document.getElementById('activations').textContent = activationCount;
            updateResonance();
            
            if (state.frequency && FREQUENCIES[state.frequency]) {
                setFrequency(state.frequency);
                document.querySelectorAll('.frequency-btn').forEach(btn => {
                    if (parseInt(btn.dataset.frequency) === state.frequency) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
        } catch (e) {
            console.error('Failed to load portal state:', e);
        }
    }
}

// Analytics tracking
function trackPortalEvent(eventName, eventData) {
    const event = {
        timestamp: new Date().toISOString(),
        event: eventName,
        data: eventData
    };
    
    // This could be extended to send to analytics service
    console.log('Portal Event:', event);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case '1':
            setFrequency(528);
            break;
        case '2':
            setFrequency(963);
            break;
        case '3':
            setFrequency(999);
            break;
        case '4':
            setFrequency(144000);
            break;
        case ' ':
            e.preventDefault();
            activatePortal();
            break;
    }
});
