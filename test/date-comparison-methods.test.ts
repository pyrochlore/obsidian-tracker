/**
 * Test to compare different date comparison methods
 * 
 * Question: Is valueOf() the best method, or should we use isBefore/isAfter?
 */

import * as helper from '../src/helper';
import moment from 'moment';

describe('Date Comparison Methods', () => {
    beforeAll(() => {
        if (typeof (global as any).window === 'undefined') {
            (global as any).window = {};
        }
        (global as any).window.moment = moment;
    });

    describe('valueOf() vs isBefore/isAfter', () => {
        it('should produce same results with valueOf() and isBefore/isAfter', () => {
            const startDate = helper.strToDate('20240201', 'YYYYMMDD');
            const endDate = helper.strToDate('20240203', 'YYYYMMDD');
            const testDate = helper.strToDate('20240202', 'YYYYMMDD');

            // Method 1: valueOf() (current implementation)
            const inRangeValueOf = 
                testDate.valueOf() >= startDate.valueOf() && 
                testDate.valueOf() <= endDate.valueOf();

            // Method 2: isBefore/isAfter with 'day' granularity
            const inRangeMoment = 
                !testDate.isBefore(startDate, 'day') && 
                !testDate.isAfter(endDate, 'day');

            // Method 3: isSameOrAfter/isSameOrBefore
            const inRangeSame = 
                testDate.isSameOrAfter(startDate, 'day') && 
                testDate.isSameOrBefore(endDate, 'day');

            expect(inRangeValueOf).toBe(true);
            expect(inRangeMoment).toBe(true);
            expect(inRangeSame).toBe(true);
        });

        it('should handle boundary dates correctly with both methods', () => {
            const startDate = helper.strToDate('20240201', 'YYYYMMDD');
            const endDate = helper.strToDate('20240203', 'YYYYMMDD');

            // Test start date boundary
            const onStartDate = helper.strToDate('20240201', 'YYYYMMDD');
            expect(onStartDate.valueOf() >= startDate.valueOf()).toBe(true);
            expect(!onStartDate.isBefore(startDate, 'day')).toBe(true);
            expect(onStartDate.isSameOrAfter(startDate, 'day')).toBe(true);

            // Test end date boundary
            const onEndDate = helper.strToDate('20240203', 'YYYYMMDD');
            expect(onEndDate.valueOf() <= endDate.valueOf()).toBe(true);
            expect(!onEndDate.isAfter(endDate, 'day')).toBe(true);
            expect(onEndDate.isSameOrBefore(endDate, 'day')).toBe(true);
        });

        it('should handle dates normalized to start of day', () => {
            // strToDate normalizes to startOf('day'), so all dates should be at midnight
            const date1 = helper.strToDate('20240201', 'YYYYMMDD');
            const date2 = helper.strToDate('20240201', 'YYYYMMDD');

            // Both should be at midnight (00:00:00)
            expect(date1.hours()).toBe(0);
            expect(date1.minutes()).toBe(0);
            expect(date1.seconds()).toBe(0);
            expect(date1.valueOf()).toBe(date2.valueOf());
        });
    });

    describe('Performance and clarity', () => {
        it('should note that isBefore/isAfter is more explicit about day granularity', () => {
            // isBefore/isAfter with 'day' is more explicit about what we're comparing
            // valueOf() works but is less clear about granularity
            const date1 = helper.strToDate('20240201', 'YYYYMMDD');
            const date2 = helper.strToDate('20240201', 'YYYYMMDD');

            // Both methods work, but isBefore with 'day' is more explicit
            expect(date1.isBefore(date2, 'day')).toBe(false);
            expect(date1.valueOf() < date2.valueOf()).toBe(false);
        });
    });
});
