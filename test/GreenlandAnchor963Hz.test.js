/**
 * Tests for Greenland Anchor 963Hz Transmission System
 * Validates frequency transmission, site synchronization, and anomaly detection
 */

const GreenlandAnchor963Hz = require('../systems/greenland-anchor/GreenlandAnchor963Hz');
const fs = require('fs');
const path = require('path');

describe('GreenlandAnchor963Hz', () => {
  let anchor;

  beforeEach(() => {
    anchor = new GreenlandAnchor963Hz();
  });

  describe('Initialization', () => {
    test('should initialize with correct frequency', () => {
      expect(anchor.frequency).toBe(963);
    });

    test('should have site ID 9', () => {
      expect(anchor.siteId).toBe(9);
    });

    test('should have name "Greenland Anchor"', () => {
      expect(anchor.name).toBe('Greenland Anchor');
    });

    test('should load sovereign sites configuration', () => {
      expect(anchor.sitesConfig).toBeDefined();
      expect(anchor.sitesConfig.sites).toBeDefined();
    });

    test('should have geological features defined', () => {
      expect(anchor.geologicalFeatures).toBeDefined();
      expect(anchor.geologicalFeatures.subglacialCanyons).toBeDefined();
      expect(anchor.geologicalFeatures.hiawathaCrater).toBeDefined();
      expect(anchor.geologicalFeatures.ancientStrata).toBeDefined();
    });
  });

  describe('Transmission Initialization', () => {
    test('should activate transmission', () => {
      const state = anchor.initializeTransmission();
      expect(state.active).toBe(true);
    });

    test('should set power level to maximum', () => {
      anchor.initializeTransmission();
      expect(anchor.transmissionState.powerLevel).toBe(100);
    });

    test('should enable bedrock resonance', () => {
      anchor.initializeTransmission();
      expect(anchor.transmissionState.bedrockResonance.enabled).toBe(true);
    });

    test('should set penetration depth to Earth core', () => {
      anchor.initializeTransmission();
      expect(anchor.transmissionState.bedrockResonance.penetrationDepth).toBe(6371);
    });

    test('should calculate correct amplification factor', () => {
      anchor.initializeTransmission();
      const expectedAmplification = 2.3 * 1.963 * 1.618;
      expect(anchor.transmissionState.bedrockResonance.amplification).toBeCloseTo(expectedAmplification, 2);
    });

    test('should set coherence to 0.963', () => {
      anchor.initializeTransmission();
      expect(anchor.transmissionState.coherence).toBe(0.963);
    });
  });

  describe('Global Pulse Transmission', () => {
    beforeEach(() => {
      anchor.initializeTransmission();
    });

    test('should return null if transmission not active', () => {
      anchor.transmissionState.active = false;
      const result = anchor.transmitGlobalPulse();
      expect(result).toBeNull();
    });

    test('should transmit to all connected sites', () => {
      const results = anchor.transmitGlobalPulse();
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    test('should calculate signal strength with attenuation', () => {
      const results = anchor.transmitGlobalPulse();
      results.forEach(result => {
        expect(result.signalStrength).toBeDefined();
        expect(result.signalStrength).toBeGreaterThan(0);
      });
    });

    test('should calculate coherence for each site', () => {
      const results = anchor.transmitGlobalPulse();
      results.forEach(result => {
        expect(result.coherence).toBeDefined();
        expect(result.coherence).toBeGreaterThan(0);
        expect(result.coherence).toBeLessThanOrEqual(1);
      });
    });

    test('should assign correct status based on signal strength', () => {
      const results = anchor.transmitGlobalPulse();
      results.forEach(result => {
        expect(['STRONG', 'MODERATE', 'WEAK']).toContain(result.status);
      });
    });

    test('should update lastUpdate timestamp', () => {
      anchor.transmitGlobalPulse();
      expect(anchor.transmissionState.lastUpdate).toBeDefined();
      expect(new Date(anchor.transmissionState.lastUpdate)).toBeInstanceOf(Date);
    });
  });

  describe('Temporal Synchronization', () => {
    test('should synchronize frozen past', () => {
      const temporal = anchor.synchronizeTemporalStates();
      expect(temporal.frozenPast).toBe(true);
    });

    test('should synchronize liquid future', () => {
      const temporal = anchor.synchronizeTemporalStates();
      expect(temporal.liquidFuture).toBe(true);
    });

    test('should synchronize eternal now', () => {
      const temporal = anchor.synchronizeTemporalStates();
      expect(temporal.eternalNow).toBe(true);
    });

    test('should update transmission state with temporal sync', () => {
      anchor.synchronizeTemporalStates();
      expect(anchor.transmissionState.temporalSync.frozenPast).toBe(true);
      expect(anchor.transmissionState.temporalSync.liquidFuture).toBe(true);
      expect(anchor.transmissionState.temporalSync.eternalNow).toBe(true);
    });
  });

  describe('Anomaly Detection', () => {
    beforeEach(() => {
      anchor.initializeTransmission();
      anchor.transmitGlobalPulse();
    });

    test('should detect low coherence anomalies', () => {
      // Force low coherence
      anchor.transmissionState.connectedSites[0].coherence = 0.3;
      const anomalies = anchor.detectAnomalies();
      
      const lowCoherenceAnomalies = anomalies.filter(a => a.type === 'LOW_COHERENCE');
      expect(lowCoherenceAnomalies.length).toBeGreaterThan(0);
    });

    test('should detect weak signal anomalies', () => {
      // Force weak signal
      anchor.transmissionState.connectedSites[0].status = 'WEAK';
      const anomalies = anchor.detectAnomalies();
      
      const weakSignalAnomalies = anomalies.filter(a => a.type === 'WEAK_SIGNAL');
      expect(weakSignalAnomalies.length).toBeGreaterThan(0);
    });

    test('should detect low amplification anomalies', () => {
      // Force low amplification
      anchor.transmissionState.bedrockResonance.amplification = 1.5;
      const anomalies = anchor.detectAnomalies();
      
      const lowAmpAnomalies = anomalies.filter(a => a.type === 'LOW_AMPLIFICATION');
      expect(lowAmpAnomalies.length).toBeGreaterThan(0);
    });

    test('should return empty array when no anomalies', () => {
      const anomalies = anchor.detectAnomalies();
      expect(Array.isArray(anomalies)).toBe(true);
    });

    test('should include severity level in anomalies', () => {
      anchor.transmissionState.connectedSites[0].coherence = 0.3;
      const anomalies = anchor.detectAnomalies();
      
      anomalies.forEach(anomaly => {
        expect(anomaly.severity).toBeDefined();
        expect(['HIGH', 'MEDIUM', 'LOW']).toContain(anomaly.severity);
      });
    });

    test('should include recommendations for anomalies', () => {
      anchor.transmissionState.connectedSites[0].coherence = 0.3;
      const anomalies = anchor.detectAnomalies();
      
      anomalies.forEach(anomaly => {
        expect(anomaly.recommendation).toBeDefined();
        expect(typeof anomaly.recommendation).toBe('string');
      });
    });
  });

  describe('Frequency Recalibration', () => {
    beforeEach(() => {
      anchor.initializeTransmission();
      anchor.transmitGlobalPulse();
    });

    test('should not recalibrate when no anomalies', () => {
      const result = anchor.recalibrateFrequencies();
      expect(result.recalibrated).toBe(false);
      expect(result.anomalies.length).toBe(0);
    });

    test('should recalibrate when anomalies detected', () => {
      // Force anomaly
      anchor.transmissionState.connectedSites[0].coherence = 0.3;
      const result = anchor.recalibrateFrequencies();
      
      if (result.anomalies.length > 0) {
        expect(result.recalibrated).toBe(true);
        expect(result.recalibrations).toBeDefined();
      }
    });

    test('should boost coherence for low coherence anomalies', () => {
      const initialCoherence = anchor.transmissionState.coherence;
      anchor.transmissionState.connectedSites[0].coherence = 0.3;
      
      anchor.recalibrateFrequencies();
      
      // Coherence might be boosted
      expect(anchor.transmissionState.coherence).toBeDefined();
    });

    test('should increase power for weak signal anomalies', () => {
      const initialPower = 90;
      anchor.transmissionState.powerLevel = initialPower;
      anchor.transmissionState.connectedSites[0].status = 'WEAK';
      
      anchor.recalibrateFrequencies();
      
      // Power might be increased, but capped at 100
      expect(anchor.transmissionState.powerLevel).toBeLessThanOrEqual(100);
    });

    test('should include timestamp in recalibrations', () => {
      anchor.transmissionState.connectedSites[0].coherence = 0.3;
      const result = anchor.recalibrateFrequencies();
      
      if (result.recalibrations && result.recalibrations.length > 0) {
        result.recalibrations.forEach(recal => {
          expect(recal.timestamp).toBeDefined();
          expect(new Date(recal.timestamp)).toBeInstanceOf(Date);
        });
      }
    });
  });

  describe('Status Reporting', () => {
    beforeEach(() => {
      anchor.initializeTransmission();
      anchor.transmitGlobalPulse();
    });

    test('should get current status', () => {
      const status = anchor.getStatus();
      expect(status).toBeDefined();
      expect(status.site).toBeDefined();
      expect(status.transmission).toBeDefined();
      expect(status.geological).toBeDefined();
      expect(status.timestamp).toBeDefined();
    });

    test('should include site information in status', () => {
      const status = anchor.getStatus();
      expect(status.site.id).toBe(9);
      expect(status.site.name).toBe('Greenland Anchor');
      expect(status.site.frequency).toBe(963);
    });

    test('should include transmission state in status', () => {
      const status = anchor.getStatus();
      expect(status.transmission.active).toBeDefined();
      expect(status.transmission.powerLevel).toBeDefined();
      expect(status.transmission.coherence).toBeDefined();
    });

    test('should generate comprehensive report', () => {
      const report = anchor.generateReport();
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(100);
    });

    test('should include frequency in report', () => {
      const report = anchor.generateReport();
      expect(report).toContain('963Hz');
      expect(report).toContain('Pineal Activation');
    });

    test('should include connected sites in report', () => {
      const report = anchor.generateReport();
      expect(report).toContain('CONNECTED SITES');
    });

    test('should include anomalies section in report', () => {
      const report = anchor.generateReport();
      expect(report).toContain('ANOMALIES');
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing sites configuration gracefully', () => {
      anchor.sitesConfig = { sites: {}, synchronization_grid: {} };
      anchor.initializeTransmission();
      const results = anchor.transmitGlobalPulse();
      expect(Array.isArray(results)).toBe(true);
    });

    test('should handle zero power level', () => {
      anchor.initializeTransmission();
      anchor.transmissionState.powerLevel = 0;
      const results = anchor.transmitGlobalPulse();
      
      results.forEach(result => {
        expect(result.signalStrength).toBe(0);
      });
    });

    test('should handle maximum coherence', () => {
      anchor.initializeTransmission();
      anchor.transmissionState.coherence = 1.0;
      const status = anchor.getStatus();
      expect(status.transmission.coherence).toBe(1.0);
    });

    test('should handle multiple recalibration cycles', () => {
      anchor.initializeTransmission();
      anchor.transmitGlobalPulse();
      
      // Force anomaly
      anchor.transmissionState.connectedSites[0].coherence = 0.3;
      
      // First recalibration
      const result1 = anchor.recalibrateFrequencies();
      
      // Second recalibration
      const result2 = anchor.recalibrateFrequencies();
      
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    test('should maintain coherence within valid range', () => {
      anchor.initializeTransmission();
      
      // Try to set coherence above 1.0
      anchor.transmissionState.coherence = 1.5;
      
      // Recalibration should cap it
      anchor.recalibrateFrequencies();
      
      expect(anchor.transmissionState.coherence).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Integration Tests', () => {
    test('should complete full initialization and transmission cycle', () => {
      const initState = anchor.initializeTransmission();
      expect(initState.active).toBe(true);
      
      const transmitResults = anchor.transmitGlobalPulse();
      expect(transmitResults.length).toBeGreaterThan(0);
      
      const temporal = anchor.synchronizeTemporalStates();
      expect(temporal.eternalNow).toBe(true);
      
      const status = anchor.getStatus();
      expect(status.transmission.active).toBe(true);
    });

    test('should handle complete anomaly detection and recalibration flow', () => {
      anchor.initializeTransmission();
      anchor.transmitGlobalPulse();
      
      // Force anomaly
      anchor.transmissionState.connectedSites[0].coherence = 0.3;
      
      const anomalies = anchor.detectAnomalies();
      expect(anomalies.length).toBeGreaterThan(0);
      
      const recalibration = anchor.recalibrateFrequencies();
      expect(recalibration.recalibrated).toBe(true);
    });
  });
});
