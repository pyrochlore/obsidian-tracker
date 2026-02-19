/**
 * Tests for Issue #324: YYYYMMDD date format parsing in getRenderInfoFromYaml
 * 
 * This test verifies that startDate and endDate are correctly parsed from YAML
 * when dateFormat is YYYYMMDD.
 */

import { getRenderInfoFromYaml } from '../src/parsing';
import { RenderInfo } from '../src/data';
import moment from 'moment';

// Mock Tracker plugin
class MockTracker {
    app: any;
    settings: any;

    constructor() {
        this.app = {
            vault: {
                getAbstractFileByPath: (path: string) => {
                    // Return a mock folder for any path
                    const { TFolder } = require('./mocks/obsidian');
                    return new TFolder(path, path);
                },
                getConfig: (key: string) => {
                    if (key === 'tabSize') return 4;
                    return null;
                }
            }
        };
        this.settings = {
            folder: '/',
            dateFormat: 'YYYY-MM-DD'
        };
    }
}

describe('Issue #324: YYYYMMDD date format parsing', () => {
    let mockPlugin: MockTracker;

    beforeAll(() => {
        if (typeof (global as any).window === 'undefined') {
            (global as any).window = {};
        }
        (global as any).window.moment = moment;
        mockPlugin = new MockTracker();
    });

    it('should parse startDate and endDate with YYYYMMDD format', () => {
        const yamlText = `
searchType: tag
searchTarget: weight
folder: test-issue-324
dateFormat: YYYYMMDD
startDate: 20240201
endDate: 20240203
line:
  title: Test
`.trim();

        const result = getRenderInfoFromYaml(yamlText, mockPlugin as any);
        
        // Log the actual result to see what we're getting
        if (typeof result === 'string') {
            console.log('Error message:', result);
        }
        
        expect(typeof result).toBe('object');
        expect(result).not.toBeInstanceOf(String); // Should not be an error message
        
        const renderInfo = result as RenderInfo;
        
        // Check that dateFormat is set correctly
        expect(renderInfo.dateFormat).toBe('YYYYMMDD');
        
        // Check that startDate and endDate are parsed correctly
        expect(renderInfo.startDate).not.toBeNull();
        expect(renderInfo.startDate?.isValid()).toBe(true);
        expect(renderInfo.startDate?.format('YYYY-MM-DD')).toBe('2024-02-01');
        
        expect(renderInfo.endDate).not.toBeNull();
        expect(renderInfo.endDate?.isValid()).toBe(true);
        expect(renderInfo.endDate?.format('YYYY-MM-DD')).toBe('2024-02-03');
    });

    it('should parse startDate and endDate with YYYY-MM-DD format (baseline)', () => {
        const yamlText = `
searchType: tag
searchTarget: weight
folder: test-issue-324
dateFormat: YYYY-MM-DD
startDate: 2024-02-01
endDate: 2024-02-03
line:
    title: Test
`.trim();

        const result = getRenderInfoFromYaml(yamlText, mockPlugin as any);
        
        expect(typeof result).toBe('object');
        expect(result).not.toBeInstanceOf(String);
        
        const renderInfo = result as RenderInfo;
        
        expect(renderInfo.dateFormat).toBe('YYYY-MM-DD');
        expect(renderInfo.startDate).not.toBeNull();
        expect(renderInfo.startDate?.isValid()).toBe(true);
        expect(renderInfo.startDate?.format('YYYY-MM-DD')).toBe('2024-02-01');
        
        expect(renderInfo.endDate).not.toBeNull();
        expect(renderInfo.endDate?.isValid()).toBe(true);
        expect(renderInfo.endDate?.format('YYYY-MM-DD')).toBe('2024-02-03');
    });

    it('should handle missing startDate and endDate', () => {
        const yamlText = `
searchType: tag
searchTarget: weight
folder: test-issue-324
dateFormat: YYYYMMDD
line:
    title: Test
`.trim();

        const result = getRenderInfoFromYaml(yamlText, mockPlugin as any);
        
        expect(typeof result).toBe('object');
        expect(result).not.toBeInstanceOf(String);
        
        const renderInfo = result as RenderInfo;
        
        expect(renderInfo.dateFormat).toBe('YYYYMMDD');
        expect(renderInfo.startDate).toBeNull();
        expect(renderInfo.endDate).toBeNull();
    });

    it('should return error for invalid startDate format', () => {
        const yamlText = `
searchType: tag
searchTarget: weight
folder: test-issue-324
dateFormat: YYYYMMDD
startDate: invalid-date
endDate: 20240203
line:
    title: Test
`.trim();

        const result = getRenderInfoFromYaml(yamlText, mockPlugin as any);
        
        expect(typeof result).toBe('string'); // Should be an error message
        expect(result).toContain('Invalid startDate');
    });
});
