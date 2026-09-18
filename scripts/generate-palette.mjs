#!/usr/bin/env node
// Generates src/palette.generated.ts: 24 hue ranges x 11 lightness steps, OKLCH color space, a
// shared lightness ladder across every range (step N has the same OKLCH L in all 24 ranges), and
// a shared chroma curve per step, gamut-clamped per hue+lightness combination when converted to
// sRGB hex (pure OKLCH math has no notion of sRGB gamut, so an out-of-gamut request is otherwise
// a silently invalid color).
//
// ROADMAP M10 (issue #24): "24 ranges x 11 steps, generated in OKLCH on a shared lightness
// ladder" (owner-directed, 2026-09-18). Self-contained OKLCH<->linear-sRGB math (Björn Ottosson's
// OKLab, https://bottosson.github.io/posts/oklab/) rather than a new dependency - this repo's own
// pattern of adding a dependency only after real evaluation (see Chart.js->ECharts's 5-library
// comparison) applies here too, and the conversion is ~30 lines, well short of justifying a whole
// color-science package.
//
// Output is committed, generated source (mirrors docs-site/scripts/build-examples.mjs's own
// generated-output pattern) - re-run with `pnpm generate:palette` after editing this file, never
// hand-edit src/palette.generated.ts directly.

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(new URL('.', import.meta.url)));

// --- OKLCH -> linear sRGB (Björn Ottosson's OKLab matrices) ---
function oklchToLinearSrgb(L, C, hueDeg) {
  const h = (hueDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

function inGamut([r, g, b]) {
  const eps = 1e-4;
  return r >= -eps && r <= 1 + eps && g >= -eps && g <= 1 + eps && b >= -eps && b <= 1 + eps;
}

function gammaEncode(c) {
  const clamped = Math.min(1, Math.max(0, c));
  return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
}

function toHex([r, g, b]) {
  const to255 = (c) => Math.round(gammaEncode(c) * 255).toString(16).padStart(2, '0');
  return `#${to255(r)}${to255(g)}${to255(b)}`;
}

// Reduces chroma via binary search until the color lands in the sRGB gamut, keeping L and H
// fixed (the standard "chroma reduction" gamut-mapping strategy). Preserves the shared lightness
// ladder's truth across every hue and each range's own hue identity, at the cost of saturation
// for hue/lightness combinations that can't reach the requested chroma in sRGB (e.g. very light
// or very dark blues have a lower max in-gamut chroma than similarly-light/dark yellows).
export function oklchToHex(L, C, hueDeg) {
  const direct = oklchToLinearSrgb(L, C, hueDeg);
  if (inGamut(direct)) return toHex(direct);
  let lo = 0;
  let hi = C;
  let best = oklchToLinearSrgb(L, 0, hueDeg);
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const rgb = oklchToLinearSrgb(L, mid, hueDeg);
    if (inGamut(rgb)) {
      lo = mid;
      best = rgb;
    } else {
      hi = mid;
    }
  }
  return toHex(best);
}

// --- Shared lightness + chroma ladders (11 steps, same values reused across all 24 ranges) ---
export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
export const LIGHTNESS = [0.984, 0.953, 0.9, 0.82, 0.715, 0.615, 0.515, 0.415, 0.32, 0.232, 0.145];
// Rises to a mid-tone peak, falls toward the extremes - a color can carry more saturation in its
// mid-tones than near white/black before clipping. The actual per-swatch chroma is this value
// UNLESS the hue/lightness combination can't reach it in sRGB, in which case oklchToHex reduces
// it just enough to stay in gamut (see above).
export const CHROMA = [0.018, 0.035, 0.06, 0.085, 0.11, 0.135, 0.135, 0.115, 0.09, 0.065, 0.04];

// --- 24 hue ranges, 15deg apart, anchored at the existing neutral scale's own OKLCH hue so it's
// a genuine member of this system rather than an orphaned, differently-generated scale.
export const ANCHOR_HUE = 257.4; // lightPalette.textTertiary, #64748b's own OKLCH hue (computed, not eyeballed)
export const RANGE_NAMES = [
  'slate', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'red',
  'vermilion', 'orange', 'amber', 'gold', 'yellow', 'lime', 'chartreuse', 'green',
  'emerald', 'jade', 'teal', 'cyan', 'sky', 'azure', 'blue', 'cobalt',
];

export function generatePalette() {
  const ranges = {};
  RANGE_NAMES.forEach((name, rangeIndex) => {
    const hue = (ANCHOR_HUE + rangeIndex * 15) % 360;
    const steps = {};
    STEPS.forEach((step, stepIndex) => {
      steps[step] = oklchToHex(LIGHTNESS[stepIndex], CHROMA[stepIndex], hue);
    });
    ranges[name] = { hue, steps };
  });
  return ranges;
}

function toSource(ranges) {
  const lines = [
    '// GENERATED FILE - do not hand-edit. Run `pnpm generate:palette` (scripts/generate-palette.mjs)',
    '// after changing that script, never this output directly.',
    '//',
    '// 24 hue ranges x 11 lightness steps, OKLCH color space, a shared lightness ladder across',
    '// every range and a shared chroma curve per step (gamut-clamped per hue+lightness when it',
    '// would otherwise fall outside sRGB) - ROADMAP M10 (issue #24).',
    '',
    'export type PaletteStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;',
    '',
    'export type PaletteRange = { hue: number; steps: Record<PaletteStep, string> };',
    '',
  ];
  for (const [name, range] of Object.entries(ranges)) {
    const stepsSource = STEPS.map((step) => `${step}: '${range.steps[step]}'`).join(', ');
    lines.push(`export const ${name}: PaletteRange = { hue: ${range.hue.toFixed(1)}, steps: { ${stepsSource} } };`);
  }
  lines.push('');
  lines.push(`export const ranges = { ${RANGE_NAMES.join(', ')} } as const satisfies Record<string, PaletteRange>;`);
  lines.push('');
  return lines.join('\n');
}

const outputPath = path.join(repoRoot, 'src/palette.generated.ts');
writeFileSync(outputPath, toSource(generatePalette()));
console.log(`Wrote ${outputPath} (${RANGE_NAMES.length} ranges x ${STEPS.length} steps = ${RANGE_NAMES.length * STEPS.length} colors).`);
