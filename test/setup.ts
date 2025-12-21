/**
 * Jest setup file
 * Runs before each test file
 */

// Mock global objects that Obsidian uses
global.window = {
    moment: require('moment'),
} as any;

// Mock console methods if needed (optional)
// global.console = {
//     ...console,
//     error: jest.fn(),
//     log: jest.fn(),
// };
