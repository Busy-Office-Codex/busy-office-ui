export type PaletteStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type PaletteRange = { hue: number; steps: Record<PaletteStep, string> };

export declare const STEPS: readonly PaletteStep[];
export declare const LIGHTNESS: readonly number[];
export declare const CHROMA: readonly number[];
export declare const ANCHOR_HUE: number;
export declare const RANGE_NAMES: readonly string[];

export declare function oklchToHex(L: number, C: number, hueDeg: number): string;
export declare function generatePalette(): Record<string, PaletteRange>;
