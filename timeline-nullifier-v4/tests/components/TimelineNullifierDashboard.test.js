/**
 * Timeline Nullifier Dashboard Tests
 * 
 * Basic test suite for Timeline Nullifier v4.0
 */

import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('Timeline Nullifier v4.0 Dashboard', () => {
  test('renders Timeline Nullifier dashboard', () => {
    render(<App />);
    const titleElement = screen.getByText(/Timeline Nullifier/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('displays system status indicators', () => {
    render(<App />);
    const statusElements = screen.getAllByText(/CONNECTED|DISCONNECTED/i);
    expect(statusElements.length).toBeGreaterThan(0);
  });

  test('shows navigation tabs', () => {
    render(<App />);
    const overviewTab = screen.getByText(/Overview/i);
    expect(overviewTab).toBeInTheDocument();
  });
});

// Mock market data service
jest.mock('../../src/services/marketDataService', () => ({
  fetchQuote: jest.fn(() => Promise.resolve({
    symbol: 'PSQ',
    price: 12.50,
    change: -0.25,
    changePercent: -1.96,
    volume: 1000000,
    timestamp: new Date().toISOString(),
  })),
  fetchETFPositions: jest.fn(() => Promise.resolve({
    psq: { price: 12.50, change: -0.25, changePercent: -1.96 },
    tlt: { price: 95.20, change: 0.15, changePercent: 0.16 },
    iwm: { price: 185.30, change: 1.20, changePercent: 0.65 },
    totalValue: 293.00,
    lastUpdated: new Date().toISOString(),
  })),
  fetchIntradayData: jest.fn(() => Promise.resolve([])),
  fetchDailyData: jest.fn(() => Promise.resolve([])),
}));
