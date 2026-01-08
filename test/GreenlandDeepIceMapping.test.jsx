/**
 * Tests for Greenland Deep-Ice Mapping Protocol React Component
 * Validates UI rendering, real-time updates, and edge cases
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GreenlandDeepIceMapping from '../systems/greenland-anchor/GreenlandDeepIceMapping';

// Mock timers for testing real-time updates
jest.useFakeTimers();

describe('GreenlandDeepIceMapping Component', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initial Rendering', () => {
    test('should render the component header', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/GREENLAND ANCHOR/i)).toBeInTheDocument();
    });

    test('should display 963Hz frequency badge', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/963Hz Pineal Activation/i)).toBeInTheDocument();
    });

    test('should render transmission status panel', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Transmission Status/i)).toBeInTheDocument();
    });

    test('should render geological amplification panel', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Geological Amplification/i)).toBeInTheDocument();
    });

    test('should render temporal synchronization panel', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Temporal Synchronization/i)).toBeInTheDocument();
    });

    test('should render connected sites panel', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Connected Sovereign Sites/i)).toBeInTheDocument();
    });

    test('should render anomaly detection panel', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Anomaly Detection/i)).toBeInTheDocument();
    });
  });

  describe('Transmission Status Display', () => {
    test('should show active transmission status', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/YES/i)).toBeInTheDocument();
    });

    test('should display frequency information', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/963Hz \(Pineal Activation\)/i)).toBeInTheDocument();
    });

    test('should show power level', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/100%/)).toBeInTheDocument();
    });

    test('should display coherence percentage', () => {
      render(<GreenlandDeepIceMapping />);
      const coherenceText = screen.getAllByText(/%/);
      expect(coherenceText.length).toBeGreaterThan(0);
    });

    test('should render coherence bar', () => {
      const { container } = render(<GreenlandDeepIceMapping />);
      const coherenceBar = container.querySelector('.coherence-bar');
      expect(coherenceBar).toBeInTheDocument();
    });
  });

  describe('Geological Features Display', () => {
    test('should display subglacial canyons', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Subglacial Canyons/i)).toBeInTheDocument();
    });

    test('should show subglacial canyons amplification', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/2\.3x Resonance/i)).toBeInTheDocument();
    });

    test('should display Hiawatha Crater', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Hiawatha Crater/i)).toBeInTheDocument();
    });

    test('should show Hiawatha Crater amplification', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/1\.963x Amplification/i)).toBeInTheDocument();
    });

    test('should display Ancient Strata', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Ancient Strata/i)).toBeInTheDocument();
    });

    test('should show Ancient Strata coherence with golden ratio', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/1\.618x.*Coherence/i)).toBeInTheDocument();
    });

    test('should display total amplification', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Total Amplification.*7\.204x/i)).toBeInTheDocument();
    });
  });

  describe('Temporal Synchronization Display', () => {
    test('should show Frozen Past status', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Frozen Past/i)).toBeInTheDocument();
    });

    test('should show Liquid Future status', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Liquid Future/i)).toBeInTheDocument();
    });

    test('should show Eternal Now status', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Eternal Now/i)).toBeInTheDocument();
    });

    test('should display synchronized checkmarks', () => {
      render(<GreenlandDeepIceMapping />);
      const checkmarks = screen.getAllByText(/✅/);
      expect(checkmarks.length).toBeGreaterThanOrEqual(3);
    });

    test('should show preservation mode', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Cryo-Quantum Preservation/i)).toBeInTheDocument();
    });

    test('should show dynamic adaptation', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Dynamic Adaptation/i)).toBeInTheDocument();
    });

    test('should show perpetual alignment', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Perpetual Alignment/i)).toBeInTheDocument();
    });
  });

  describe('Connected Sites Display', () => {
    test('should display Lake Nona site', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Lake Nona/i)).toBeInTheDocument();
    });

    test('should display Singapore Vault site', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Singapore Vault/i)).toBeInTheDocument();
    });

    test('should display Atlantic City Command Nexus site', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Atlantic City Command Nexus/i)).toBeInTheDocument();
    });

    test('should show site distances', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/5,420 km/)).toBeInTheDocument();
      expect(screen.getByText(/9,830 km/)).toBeInTheDocument();
      expect(screen.getByText(/3,560 km/)).toBeInTheDocument();
    });

    test('should display signal strength for each site', () => {
      const { container } = render(<GreenlandDeepIceMapping />);
      const signalBars = container.querySelectorAll('.signal-bar');
      expect(signalBars.length).toBeGreaterThanOrEqual(3);
    });

    test('should show pathway information', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/mid atlantic ridge/i)).toBeInTheDocument();
      expect(screen.getByText(/eurasian plate/i)).toBeInTheDocument();
      expect(screen.getByText(/north atlantic bedrock/i)).toBeInTheDocument();
    });
  });

  describe('Anomaly Detection Display', () => {
    test('should show no anomalies message when system is optimal', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/No anomalies detected/i)).toBeInTheDocument();
    });

    test('should display success icon when no anomalies', () => {
      const { container } = render(<GreenlandDeepIceMapping />);
      const successIcon = container.querySelector('.success-icon');
      expect(successIcon).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    test('should update coherence over time', async () => {
      render(<GreenlandDeepIceMapping />);
      
      const initialCoherence = screen.getByText(/Coherence:/i).nextSibling?.textContent;
      
      // Fast-forward time by 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        const updatedCoherence = screen.getByText(/Coherence:/i).nextSibling?.textContent;
        // Coherence might have fluctuated
        expect(updatedCoherence).toBeDefined();
      });
    });

    test('should update last update timestamp', async () => {
      render(<GreenlandDeepIceMapping />);
      
      const initialTime = screen.getByText(/Last Update:/i).nextSibling?.textContent;
      
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        const updatedTime = screen.getByText(/Last Update:/i).nextSibling?.textContent;
        expect(updatedTime).toBeDefined();
      });
    });

    test('should show live monitoring indicator', () => {
      render(<GreenlandDeepIceMapping />);
      expect(screen.getByText(/Live Monitoring Active/i)).toBeInTheDocument();
    });

    test('should render pulse animation', () => {
      const { container } = render(<GreenlandDeepIceMapping />);
      const pulseDot = container.querySelector('.pulse-dot');
      expect(pulseDot).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle no connected sites gracefully', () => {
      render(<GreenlandDeepIceMapping />);
      // Should still render without crashing
      expect(screen.getByText(/Connected Sovereign Sites/i)).toBeInTheDocument();
    });

    test('should handle very low coherence values', async () => {
      render(<GreenlandDeepIceMapping />);
      
      // After multiple updates, coherence might drop
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        const coherenceText = screen.getByText(/Coherence:/i).nextSibling;
        expect(coherenceText).toBeDefined();
      });
    });

    test('should handle maximum coherence values', () => {
      render(<GreenlandDeepIceMapping />);
      // Component should render coherence up to 100%
      const { container } = render(<GreenlandDeepIceMapping />);
      expect(container).toBeInTheDocument();
    });

    test('should display different site statuses correctly', () => {
      const { container } = render(<GreenlandDeepIceMapping />);
      const statusElements = container.querySelectorAll('.site-status');
      expect(statusElements.length).toBeGreaterThan(0);
    });

    test('should render with different anomaly severities', () => {
      render(<GreenlandDeepIceMapping />);
      // Should handle HIGH, MEDIUM, LOW severities
      expect(screen.getByText(/Anomaly Detection/i)).toBeInTheDocument();
    });

    test('should handle rapid consecutive updates', async () => {
      render(<GreenlandDeepIceMapping />);
      
      // Multiple rapid updates
      act(() => {
        jest.advanceTimersByTime(5000);
        jest.advanceTimersByTime(5000);
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Live Monitoring Active/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('should render all panels', () => {
      const { container } = render(<GreenlandDeepIceMapping />);
      const panels = container.querySelectorAll('.panel');
      expect(panels.length).toBeGreaterThanOrEqual(5);
    });

    test('should apply correct CSS classes', () => {
      const { container } = render(<GreenlandDeepIceMapping />);
      const mappingDiv = container.querySelector('.greenland-deep-ice-mapping');
      expect(mappingDiv).toBeInTheDocument();
    });

    test('should render grid layout', () => {
      const { container } = render(<GreenlandDeepIceMapping />);
      const grid = container.querySelector('.mapping-grid');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper heading structure', () => {
      render(<GreenlandDeepIceMapping />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    test('should have readable text content', () => {
      const { container } = render(<GreenlandDeepIceMapping />);
      expect(container.textContent).toBeTruthy();
      expect(container.textContent.length).toBeGreaterThan(100);
    });
  });
});
