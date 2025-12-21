/**
 * Mock Obsidian API for testing
 */

// Mock CachedMetadata type
export interface CachedMetadata {
    frontmatter?: Record<string, any>;
    tags?: Array<{ tag: string; position?: any }>;
    headings?: Array<any>;
    sections?: Array<any>;
    links?: Array<any>;
    embeds?: Array<any>;
    blocks?: Record<string, any>;
    listItems?: Array<any>;
}

// Mock other Obsidian types as needed
export type TFile = any;
export type TFolder = any;
export type App = any;
export type Plugin = any;
export type MarkdownPostProcessorContext = any;
export type MarkdownView = any;
export type Editor = any;

// Mock normalizePath
export function normalizePath(path: string): string {
    return path.replace(/\\/g, '/');
}

// Mock parseYaml (we'll use a real YAML parser in tests)
export function parseYaml(yaml: string): any {
    // For testing, we'll use a simple mock or real parser
    // In actual tests, we might want to use js-yaml
    try {
        // Simple mock - in real tests you'd use a YAML parser
        return {};
    } catch (e) {
        return null;
    }
}
