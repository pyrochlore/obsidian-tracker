# Test Setup Guide

## Quick Start

Tests are now set up and working! Just run:

```bash
npm test
```

## First Time Setup

If you're setting up the project for the first time:

```bash
# Install all dependencies (including Jest)
npm install

# Run tests to verify everything works
npm test
```

## If npm install fails

If you encounter integrity check errors with the `obsidian` package:

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

This should resolve the issue. The npm cache fix worked for us!

## Test Files Created

- `test/frontmatter-exists.test.ts` - Comprehensive unit tests for the new feature
- `test/mocks/obsidian.ts` - Mock Obsidian API
- `test/setup.ts` - Jest setup file
- `jest.config.js` - Jest configuration

## Running Tests

Once Jest is installed:

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage
```

## What the Tests Cover

The `frontmatter-exists.test.ts` file tests:
- ✅ Non-empty strings
- ❌ Empty strings  
- ❌ Whitespace-only strings
- ✅ Non-empty arrays
- ❌ Empty arrays
- ✅ Boolean true
- ✅ Boolean false
- ✅ Number zero
- ❌ Null values
- ❌ Missing/undefined fields
- ❌ Missing frontmatter
- ✅ Nested fields
