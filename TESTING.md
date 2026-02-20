# Testing Guide

This document explains how to run tests for the obsidian-tracker plugin.

## Quick Start

```bash
npm test
```

That's it! The tests will run automatically.

## Test Commands

```bash
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode (re-runs on file changes)
npm run test:coverage # Run tests with coverage report
```

## What Gets Tested

### Unit Tests

Unit tests validate core logic without requiring Obsidian to be running. They test:

- **Data collection functions** - How data is extracted from frontmatter, tags, etc.
- **Parsing functions** - YAML configuration parsing and validation
- **Edge cases** - Empty values, null, undefined, arrays, booleans, etc.

### Current Test Coverage

- `test/frontmatter-exists.test.ts` - Tests for the `frontmatter.exists` searchType
  - 12 test cases covering all edge cases
  - Validates non-empty strings, arrays, booleans, numbers
  - Validates empty strings, arrays, null, undefined are rejected

## Test Structure

```
test/
├── frontmatter-exists.test.ts  # Unit tests for frontmatter.exists
├── mocks/
│   ├── obsidian.ts             # Mock Obsidian API
│   └── d3.ts                   # Mock d3 library
└── setup.ts                    # Jest setup file
```

## Prerequisites

1. **Node.js** - Version 18+ recommended
2. **npm** - Comes with Node.js
3. **Dependencies** - Run `npm install` first

## First Time Setup

```bash
# Install dependencies (including Jest)
npm install

# Verify tests work
npm test
```

If you encounter issues with npm install (e.g., obsidian package integrity errors), see [Troubleshooting](#troubleshooting) below.

## Writing New Tests

### Example Test Structure

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { SearchType, Query } from '../src/data';
import { yourFunction } from '../src/your-module';

describe('Your Feature', () => {
    let query: Query;
    
    beforeEach(() => {
        // Set up test data
        query = new Query(0, SearchType.YourType, 'target');
    });
    
    it('should do something', () => {
        const result = yourFunction(query);
        expect(result).toBe(true);
    });
});
```

### Test File Naming

- Test files should be named `*.test.ts` or `*.spec.ts`
- Place them in the `test/` directory
- Jest will automatically find and run them

## Mocking Obsidian API

Since tests run outside Obsidian, we mock the Obsidian API. See `test/mocks/obsidian.ts` for examples.

To use mocks:

```typescript
import type { CachedMetadata } from 'obsidian';

const fileCache: CachedMetadata = {
    frontmatter: {
        field: 'value'
    }
};
```

## Troubleshooting

### npm install fails with obsidian package error

If you see integrity check errors for the obsidian package:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tests fail with "Module not found"

Make sure all dependencies are installed:

```bash
npm install
```

### TypeScript errors in tests

Check that `ts-jest` is installed:

```bash
npm install --save-dev ts-jest@29 @types/jest@29
```

## Continuous Integration

These tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test
```

## Manual Testing (Obsidian)

For visual/end-to-end testing, you still need to test in Obsidian:

1. Build the plugin: `npm run build`
2. Copy to test vault: See `test-deploy.sh` or `TEST_SETUP.md`
3. Enable plugin in Obsidian
4. Test with real notes

See `docs/dev/issue-497/TESTING_GUIDE.md` for detailed manual testing instructions.

## Coverage Reports

Generate coverage reports:

```bash
npm run test:coverage
```

This creates a `coverage/` directory with HTML reports. Open `coverage/lcov-report/index.html` in a browser to view.

## Best Practices

1. **Write tests for new features** - Add tests when implementing new searchTypes or features
2. **Test edge cases** - Empty values, null, undefined, arrays, etc.
3. **Keep tests fast** - Unit tests should run in seconds
4. **Mock external dependencies** - Don't require Obsidian or real files
5. **Use descriptive test names** - "should count non-empty strings" not "test1"

## Questions?

- See `TEST_SETUP.md` for setup troubleshooting
- Check existing test files for examples
- Review Jest documentation: https://jestjs.io/docs/getting-started
