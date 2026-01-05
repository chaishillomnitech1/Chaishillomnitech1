module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.[jt]s',
    '**/?(*.)+(spec|test).[jt]s',
  ],
  collectCoverageFrom: [
    'scripts/**/*.[jt]s',
    'sovereign-tv-app/**/*.[jt]s',
    'scrollsoul_dashboard/src/**/*.[jt]s',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/coverage/**',
    '!**/*.config.js',
    '!**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testTimeout: 30000,
  verbose: true,
};
