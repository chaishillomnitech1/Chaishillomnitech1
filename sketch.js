/**
 * Fractal Crown Generator - ScrollVerse Sigil Generator
 * Generates sacred geometry fractals based on frequency resonance
 * 
 * @author ScrollVerse Development Team
 * @version 1.0.0
 * @license MIT
 */

let branches = 6;
let maxDepth = 5;
let branchAngle = 30;
let frequency = 528;
let rotation = 0;
let colorOffset = 0;

// Frequency mapping for ScrollVerse sacred frequencies
const FREQUENCY_NAMES = {
  111: 'Angelic Gateway',
  369: 'Tesla Resonance',
  528: 'DNA Healing',
  639: 'Heart Connection',
  741: 'Awakening',
  852: 'Intuition',
  963: 'Pineal Activation',
  999: 'Crown Chakra'
};

function setup() {
  const canvas = createCanvas(800, 800);
  canvas.parent('canvas-container');
  colorMode(HSB, 360, 100, 100, 100);
  angleMode(DEGREES);
  
  // Setup event listeners for controls
  setupControls();
}

function draw() {
  background(240, 30, 8);
  translate(width / 2, height / 2);
  rotation += 0.1;
  colorOffset += 0.5;
  
  // Draw main fractal crown
  push();
  rotate(rotation);
  drawFractalCrown(0, -height / 4, height / 6, maxDepth);
  pop();
  
  // Draw center sigil
  drawCenterSigil();
  
  // Draw frequency waves
  drawFrequencyWaves();
}

function drawFractalCrown(x, y, len, depth) {
  if (depth === 0) return;
  
  const hue = (colorOffset + depth * 40 + frequency / 3) % 360;
  const sat = 70 + depth * 5;
  const bright = 60 + depth * 8;
  
  stroke(hue, sat, bright, 80);
  strokeWeight(depth * 0.8);
  
  // Draw main branch
  push();
  translate(x, y);
  line(0, 0, 0, -len);
  
  // Draw symmetric branches
  for (let i = 0; i < branches; i++) {
    const angle = (360 / branches) * i;
    push();
    rotate(angle);
    translate(0, -len);
    
    // Left sub-branch
    push();
    rotate(-branchAngle);
    line(0, 0, 0, -len * 0.7);
    drawFractalCrown(0, -len * 0.7, len * 0.6, depth - 1);
    pop();
    
    // Right sub-branch
    push();
    rotate(branchAngle);
    line(0, 0, 0, -len * 0.7);
    drawFractalCrown(0, -len * 0.7, len * 0.6, depth - 1);
    pop();
    
    pop();
  }
  pop();
}

function drawCenterSigil() {
  push();
  noFill();
  
  // Outer rings
  for (let i = 3; i >= 1; i--) {
    const hue = (colorOffset + i * 60 + frequency / 5) % 360;
    stroke(hue, 80, 90, 50);
    strokeWeight(2);
    ellipse(0, 0, 60 + i * 30, 60 + i * 30);
  }
  
  // Inner sacred symbol based on frequency
  const symbolSegments = Math.floor(frequency / 100);
  stroke(45, 100, 100, 90); // Gold
  strokeWeight(3);
  
  for (let i = 0; i < symbolSegments; i++) {
    const angle = (360 / symbolSegments) * i + rotation * 2;
    const x1 = cos(angle) * 20;
    const y1 = sin(angle) * 20;
    const x2 = cos(angle + 360 / symbolSegments / 2) * 40;
    const y2 = sin(angle + 360 / symbolSegments / 2) * 40;
    line(x1, y1, x2, y2);
  }
  
  // Center point
  fill(45, 100, 100, 100);
  noStroke();
  ellipse(0, 0, 10, 10);
  
  pop();
}

function drawFrequencyWaves() {
  push();
  noFill();
  
  const waveCount = Math.floor(frequency / 150);
  
  for (let w = 0; w < waveCount; w++) {
    const hue = (colorOffset + w * 50) % 360;
    stroke(hue, 60, 80, 30 - w * 5);
    strokeWeight(1);
    
    beginShape();
    for (let a = 0; a < 360; a += 5) {
      const r = 300 + w * 30 + sin(a * 3 + frameCount * 2) * 10;
      const x = cos(a) * r;
      const y = sin(a) * r;
      vertex(x, y);
    }
    endShape(CLOSE);
  }
  
  pop();
}

function setupControls() {
  // Branches control
  const branchesInput = select('#branches');
  branchesInput.input(() => {
    branches = parseInt(branchesInput.value());
    select('#branchValue').html(branches);
  });
  
  // Depth control
  const depthInput = select('#depth');
  depthInput.input(() => {
    maxDepth = parseInt(depthInput.value());
    select('#depthValue').html(maxDepth);
  });
  
  // Angle control
  const angleInput = select('#angle');
  angleInput.input(() => {
    branchAngle = parseInt(angleInput.value());
    select('#angleValue').html(branchAngle);
  });
  
  // Frequency control
  const frequencyInput = select('#frequency');
  frequencyInput.input(() => {
    frequency = parseInt(frequencyInput.value());
    select('#freqValue').html(frequency);
    updateFrequencyDisplay();
  });
}

function updateFrequencyDisplay() {
  const freqDisplay = select('#freqDisplay');
  freqDisplay.html(`${frequency} Hz`);
  
  // Find closest sacred frequency
  let closestFreq = 528;
  let minDiff = Infinity;
  
  for (const freq of Object.keys(FREQUENCY_NAMES)) {
    const diff = Math.abs(parseInt(freq) - frequency);
    if (diff < minDiff) {
      minDiff = diff;
      closestFreq = freq;
    }
  }
  
  const freqName = FREQUENCY_NAMES[closestFreq] || 'Custom Frequency';
  const descEl = select('.frequency-display div');
  if (descEl) {
    descEl.html(freqName);
  }
}

function resetDefaults() {
  branches = 6;
  maxDepth = 5;
  branchAngle = 30;
  frequency = 528;
  
  select('#branches').value(branches);
  select('#depth').value(maxDepth);
  select('#angle').value(branchAngle);
  select('#frequency').value(frequency);
  
  select('#branchValue').html(branches);
  select('#depthValue').html(maxDepth);
  select('#angleValue').html(branchAngle);
  select('#freqValue').html(frequency);
  
  updateFrequencyDisplay();
}

// Keyboard shortcuts
function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('fractal_crown_' + frequency + 'hz', 'png');
  }
  if (key === 'r' || key === 'R') {
    resetDefaults();
  }
}
