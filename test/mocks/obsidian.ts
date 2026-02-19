// Mock for Obsidian API
// This provides window.moment which is used throughout the codebase

import moment from 'moment';

// Create a global window object if it doesn't exist
if (typeof (global as any).window === 'undefined') {
    (global as any).window = {};
}

// Mock window.moment with the actual moment library
(global as any).window.moment = moment;

// Export minimal Obsidian types for TypeScript
export class TFile {
    basename: string;
    name: string;
    path: string;
    extension: string;
    stat: any;

    constructor(basename: string, path: string = '') {
        this.basename = basename;
        this.name = basename;
        this.path = path || basename;
        this.extension = '';
        this.stat = {};
    }
}

export class TFolder {
    name: string;
    path: string;

    constructor(name: string, path: string = '') {
        this.name = name;
        this.path = path || name;
    }
}

export function normalizePath(path: string): string {
    return path.replace(/\\/g, '/');
}

export interface CachedMetadata {
    frontmatter?: Record<string, any>;
    tags?: Array<{ tag: string }>;
}

// Simple YAML parser for testing (handles basic key-value pairs and nested objects)
export function parseYaml(yamlText: string): any {
    const result: any = {};
    const lines = yamlText.split('\n');
    const stack: Array<{ obj: any; indent: number }> = [{ obj: result, indent: -1 }];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        // Calculate indentation (spaces before first non-space char)
        const indent = line.length - line.trimStart().length;

        // Pop stack until we find the parent at this indentation level
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
            stack.pop();
        }

        const colonIndex = trimmed.indexOf(':');
        if (colonIndex === -1) continue;

        const key = trimmed.substring(0, colonIndex).trim();
        let value: any = trimmed.substring(colonIndex + 1).trim();

        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        // If value is empty, it's likely a nested object
        const currentObj = stack[stack.length - 1].obj;
        if (value === '') {
            // Create nested object
            currentObj[key] = {};
            stack.push({ obj: currentObj[key], indent: indent });
        } else {
            // Simple key-value pair
            currentObj[key] = value;
        }
    }

    return result;
}
