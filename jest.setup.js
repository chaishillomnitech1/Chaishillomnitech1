// Jest setup file
// Add custom matchers, global test setup, etc.

// Set up environment variables for tests
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Add custom test utilities
global.testUtils = {
  // Add any global test utilities here
};
