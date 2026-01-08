/**
 * Edge case tests for date filtering
 * 
 * Tests various edge cases that might not be covered by the main test cases
 */

import { getRenderInfoFromYaml } from '../src/parsing';
import { getDateFromFilename } from '../src/collecting';
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

describe('Edge Cases: Date Filtering', () => {
    let mockPlugin: MockTracker;

    beforeAll(() => {
        if (typeof (global as any).window === 'undefined') {
            (global as any).window = {};
        }
        (global as any).window.moment = moment;
        mockPlugin = new MockTracker();
    });

    describe('Boundary conditions', () => {
        it('should include files with dates exactly equal to startDate', () => {
            const yamlText = `
searchType: tag
searchTarget: weight
folder: test
dateFormat: YYYYMMDD
startDate: 20240201
endDate: 20240203
line:
  title: Test
`.trim();

            const renderInfo = getRenderInfoFromYaml(yamlText, mockPlugin as any);
            if (typeof renderInfo === 'string') {
                fail(`Parsing failed: ${renderInfo}`);
                return;
            }

            const file = { basename: '20240201', name: '20240201.md', path: 'test/20240201.md' };
            const fileDate = getDateFromFilename(file as any, renderInfo);

            const startDate = renderInfo.startDate!;
            const endDate = renderInfo.endDate!;

            // File date equals startDate - should be included
            expect(fileDate.valueOf() >= startDate.valueOf()).toBe(true);
            expect(fileDate.valueOf() <= endDate.valueOf()).toBe(true);
        });

        it('should include files with dates exactly equal to endDate', () => {
            const yamlText = `
searchType: tag
searchTarget: weight
folder: test
dateFormat: YYYYMMDD
startDate: 20240201
endDate: 20240203
line:
  title: Test
`.trim();

            const renderInfo = getRenderInfoFromYaml(yamlText, mockPlugin as any);
            if (typeof renderInfo === 'string') {
                fail(`Parsing failed: ${renderInfo}`);
                return;
            }

            const file = { basename: '20240203', name: '20240203.md', path: 'test/20240203.md' };
            const fileDate = getDateFromFilename(file as any, renderInfo);

            const startDate = renderInfo.startDate!;
            const endDate = renderInfo.endDate!;

            // File date equals endDate - should be included
            expect(fileDate.valueOf() >= startDate.valueOf()).toBe(true);
            expect(fileDate.valueOf() <= endDate.valueOf()).toBe(true);
        });

        it('should exclude files with dates exactly one day before startDate', () => {
            const yamlText = `
searchType: tag
searchTarget: weight
folder: test
dateFormat: YYYYMMDD
startDate: 20240201
endDate: 20240203
line:
  title: Test
`.trim();

            const renderInfo = getRenderInfoFromYaml(yamlText, mockPlugin as any);
            if (typeof renderInfo === 'string') {
                fail(`Parsing failed: ${renderInfo}`);
                return;
            }

            const file = { basename: '20240131', name: '20240131.md', path: 'test/20240131.md' };
            const fileDate = getDateFromFilename(file as any, renderInfo);

            const startDate = renderInfo.startDate!;

            // File date is before startDate - should be excluded
            expect(fileDate.valueOf() < startDate.valueOf()).toBe(true);
        });

        it('should exclude files with dates exactly one day after endDate', () => {
            const yamlText = `
searchType: tag
searchTarget: weight
folder: test
dateFormat: YYYYMMDD
startDate: 20240201
endDate: 20240203
line:
  title: Test
`.trim();

            const renderInfo = getRenderInfoFromYaml(yamlText, mockPlugin as any);
            if (typeof renderInfo === 'string') {
                fail(`Parsing failed: ${renderInfo}`);
                return;
            }

            const file = { basename: '20240204', name: '20240204.md', path: 'test/20240204.md' };
            const fileDate = getDateFromFilename(file as any, renderInfo);

            const endDate = renderInfo.endDate!;

            // File date is after endDate - should be excluded
            expect(fileDate.valueOf() > endDate.valueOf()).toBe(true);
        });
    });

    describe('Missing date boundaries', () => {
        it('should include all files when startDate is missing', () => {
            const yamlText = `
searchType: tag
searchTarget: weight
folder: test
dateFormat: YYYYMMDD
endDate: 20240203
line:
  title: Test
`.trim();

            const renderInfo = getRenderInfoFromYaml(yamlText, mockPlugin as any);
            if (typeof renderInfo === 'string') {
                fail(`Parsing failed: ${renderInfo}`);
                return;
            }

            expect(renderInfo.startDate).toBeNull();
            expect(renderInfo.endDate).not.toBeNull();

            // Files before endDate should be included
            const file = { basename: '20240101', name: '20240101.md', path: 'test/20240101.md' };
            const fileDate = getDateFromFilename(file as any, renderInfo);
            const endDate = renderInfo.endDate!;

            expect(fileDate.valueOf() <= endDate.valueOf()).toBe(true);
        });

        it('should include all files when endDate is missing', () => {
            const yamlText = `
searchType: tag
searchTarget: weight
folder: test
dateFormat: YYYYMMDD
startDate: 20240201
line:
  title: Test
`.trim();

            const renderInfo = getRenderInfoFromYaml(yamlText, mockPlugin as any);
            if (typeof renderInfo === 'string') {
                fail(`Parsing failed: ${renderInfo}`);
                return;
            }

            expect(renderInfo.startDate).not.toBeNull();
            expect(renderInfo.endDate).toBeNull();

            // Files after startDate should be included
            const file = { basename: '20241231', name: '20241231.md', path: 'test/20241231.md' };
            const fileDate = getDateFromFilename(file as any, renderInfo);
            const startDate = renderInfo.startDate!;

            expect(fileDate.valueOf() >= startDate.valueOf()).toBe(true);
        });

        it('should include all files when both startDate and endDate are missing', () => {
            const yamlText = `
searchType: tag
searchTarget: weight
folder: test
dateFormat: YYYYMMDD
line:
  title: Test
`.trim();

            const renderInfo = getRenderInfoFromYaml(yamlText, mockPlugin as any);
            if (typeof renderInfo === 'string') {
                fail(`Parsing failed: ${renderInfo}`);
                return;
            }

            expect(renderInfo.startDate).toBeNull();
            expect(renderInfo.endDate).toBeNull();

            // Any file should be processable
            const file = { basename: '20240101', name: '20240101.md', path: 'test/20240101.md' };
            const fileDate = getDateFromFilename(file as any, renderInfo);

            expect(fileDate.isValid()).toBe(true);
        });
    });

    describe('Year/month boundaries', () => {
        it('should handle dates at year boundary correctly', () => {
            const yamlText = `
searchType: tag
searchTarget: weight
folder: test
dateFormat: YYYYMMDD
startDate: 20231231
endDate: 20240102
line:
  title: Test
`.trim();

            const renderInfo = getRenderInfoFromYaml(yamlText, mockPlugin as any);
            if (typeof renderInfo === 'string') {
                fail(`Parsing failed: ${renderInfo}`);
                return;
            }

            const files = [
                { basename: '20231230', expected: 'excluded' }, // Before
                { basename: '20231231', expected: 'included' }, // Start
                { basename: '20240101', expected: 'included' }, // Year boundary
                { basename: '20240102', expected: 'included' }, // End
                { basename: '20240103', expected: 'excluded' }, // After
            ];

            const startDate = renderInfo.startDate!;
            const endDate = renderInfo.endDate!;

            for (const { basename, expected } of files) {
                const file = { basename, name: `${basename}.md`, path: `test/${basename}.md` };
                const fileDate = getDateFromFilename(file as any, renderInfo);

                const inRange = 
                    fileDate.valueOf() >= startDate.valueOf() && 
                    fileDate.valueOf() <= endDate.valueOf();

                if (expected === 'included') {
                    expect(inRange).toBe(true);
                } else {
                    expect(inRange).toBe(false);
                }
            }
        });

        it('should handle dates at month boundary correctly', () => {
            const yamlText = `
searchType: tag
searchTarget: weight
folder: test
dateFormat: YYYYMMDD
startDate: 20240131
endDate: 20240202
line:
  title: Test
`.trim();

            const renderInfo = getRenderInfoFromYaml(yamlText, mockPlugin as any);
            if (typeof renderInfo === 'string') {
                fail(`Parsing failed: ${renderInfo}`);
                return;
            }

            const files = [
                { basename: '20240130', expected: 'excluded' }, // Before
                { basename: '20240131', expected: 'included' }, // Start (last day of Jan)
                { basename: '20240201', expected: 'included' }, // Month boundary
                { basename: '20240202', expected: 'included' }, // End
                { basename: '20240203', expected: 'excluded' }, // After
            ];

            const startDate = renderInfo.startDate!;
            const endDate = renderInfo.endDate!;

            for (const { basename, expected } of files) {
                const file = { basename, name: `${basename}.md`, path: `test/${basename}.md` };
                const fileDate = getDateFromFilename(file as any, renderInfo);

                const inRange = 
                    fileDate.valueOf() >= startDate.valueOf() && 
                    fileDate.valueOf() <= endDate.valueOf();

                if (expected === 'included') {
                    expect(inRange).toBe(true);
                } else {
                    expect(inRange).toBe(false);
                }
            }
        });
    });

    describe('Invalid date handling', () => {
        it('should handle files with invalid date formats gracefully', () => {
            const yamlText = `
searchType: tag
searchTarget: weight
folder: test
dateFormat: YYYYMMDD
startDate: 20240201
endDate: 20240203
line:
  title: Test
`.trim();

            const renderInfo = getRenderInfoFromYaml(yamlText, mockPlugin as any);
            if (typeof renderInfo === 'string') {
                fail(`Parsing failed: ${renderInfo}`);
                return;
            }

            // File with invalid date format
            const file = { basename: 'invalid-date', name: 'invalid-date.md', path: 'test/invalid-date.md' };
            const fileDate = getDateFromFilename(file as any, renderInfo);

            // Invalid dates should be marked as invalid
            expect(fileDate.isValid()).toBe(false);
        });
    });
});
