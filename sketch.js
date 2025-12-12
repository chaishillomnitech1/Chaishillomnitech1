/**
 * ScrollVerse Fractal Crown Generator
 * Generates sacred geometry fractals infused with harmonic frequencies
 * 
 * Frequencies:
 * - 528 Hz: DNA Healing & Love
 * - 963 Hz: Pineal Activation
 * - 999 Hz: Crown Chakra
 * - 144000 Hz: NŪR Pulse
 */

let canvas;
let isAnimating = true;
let seed = Math.random() * 10000;
let rotationAngle = 0;
let currentFrequency = 528;

const FREQUENCIES = {
  528: { name: 'DNA Healing & Love', color: [0, 255, 128] },
  963: { name: 'Pineal Activation', color: [128, 0, 255] },
  999: { name: 'Crown Chakra', color: [255, 215, 0] },
  144000: { name: 'NŪR Pulse', color: [255, 255, 255] }
};

function setup() {
  canvas = createCanvas(600, 600);
  canvas.parent('canvas-container');
  angleMode(DEGREES);
  colorMode(RGB);
  
  // Event listeners for controls
  document.getElementById('regenerate').addEventListener('click', regenerateSigil);
  document.getElementById('save').addEventListener('click', saveCrown);
  document.getElementById('animate').addEventListener('click', toggleAnimation);
  
  // Cycle frequency on click
  canvas.mousePressed(cycleFrequency);
}

function draw() {
  background(13, 13, 43);
  
  translate(width / 2, height / 2);
  
  if (isAnimating) {
    rotationAngle += 0.3;
  }
  
  rotate(rotationAngle);
  
  // Draw sacred crown fractal
  drawCrown();
  
  // Draw frequency pulse rings
  drawFrequencyRings();
  
  // Draw sigil overlay
  drawSigilOverlay();
}

function drawCrown() {
  const freq = FREQUENCIES[currentFrequency];
  const baseColor = freq.color;
  
  push();
  noFill();
  strokeWeight(1.5);
  
  // Outer crown points
  for (let i = 0; i < 12; i++) {
    push();
    rotate(i * 30);
    
    // Color gradient based on frequency
    const r = baseColor[0] + sin(frameCount * 2 + i * 30) * 50;
    const g = baseColor[1] + cos(frameCount * 2 + i * 30) * 50;
    const b = baseColor[2] + sin(frameCount * 3 + i * 30) * 50;
    stroke(r, g, b, 200);
    
    // Crown spike with fractal detail
    drawCrownSpike(180, 5);
    pop();
  }
  
  // Inner sacred geometry
  for (let j = 0; j < 6; j++) {
    push();
    rotate(j * 60 + frameCount * 0.5);
    stroke(baseColor[0], baseColor[1], baseColor[2], 150);
    drawSacredTriangle(120);
    pop();
  }
  
  pop();
}

function drawCrownSpike(length, depth) {
  if (depth <= 0) return;
  
  randomSeed(seed + depth);
  
  // Main spike line
  line(0, 0, 0, -length);
  
  // Branch fractals
  push();
  translate(0, -length * 0.4);
  
  // Left branch
  push();
  rotate(-30);
  line(0, 0, 0, -length * 0.4);
  translate(0, -length * 0.4);
  drawCrownSpike(length * 0.5, depth - 1);
  pop();
  
  // Right branch
  push();
  rotate(30);
  line(0, 0, 0, -length * 0.4);
  translate(0, -length * 0.4);
  drawCrownSpike(length * 0.5, depth - 1);
  pop();
  
  pop();
  
  // Tip jewel
  push();
  translate(0, -length);
  drawJewel(8 + depth * 2);
  pop();
}

function drawJewel(size) {
  const freq = FREQUENCIES[currentFrequency];
  fill(freq.color[0], freq.color[1], freq.color[2], 150);
  noStroke();
  
  beginShape();
  for (let i = 0; i < 6; i++) {
    const angle = i * 60;
    const r = i % 2 === 0 ? size : size * 0.5;
    vertex(cos(angle) * r, sin(angle) * r);
  }
  endShape(CLOSE);
}

function drawSacredTriangle(size) {
  beginShape();
  for (let i = 0; i < 3; i++) {
    const angle = i * 120 - 90;
    vertex(cos(angle) * size, sin(angle) * size);
  }
  endShape(CLOSE);
  
  // Inner inverted triangle
  beginShape();
  for (let i = 0; i < 3; i++) {
    const angle = i * 120 + 90;
    vertex(cos(angle) * size * 0.5, sin(angle) * size * 0.5);
  }
  endShape(CLOSE);
}

function drawFrequencyRings() {
  const freq = FREQUENCIES[currentFrequency];
  noFill();
  
  for (let i = 0; i < 5; i++) {
    const alpha = map(sin(frameCount * 3 + i * 30), -1, 1, 50, 150);
    stroke(freq.color[0], freq.color[1], freq.color[2], alpha);
    strokeWeight(1);
    
    const radius = 220 + i * 15 + sin(frameCount * 2 + i * 20) * 5;
    ellipse(0, 0, radius * 2, radius * 2);
  }
}

function drawSigilOverlay() {
  const freq = FREQUENCIES[currentFrequency];
  
  // Central eye of the crown
  push();
  fill(freq.color[0], freq.color[1], freq.color[2], 100);
  noStroke();
  
  const pulseSize = 30 + sin(frameCount * 4) * 10;
  ellipse(0, 0, pulseSize, pulseSize);
  
  // Inner core
  fill(255, 255, 255, 200);
  ellipse(0, 0, pulseSize * 0.3, pulseSize * 0.3);
  pop();
  
  // Frequency number overlay
  push();
  rotate(-rotationAngle); // Counter-rotate for readable text
  fill(255, 215, 0, 150);
  textAlign(CENTER, CENTER);
  textSize(16);
  text(currentFrequency + ' Hz', 0, 260);
  pop();
}

function regenerateSigil() {
  seed = Math.random() * 10000;
  rotationAngle = 0;
}

function saveCrown() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  saveCanvas(canvas, `scrollverse-crown-${currentFrequency}hz-${timestamp}`, 'png');
}

function toggleAnimation() {
  isAnimating = !isAnimating;
  document.getElementById('animate').textContent = isAnimating ? '✨ Toggle Animation' : '⏸️ Resume Animation';
}

function cycleFrequency() {
  const frequencies = Object.keys(FREQUENCIES).map(Number);
  const currentIndex = frequencies.indexOf(currentFrequency);
  const nextIndex = (currentIndex + 1) % frequencies.length;
  currentFrequency = frequencies[nextIndex];
  
  updateFrequencyDisplay();
}

function updateFrequencyDisplay() {
  const freq = FREQUENCIES[currentFrequency];
  document.getElementById('frequency').textContent = 
    `Current Frequency: ${currentFrequency} Hz (${freq.name})`;
}

// Keyboard controls
function keyPressed() {
  if (key === 'r' || key === 'R') {
    regenerateSigil();
  } else if (key === 's' || key === 'S') {
    saveCrown();
  } else if (key === ' ') {
    toggleAnimation();
  } else if (key === 'f' || key === 'F') {
    cycleFrequency();
  }
}
