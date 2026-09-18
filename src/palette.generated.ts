// GENERATED FILE - do not hand-edit. Run `pnpm generate:palette` (scripts/generate-palette.mjs)
// after changing that script, never this output directly.
//
// 24 hue ranges x 11 lightness steps, OKLCH color space, a shared lightness ladder across
// every range and a shared chroma curve per step (gamut-clamped per hue+lightness when it
// would otherwise fall outside sRGB) - ROADMAP M10 (issue #24).

export type PaletteStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

export type PaletteRange = { hue: number; steps: Record<PaletteStep, string> };

export const slate: PaletteRange = { hue: 257.4, steps: { 50: '#f7faff', 100: '#e6f0ff', 200: '#cae0ff', 300: '#a2c6fb', 400: '#76a5e7', 500: '#4d85d4', 600: '#2f66b3', 700: '#1e4a89', 800: '#113260', 900: '#071d3b', 950: '#020a1a' } };
export const indigo: PaletteRange = { hue: 272.4, steps: { 50: '#f8faff', 100: '#eaefff', 200: '#d3ddff', 300: '#b1c1fc', 400: '#8b9ee8', 500: '#6a7dd5', 600: '#4e5fb4', 700: '#374489', 800: '#242d60', 900: '#131a3b', 950: '#05081b' } };
export const violet: PaletteRange = { hue: 287.4, steps: { 50: '#f9f9ff', 100: '#eeedff', 200: '#dbdaff', 300: '#c0bcf9', 400: '#9f98e4', 500: '#8176d1', 600: '#6558b0', 700: '#4a3f86', 800: '#31295d', 900: '#1c173a', 950: '#0a071a' } };
export const purple: PaletteRange = { hue: 302.4, steps: { 50: '#fbf8ff', 100: '#f3ecff', 200: '#e5d5ff', 300: '#ceb7f2', 400: '#b092dc', 500: '#956fc7', 600: '#7751a7', 700: '#58397f', 800: '#3c2558', 900: '#231436', 950: '#0d0618' } };
export const fuchsia: PaletteRange = { hue: 317.4, steps: { 50: '#fdf7ff', 100: '#f9e9ff', 200: '#efd2f9', 300: '#dbb3e9', 400: '#bf8dd0', 500: '#a568b9', 600: '#864b9a', 700: '#643474', 800: '#452150', 900: '#291231', 950: '#110515' } };
export const pink: PaletteRange = { hue: 332.4, steps: { 50: '#fff7fd', 100: '#ffe7fa', 200: '#f7d0f0', 300: '#e6b0dc', 400: '#cc89c1', 500: '#b363a8', 600: '#934689', 700: '#6e3067', 800: '#4c1e47', 900: '#2e102b', 950: '#130411' } };
export const rose: PaletteRange = { hue: 347.4, steps: { 50: '#fff7fb', 100: '#ffe8f3', 200: '#fdcfe5', 300: '#eeaece', 400: '#d586b0', 500: '#be6094', 600: '#9d4276', 700: '#762d57', 800: '#521c3b', 900: '#320e23', 950: '#15040d' } };
export const red: PaletteRange = { hue: 2.4, steps: { 50: '#fff8f9', 100: '#ffe9ee', 200: '#ffcfdb', 300: '#f4adbf', 400: '#dc859d', 500: '#c55e7e', 600: '#a34061', 700: '#7b2b46', 800: '#561a2f', 900: '#350d1b', 950: '#170309' } };
export const vermilion: PaletteRange = { hue: 17.4, steps: { 50: '#fff8f8', 100: '#ffeaea', 200: '#ffd1d1', 300: '#f6aeb0', 400: '#df868a', 500: '#c95f66', 600: '#a7404a', 700: '#7e2b34', 800: '#581b21', 900: '#360d12', 950: '#180305' } };
export const orange: PaletteRange = { hue: 32.4, steps: { 50: '#fff8f6', 100: '#ffeae6', 200: '#ffd2c8', 300: '#f6b0a1', 400: '#df8977', 500: '#c8624e', 600: '#a74431', 700: '#7e2e1f', 800: '#581d12', 900: '#360f08', 950: '#180402' } };
export const amber: PaletteRange = { hue: 47.4, steps: { 50: '#fff8f5', 100: '#ffebe1', 200: '#ffd3be', 300: '#f3b495', 400: '#db8d65', 500: '#c56834', 600: '#a34a0e', 700: '#7b3300', 800: '#552100', 900: '#351100', 950: '#170500' } };
export const gold: PaletteRange = { hue: 62.4, steps: { 50: '#fff8f3', 100: '#ffecdb', 200: '#fcd6b6', 300: '#ecb88b', 400: '#d49357', 500: '#bd6f14', 600: '#965500', 700: '#6f3e00', 800: '#4d2900', 900: '#2f1600', 950: '#140700' } };
export const yellow: PaletteRange = { hue: 77.4, steps: { 50: '#fff9f0', 100: '#fdedd6', 200: '#f5dab2', 300: '#e3be85', 400: '#c99a4d', 500: '#af7900', 600: '#895e00', 700: '#664400', 800: '#462e00', 900: '#2a1a00', 950: '#110800' } };
export const lime: PaletteRange = { hue: 92.4, steps: { 50: '#fefaec', 100: '#f8efd6', 200: '#ecdeb1', 300: '#d7c384', 400: '#bba14b', 500: '#9f8100', 600: '#7d6500', 700: '#5c4a00', 800: '#3f3100', 900: '#251c00', 950: '#0f0900' } };
export const chartreuse: PaletteRange = { hue: 107.4, steps: { 50: '#fbfbed', 100: '#f1f2d7', 200: '#e2e2b4', 300: '#cac987', 400: '#aaa851', 500: '#8e8900', 600: '#6f6b00', 700: '#514f00', 800: '#373500', 900: '#201f00', 950: '#0c0b00' } };
export const green: PaletteRange = { hue: 122.4, steps: { 50: '#f7fcef', 100: '#ebf4da', 200: '#d7e5b9', 300: '#bacd90', 400: '#97ae5d', 500: '#779124', 600: '#5b7200', 700: '#425400', 800: '#2c3900', 900: '#192100', 950: '#080c00' } };
export const emerald: PaletteRange = { hue: 137.4, steps: { 50: '#f4fdf1', 100: '#e5f5df', 200: '#cce8c1', 300: '#aad29b', 400: '#81b36e', 500: '#5a9741', 600: '#3d7821', 700: '#295910', 800: '#193d06', 900: '#0c2403', 950: '#030e01' } };
export const jade: PaletteRange = { hue: 152.4, steps: { 50: '#f1fef4', 100: '#dff7e4', 200: '#c1eacb', 300: '#9ad5aa', 400: '#6ab781', 500: '#359b5b', 600: '#007c3f', 700: '#005c2d', 800: '#003e1c', 900: '#00250e', 950: '#000e03' } };
export const teal: PaletteRange = { hue: 167.4, steps: { 50: '#effef7', 100: '#daf8eb', 200: '#b8ebd6', 300: '#8cd6b9', 400: '#53b995', 500: '#009c75', 600: '#007a5b', 700: '#005a42', 800: '#003d2c', 900: '#002419', 950: '#000e08' } };
export const cyan: PaletteRange = { hue: 182.4, steps: { 50: '#edfefb', 100: '#d7f8f1', 200: '#b2ece1', 300: '#82d7c9', 400: '#3eb9a9', 500: '#009a8a', 600: '#00786c', 700: '#00594f', 800: '#003c35', 900: '#00241f', 950: '#000e0b' } };
export const sky: PaletteRange = { hue: 197.4, steps: { 50: '#edfefe', 100: '#d5f7f8', 200: '#b0ebec', 300: '#7dd5d7', 400: '#33b8bb', 500: '#00979b', 600: '#007779', 700: '#005759', 800: '#003b3d', 900: '#002324', 950: '#000d0e' } };
export const azure: PaletteRange = { hue: 212.4, steps: { 50: '#f0fcff', 100: '#d6f6fd', 200: '#b0e9f6', 300: '#7fd3e5', 400: '#39b5cb', 500: '#0095aa', 600: '#007586', 700: '#005663', 800: '#003a44', 900: '#002229', 950: '#000d10' } };
export const blue: PaletteRange = { hue: 227.4, steps: { 50: '#f3fbff', 100: '#dcf4ff', 200: '#b5e7fd', 300: '#87d0ef', 400: '#4ab0d9', 500: '#0092bc', 600: '#007294', 700: '#00546e', 800: '#00394b', 900: '#00212e', 950: '#000c14' } };
export const cobalt: PaletteRange = { hue: 242.4, steps: { 50: '#f5fbff', 100: '#e2f2ff', 200: '#c0e3ff', 300: '#93cbf7', 400: '#60abe2', 500: '#228cce', 600: '#006ea8', 700: '#00507d', 800: '#003656', 900: '#002035', 950: '#000b18' } };

export const ranges = { slate, indigo, violet, purple, fuchsia, pink, rose, red, vermilion, orange, amber, gold, yellow, lime, chartreuse, green, emerald, jade, teal, cyan, sky, azure, blue, cobalt } as const satisfies Record<string, PaletteRange>;
