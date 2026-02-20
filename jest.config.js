module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        module: 'commonjs',
      },
    }],
  },
  moduleNameMapper: {
    '^obsidian$': '<rootDir>/test/mocks/obsidian.ts',
    // Mock d3 and other ES module dependencies
    '^d3$': '<rootDir>/test/mocks/d3.ts',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // Transform ES modules in node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(d3|d3-.*|moment)/)',
  ],
};
