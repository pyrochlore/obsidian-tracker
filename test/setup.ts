// Jest setup file
// This runs before each test file

// Ensure window.moment is available globally
import moment from 'moment';

if (typeof (global as any).window === 'undefined') {
    (global as any).window = {};
}

(global as any).window.moment = moment;
