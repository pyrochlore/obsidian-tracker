/**
 * Automated tests for frontmatter.exists searchType
 * 
 * Run with: npm test
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { SearchType, Query, RenderInfo, DataMap, XValueMap } from '../src/data';
import { collectDataFromFrontmatterExists } from '../src/collecting';
import type { CachedMetadata } from 'obsidian';

// Mock Obsidian types
type MockCachedMetadata = {
    frontmatter?: Record<string, any>;
};

describe('frontmatter.exists searchType', () => {
    let query: Query;
    let renderInfo: RenderInfo;
    let dataMap: DataMap;
    let xValueMap: XValueMap;

    beforeEach(() => {
        // Create a query for frontmatter.exists
        query = new Query(0, SearchType.FrontmatterExists, 'meditation');
        
        // Create minimal renderInfo
        renderInfo = new RenderInfo([query]);
        renderInfo.xDataset = [-1]; // Use filename as date
        renderInfo.constValue = [1.0];
        renderInfo.dateFormat = 'YYYY-MM-DD';
        
        // Initialize data structures
        dataMap = new Map();
        xValueMap = new Map();
        xValueMap.set(-1, '2024-12-01'); // Set xValue for the test date
    });

    it('should count non-empty string values', () => {
        const fileCache: MockCachedMetadata = {
            frontmatter: {
                meditation: 'yes'
            }
        };

        const result = collectDataFromFrontmatterExists(
            fileCache as CachedMetadata,
            query,
            renderInfo,
            dataMap,
            xValueMap
        );

        expect(result).toBe(true);
        expect(query.getNumTargets()).toBe(1);
        expect(dataMap.has('2024-12-01')).toBe(true);
    });

    it('should NOT count empty strings', () => {
        const fileCache: MockCachedMetadata = {
            frontmatter: {
                meditation: ''
            }
        };

        const result = collectDataFromFrontmatterExists(
            fileCache as CachedMetadata,
            query,
            renderInfo,
            dataMap,
            xValueMap
        );

        expect(result).toBe(false);
        expect(query.getNumTargets()).toBe(0);
    });

    it('should NOT count whitespace-only strings', () => {
        const fileCache: MockCachedMetadata = {
            frontmatter: {
                meditation: '   '
            }
        };

        const result = collectDataFromFrontmatterExists(
            fileCache as CachedMetadata,
            query,
            renderInfo,
            dataMap,
            xValueMap
        );

        expect(result).toBe(false);
        expect(query.getNumTargets()).toBe(0);
    });

    it('should count non-empty arrays', () => {
        const fileCache: MockCachedMetadata = {
            frontmatter: {
                tags: ['meditation', 'exercise']
            }
        };

        const tagsQuery = new Query(0, SearchType.FrontmatterExists, 'tags');
        const result = collectDataFromFrontmatterExists(
            fileCache as CachedMetadata,
            tagsQuery,
            renderInfo,
            dataMap,
            xValueMap
        );

        expect(result).toBe(true);
        expect(tagsQuery.getNumTargets()).toBe(1);
    });

    it('should NOT count empty arrays', () => {
        const fileCache: MockCachedMetadata = {
            frontmatter: {
                tags: []
            }
        };

        const tagsQuery = new Query(0, SearchType.FrontmatterExists, 'tags');
        const result = collectDataFromFrontmatterExists(
            fileCache as CachedMetadata,
            tagsQuery,
            renderInfo,
            dataMap,
            xValueMap
        );

        expect(result).toBe(false);
        expect(tagsQuery.getNumTargets()).toBe(0);
    });

    it('should count boolean true', () => {
        const fileCache: MockCachedMetadata = {
            frontmatter: {
                completed: true
            }
        };

        const boolQuery = new Query(0, SearchType.FrontmatterExists, 'completed');
        const result = collectDataFromFrontmatterExists(
            fileCache as CachedMetadata,
            boolQuery,
            renderInfo,
            dataMap,
            xValueMap
        );

        expect(result).toBe(true);
        expect(boolQuery.getNumTargets()).toBe(1);
    });

    it('should count boolean false (it exists!)', () => {
        const fileCache: MockCachedMetadata = {
            frontmatter: {
                notDone: false
            }
        };

        const boolQuery = new Query(0, SearchType.FrontmatterExists, 'notDone');
        const result = collectDataFromFrontmatterExists(
            fileCache as CachedMetadata,
            boolQuery,
            renderInfo,
            dataMap,
            xValueMap
        );

        expect(result).toBe(true);
        expect(boolQuery.getNumTargets()).toBe(1);
    });

    it('should count number zero (it exists!)', () => {
        const fileCache: MockCachedMetadata = {
            frontmatter: {
                score: 0
            }
        };

        const numQuery = new Query(0, SearchType.FrontmatterExists, 'score');
        const result = collectDataFromFrontmatterExists(
            fileCache as CachedMetadata,
            numQuery,
            renderInfo,
            dataMap,
            xValueMap
        );

        expect(result).toBe(true);
        expect(numQuery.getNumTargets()).toBe(1);
    });

    it('should NOT count null values', () => {
        const fileCache: MockCachedMetadata = {
            frontmatter: {
                noScore: null
            }
        };

        const nullQuery = new Query(0, SearchType.FrontmatterExists, 'noScore');
        const result = collectDataFromFrontmatterExists(
            fileCache as CachedMetadata,
            nullQuery,
            renderInfo,
            dataMap,
            xValueMap
        );

        expect(result).toBe(false);
        expect(nullQuery.getNumTargets()).toBe(0);
    });

    it('should NOT count undefined/missing fields', () => {
        const fileCache: MockCachedMetadata = {
            frontmatter: {
                otherField: 'value'
            }
        };

        const missingQuery = new Query(0, SearchType.FrontmatterExists, 'meditation');
        const result = collectDataFromFrontmatterExists(
            fileCache as CachedMetadata,
            missingQuery,
            renderInfo,
            dataMap,
            xValueMap
        );

        expect(result).toBe(false);
        expect(missingQuery.getNumTargets()).toBe(0);
    });

    it('should handle missing frontmatter', () => {
        const fileCache: MockCachedMetadata = {
            frontmatter: undefined
        };

        const result = collectDataFromFrontmatterExists(
            fileCache as CachedMetadata,
            query,
            renderInfo,
            dataMap,
            xValueMap
        );

        expect(result).toBe(false);
        expect(query.getNumTargets()).toBe(0);
    });

    it('should handle nested frontmatter fields', () => {
        const fileCache: MockCachedMetadata = {
            frontmatter: {
                nested: {
                    field: 'value'
                }
            }
        };

        const nestedQuery = new Query(0, SearchType.FrontmatterExists, 'nested.field');
        const result = collectDataFromFrontmatterExists(
            fileCache as CachedMetadata,
            nestedQuery,
            renderInfo,
            dataMap,
            xValueMap
        );

        expect(result).toBe(true);
        expect(nestedQuery.getNumTargets()).toBe(1);
    });
});
