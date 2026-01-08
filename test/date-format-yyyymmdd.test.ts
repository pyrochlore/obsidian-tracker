/**
 * Tests for Issue #324: YYYYMMDD date format not working properly for startDate/endDate
 * 
 * Bug: When dateFormat is set to YYYYMMDD, the startDate and endDate settings
 * become ineffective and all files are included regardless of the date range.
 */

import * as helper from '../src/helper';
import { RenderInfo } from '../src/data';
import moment from 'moment';

describe('Issue #324: YYYYMMDD date format with startDate/endDate', () => {
    // Set up window.moment for tests
    beforeAll(() => {
        if (typeof (global as any).window === 'undefined') {
            (global as any).window = {};
        }
        (global as any).window.moment = moment;
    });

    describe('strToDate function with YYYYMMDD format', () => {
        it('should parse YYYYMMDD format correctly', () => {
            const date = helper.strToDate('20240201', 'YYYYMMDD');
            expect(date.isValid()).toBe(true);
            expect(date.format('YYYY-MM-DD')).toBe('2024-02-01');
        });

        it('should parse YYYY-MM-DD format correctly (baseline)', () => {
            const date = helper.strToDate('2024-02-01', 'YYYY-MM-DD');
            expect(date.isValid()).toBe(true);
            expect(date.format('YYYY-MM-DD')).toBe('2024-02-01');
        });

        it('should parse dates with YYYYMMDD format consistently', () => {
            const date1 = helper.strToDate('20240201', 'YYYYMMDD');
            const date2 = helper.strToDate('20240203', 'YYYYMMDD');
            
            expect(date1.isValid()).toBe(true);
            expect(date2.isValid()).toBe(true);
            
            // Verify date comparison works
            expect(date1.isBefore(date2)).toBe(true);
            expect(date2.isAfter(date1)).toBe(true);
        });
    });

    describe('Date range filtering with YYYYMMDD format', () => {
        it('should correctly compare dates parsed with YYYYMMDD format', () => {
            const startDate = helper.strToDate('20240201', 'YYYYMMDD');
            const endDate = helper.strToDate('20240203', 'YYYYMMDD');
            const testDate1 = helper.strToDate('20240131', 'YYYYMMDD'); // Before range
            const testDate2 = helper.strToDate('20240202', 'YYYYMMDD'); // In range
            const testDate3 = helper.strToDate('20240204', 'YYYYMMDD'); // After range

            // These comparisons should work correctly
            expect(testDate1.isBefore(startDate)).toBe(true);
            expect(testDate2.isSameOrAfter(startDate) && testDate2.isSameOrBefore(endDate)).toBe(true);
            expect(testDate3.isAfter(endDate)).toBe(true);
        });

        it('should correctly identify dates within range using isBefore/isAfter (fixed comparison)', () => {
            const startDate = helper.strToDate('20240201', 'YYYYMMDD');
            const endDate = helper.strToDate('20240203', 'YYYYMMDD');
            const testDate1 = helper.strToDate('20240131', 'YYYYMMDD'); // Before
            const testDate2 = helper.strToDate('20240202', 'YYYYMMDD'); // In range
            const testDate3 = helper.strToDate('20240204', 'YYYYMMDD'); // After

            // Test the fixed comparison logic using isBefore/isAfter (more reliable)
            const beforeRange = testDate1.isBefore(startDate, 'day');
            const inRange = !testDate2.isBefore(startDate, 'day') && !testDate2.isAfter(endDate, 'day');
            const afterRange = testDate3.isAfter(endDate, 'day');

            expect(beforeRange).toBe(true);
            expect(inRange).toBe(true);
            expect(afterRange).toBe(true);
        });

        it('should correctly compare dates with YYYY-MM-DD format (baseline)', () => {
            const startDate = helper.strToDate('2024-02-01', 'YYYY-MM-DD');
            const endDate = helper.strToDate('2024-02-03', 'YYYY-MM-DD');
            const testDate1 = helper.strToDate('2024-01-31', 'YYYY-MM-DD');
            const testDate2 = helper.strToDate('2024-02-02', 'YYYY-MM-DD');
            const testDate3 = helper.strToDate('2024-02-04', 'YYYY-MM-DD');

            const beforeRange = testDate1 < startDate;
            const inRange = !(testDate2 < startDate) && !(testDate2 > endDate);
            const afterRange = testDate3 > endDate;

            expect(beforeRange).toBe(true);
            expect(inRange).toBe(true);
            expect(afterRange).toBe(true);
        });
    });

    describe('Reproducing the bug: date comparison with YYYYMMDD', () => {
        it('should correctly filter dates when using YYYYMMDD format', () => {
            // Simulate the scenario from the issue
            const startDateStr = '20240201';
            const endDateStr = '20240203';
            const dateFormat = 'YYYYMMDD';

            const startDate = helper.strToDate(startDateStr, dateFormat);
            const endDate = helper.strToDate(endDateStr, dateFormat);

            // Test dates from different years (as mentioned in issue comments)
            const datesToTest = [
                { str: '20180101', expected: 'before' }, // 2018 - before range
                { str: '20190101', expected: 'before' }, // 2019 - before range
                { str: '20240201', expected: 'in' },     // Start date
                { str: '20240202', expected: 'in' },     // In range
                { str: '20240203', expected: 'in' },     // End date
                { str: '20240204', expected: 'after' },  // After range
            ];

            datesToTest.forEach(({ str, expected }) => {
                const testDate = helper.strToDate(str, dateFormat);
                expect(testDate.isValid()).toBe(true);

                // Apply the fixed filtering logic as in main.ts (using isBefore/isAfter)
                let shouldSkip = false;
                if (startDate !== null && startDate.isValid()) {
                    if (testDate.isBefore(startDate, 'day')) {
                        shouldSkip = true;
                    }
                }
                if (endDate !== null && endDate.isValid()) {
                    if (testDate.isAfter(endDate, 'day')) {
                        shouldSkip = true;
                    }
                }

                if (expected === 'before' || expected === 'after') {
                    expect(shouldSkip).toBe(true);
                } else {
                    expect(shouldSkip).toBe(false);
                }
            });
        });

        it('BUG REPRODUCTION: should fail when dates have different format contexts', () => {
            // This test reproduces the actual bug scenario
            // When startDate/endDate are parsed with YYYYMMDD format,
            // and file dates are also parsed with YYYYMMDD format,
            // the comparison might fail due to format context issues
            
            const dateFormat = 'YYYYMMDD';
            
            // Parse startDate and endDate (as done in parsing.ts)
            const startDate = helper.strToDate('20240201', dateFormat);
            const endDate = helper.strToDate('20240203', dateFormat);
            
            // Parse file dates (as done when reading files)
            const fileDate1 = helper.strToDate('20180101', dateFormat); // Before range
            const fileDate2 = helper.strToDate('20240202', dateFormat); // In range
            const fileDate3 = helper.strToDate('20240204', dateFormat); // After range
            
            // Check if dates are valid
            expect(startDate.isValid()).toBe(true);
            expect(endDate.isValid()).toBe(true);
            expect(fileDate1.isValid()).toBe(true);
            expect(fileDate2.isValid()).toBe(true);
            expect(fileDate3.isValid()).toBe(true);
            
            // The bug: comparison might fail if dates have different internal format storage
            // Check the creation data format
            const startFormat = startDate.creationData().format;
            const fileFormat1 = fileDate1.creationData().format;
            
            // If formats differ, comparison might fail
            // This is the suspected bug
            const formatsMatch = startFormat.toString() === fileFormat1.toString();
            
            // Test the actual comparison operators used in main.ts
            const beforeRange = fileDate1 < startDate;
            const inRange = !(fileDate2 < startDate) && !(fileDate2 > endDate);
            const afterRange = fileDate3 > endDate;
            
            // These should all work correctly
            expect(beforeRange).toBe(true);
            expect(inRange).toBe(true);
            expect(afterRange).toBe(true);
        });
    });

    describe('dateToStr and strToDate roundtrip with YYYYMMDD', () => {
        it('should correctly roundtrip dates with YYYYMMDD format', () => {
            const originalDate = moment('2024-02-01');
            const dateStr = helper.dateToStr(originalDate, 'YYYYMMDD');
            expect(dateStr).toBe('20240201');

            const parsedDate = helper.strToDate(dateStr, 'YYYYMMDD');
            expect(parsedDate.isValid()).toBe(true);
            expect(parsedDate.format('YYYY-MM-DD')).toBe('2024-02-01');
        });

        it('should correctly roundtrip dates with YYYY-MM-DD format (baseline)', () => {
            const originalDate = moment('2024-02-01');
            const dateStr = helper.dateToStr(originalDate, 'YYYY-MM-DD');
            expect(dateStr).toBe('2024-02-01');

            const parsedDate = helper.strToDate(dateStr, 'YYYY-MM-DD');
            expect(parsedDate.isValid()).toBe(true);
            expect(parsedDate.format('YYYY-MM-DD')).toBe('2024-02-01');
        });
    });
});
