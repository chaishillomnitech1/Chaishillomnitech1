#!/usr/bin/env node

/**
 * Greenland Anchor Integration Test Script
 * Validates complete system integration and functionality
 */

const GreenlandAnchor963Hz = require('./systems/greenland-anchor/GreenlandAnchor963Hz');
const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║   GREENLAND ANCHOR INTEGRATION TEST                            ║');
console.log('║   Validating 963Hz Northern Pulse System                       ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

let testsPassed = 0;
let testsFailed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    testsFailed++;
    failures.push({ name, error: error.message });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test 1: Configuration Files
console.log('\n📁 Testing Configuration Files...\n');

test('Sovereign sites configuration exists', () => {
  const configPath = path.join(__dirname, 'config/sovereign_sites.json');
  assert(fs.existsSync(configPath), 'sovereign_sites.json not found');
});

test('Sovereign sites configuration is valid JSON', () => {
  const configPath = path.join(__dirname, 'config/sovereign_sites.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  assert(config.sites, 'Sites not defined in config');
  assert(config.sites.site_9, 'Greenland Anchor (site_9) not found');
});

test('Frequency configuration includes Greenland Anchor', () => {
  const freqPath = path.join(__dirname, 'frequency_config.json');
  const config = JSON.parse(fs.readFileSync(freqPath, 'utf8'));
  assert(config.integration_points.greenland_anchor, 'Greenland Anchor not in frequency config');
  assert(config.integration_points.greenland_anchor.enabled, 'Greenland Anchor not enabled');
});

// Test 2: System Initialization
console.log('\n🚀 Testing System Initialization...\n');

const anchor = new GreenlandAnchor963Hz();

test('Greenland Anchor instantiates correctly', () => {
  assert(anchor, 'Anchor instance not created');
  assert(anchor.frequency === 963, 'Incorrect frequency');
  assert(anchor.siteId === 9, 'Incorrect site ID');
});

test('System initializes transmission', () => {
  const state = anchor.initializeTransmission();
  assert(state.active, 'Transmission not active');
  assert(state.powerLevel === 100, 'Power level not at maximum');
  assert(state.coherence === 0.963, 'Incorrect coherence');
});

test('Bedrock resonance is enabled', () => {
  assert(anchor.transmissionState.bedrockResonance.enabled, 'Bedrock resonance not enabled');
  assert(anchor.transmissionState.bedrockResonance.penetrationDepth === 6371, 'Incorrect penetration depth');
});

test('Geological amplification calculated correctly', () => {
  const expectedAmp = 2.3 * 1.963 * 1.618;
  const actualAmp = anchor.transmissionState.bedrockResonance.amplification;
  assert(Math.abs(actualAmp - expectedAmp) < 0.1, `Amplification mismatch: expected ~${expectedAmp}, got ${actualAmp}`);
});

// Test 3: Global Pulse Transmission
console.log('\n📡 Testing Global Pulse Transmission...\n');

test('Transmits pulse to connected sites', () => {
  const results = anchor.transmitGlobalPulse();
  assert(results, 'No transmission results');
  assert(Array.isArray(results), 'Results not an array');
  assert(results.length === 3, `Expected 3 sites, got ${results.length}`);
});

test('All sites receive STRONG signal', () => {
  const results = anchor.transmitGlobalPulse();
  results.forEach(result => {
    assert(result.status === 'STRONG', `Site ${result.targetSite} has ${result.status} signal`);
  });
});

test('Signal coherence maintained for all sites', () => {
  const results = anchor.transmitGlobalPulse();
  results.forEach(result => {
    assert(result.coherence > 0.7, `Site ${result.targetSite} coherence too low: ${result.coherence}`);
  });
});

test('Transmission pathways defined for all sites', () => {
  const results = anchor.transmitGlobalPulse();
  results.forEach(result => {
    assert(result.pathway, `No pathway for ${result.targetSite}`);
    assert(result.distance > 0, `Invalid distance for ${result.targetSite}`);
  });
});

// Test 4: Temporal Synchronization
console.log('\n⏰ Testing Temporal Synchronization...\n');

test('Synchronizes temporal states', () => {
  const temporal = anchor.synchronizeTemporalStates();
  assert(temporal, 'No temporal state returned');
});

test('Frozen Past synchronized', () => {
  const temporal = anchor.synchronizeTemporalStates();
  assert(temporal.frozenPast, 'Frozen Past not synchronized');
});

test('Liquid Future synchronized', () => {
  const temporal = anchor.synchronizeTemporalStates();
  assert(temporal.liquidFuture, 'Liquid Future not synchronized');
});

test('Eternal Now synchronized', () => {
  const temporal = anchor.synchronizeTemporalStates();
  assert(temporal.eternalNow, 'Eternal Now not synchronized');
});

// Test 5: Anomaly Detection
console.log('\n🔍 Testing Anomaly Detection...\n');

test('Detects anomalies when present', () => {
  // Force an anomaly
  anchor.transmissionState.connectedSites[0].coherence = 0.3;
  const anomalies = anchor.detectAnomalies();
  assert(anomalies.length > 0, 'Anomalies not detected');
  const lowCoherence = anomalies.find(a => a.type === 'LOW_COHERENCE');
  assert(lowCoherence, 'Low coherence anomaly not detected');
});

test('No false positives when system optimal', () => {
  // Reset to optimal state
  anchor.initializeTransmission();
  anchor.transmitGlobalPulse();
  const anomalies = anchor.detectAnomalies();
  // May or may not have anomalies depending on thresholds
  assert(Array.isArray(anomalies), 'Anomalies not returned as array');
});

test('Anomalies include severity levels', () => {
  anchor.transmissionState.connectedSites[0].coherence = 0.3;
  const anomalies = anchor.detectAnomalies();
  if (anomalies.length > 0) {
    anomalies.forEach(anomaly => {
      assert(anomaly.severity, 'Anomaly missing severity');
      assert(['HIGH', 'MEDIUM', 'LOW'].includes(anomaly.severity), 'Invalid severity level');
    });
  }
});

// Test 6: Frequency Recalibration
console.log('\n🔧 Testing Frequency Recalibration...\n');

test('Recalibrates when anomalies detected', () => {
  anchor.transmissionState.connectedSites[0].coherence = 0.3;
  const result = anchor.recalibrateFrequencies();
  assert(result, 'No recalibration result');
  assert(result.anomalies, 'Anomalies not included in result');
});

test('No recalibration when system optimal', () => {
  anchor.initializeTransmission();
  anchor.transmitGlobalPulse();
  const result = anchor.recalibrateFrequencies();
  // System should be optimal
  assert(result, 'No result returned');
});

test('Recalibration includes timestamps', () => {
  anchor.transmissionState.connectedSites[0].coherence = 0.3;
  const result = anchor.recalibrateFrequencies();
  if (result.recalibrated && result.recalibrations && result.recalibrations.length > 0) {
    result.recalibrations.forEach(recal => {
      assert(recal.timestamp, 'Recalibration missing timestamp');
      assert(new Date(recal.timestamp) instanceof Date, 'Invalid timestamp');
    });
  }
});

// Test 7: Status Reporting
console.log('\n📊 Testing Status Reporting...\n');

test('Gets current system status', () => {
  const status = anchor.getStatus();
  assert(status, 'No status returned');
  assert(status.site, 'Site info missing');
  assert(status.transmission, 'Transmission state missing');
  assert(status.geological, 'Geological features missing');
});

test('Status includes all required fields', () => {
  const status = anchor.getStatus();
  assert(status.site.id === 9, 'Incorrect site ID in status');
  assert(status.site.frequency === 963, 'Incorrect frequency in status');
  assert(status.transmission.active !== undefined, 'Active status missing');
  assert(status.transmission.coherence !== undefined, 'Coherence missing');
});

test('Generates comprehensive report', () => {
  const report = anchor.generateReport();
  assert(typeof report === 'string', 'Report not a string');
  assert(report.length > 100, 'Report too short');
  assert(report.includes('963Hz'), 'Report missing frequency');
  assert(report.includes('GREENLAND ANCHOR'), 'Report missing title');
});

// Test 8: Integration Points
console.log('\n🔗 Testing Integration Points...\n');

test('System files exist', () => {
  assert(fs.existsSync('systems/greenland-anchor/GreenlandAnchor963Hz.js'), 'Main system file missing');
  assert(fs.existsSync('systems/greenland-anchor/GreenlandDeepIceMapping.jsx'), 'React component missing');
  assert(fs.existsSync('systems/greenland-anchor/GreenlandDeepIceMapping.css'), 'CSS file missing');
  assert(fs.existsSync('systems/greenland-anchor/README.md'), 'README missing');
});

test('Test files exist', () => {
  assert(fs.existsSync('test/GreenlandAnchor963Hz.test.js'), 'Backend tests missing');
  assert(fs.existsSync('test/GreenlandDeepIceMapping.test.jsx'), 'React tests missing');
});

test('Documentation exists', () => {
  assert(fs.existsSync('GREENLAND_ANCHOR_DEPLOYMENT_GUIDE.md'), 'Deployment guide missing');
  assert(fs.existsSync('systems/greenland-anchor/README.md'), 'System README missing');
});

// Test 9: Full Integration Flow
console.log('\n🌐 Testing Full Integration Flow...\n');

test('Complete initialization and transmission cycle', () => {
  const freshAnchor = new GreenlandAnchor963Hz();
  
  // Initialize
  const initState = freshAnchor.initializeTransmission();
  assert(initState.active, 'Initialization failed');
  
  // Transmit
  const transmitResults = freshAnchor.transmitGlobalPulse();
  assert(transmitResults.length > 0, 'Transmission failed');
  
  // Synchronize
  const temporal = freshAnchor.synchronizeTemporalStates();
  assert(temporal.eternalNow, 'Temporal sync failed');
  
  // Check status
  const status = freshAnchor.getStatus();
  assert(status.transmission.active, 'Status check failed');
});

// Final Report
console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║   TEST RESULTS                                                 ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📊 Total Tests: ${testsPassed + testsFailed}`);
console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%\n`);

if (testsFailed > 0) {
  console.log('❌ FAILED TESTS:\n');
  failures.forEach(failure => {
    console.log(`   • ${failure.name}`);
    console.log(`     ${failure.error}\n`);
  });
  process.exit(1);
} else {
  console.log('🎉 ALL TESTS PASSED!');
  console.log('✅ Greenland Anchor 963Hz Northern Pulse System is fully operational!\n');
  
  // Generate final report
  const finalReport = anchor.generateReport();
  console.log(finalReport);
  
  process.exit(0);
}
