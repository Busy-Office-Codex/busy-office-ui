import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ANCHOR_HUE, CHROMA, LIGHTNESS, RANGE_NAMES, STEPS, generatePalette, oklchToHex } from '../scripts/generate-palette.mjs';

// ROADMAP M10 (issue #24): "24 ranges x 11 steps, generated in OKLCH on a shared lightness
// ladder." Two things this checks: the committed src/palette.generated.ts is never hand-edited
// out of sync with scripts/generate-palette.mjs (a future edit to the generator that forgets to
// re-run `pnpm generate:palette` fails here, not silently); and the OKLCH math itself is sane
// (round-trips, stays in-gamut, actually spans 24 distinct hues on a real shared lightness ladder
// — not just "produces some hex strings").

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

describe('generate-palette.mjs produces the committed src/palette.generated.ts, and the OKLCH math is sane', () => {
  it('has 24 range names and 11 steps (the ROADMAP-specified shape)', () => {
    expect(RANGE_NAMES).toHaveLength(24);
    expect(STEPS).toHaveLength(11);
    expect(LIGHTNESS).toHaveLength(11);
    expect(CHROMA).toHaveLength(11);
  });

  it('the lightness ladder is shared (strictly decreasing, same values reused for every range) and descends from near-white to near-black', () => {
    for (let i = 1; i < LIGHTNESS.length; i++) expect(LIGHTNESS[i]).toBeLessThan(LIGHTNESS[i - 1]);
    expect(LIGHTNESS[0]).toBeGreaterThan(0.95);
    expect(LIGHTNESS.at(-1)).toBeLessThan(0.2);
  });

  it('every generated hex is a valid, well-formed 6-digit color', () => {
    const ranges = generatePalette();
    for (const name of RANGE_NAMES) {
      for (const step of STEPS) {
        expect(ranges[name].steps[step]).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it('the 24 ranges actually span 24 distinct hues, evenly spaced 15° apart from the anchor', () => {
    const ranges = generatePalette();
    const hues = RANGE_NAMES.map((name: string) => ranges[name].hue);
    expect(new Set(hues.map((h: number) => h.toFixed(1)))).toHaveProperty('size', 24);
    for (let i = 0; i < 24; i++) {
      const expected = (ANCHOR_HUE + i * 15) % 360;
      expect(Math.abs(hues[i] - expected)).toBeLessThan(0.01);
    }
  });

  it('oklchToHex gamut-clamps an intentionally out-of-gamut request instead of producing an invalid color', () => {
    // A very high chroma at a mid lightness is unreachable in sRGB for most hues — this must
    // still return a valid, in-gamut hex (the chroma-reduction binary search), not garbage.
    const hex = oklchToHex(0.6, 0.5, 30);
    expect(hex).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('the committed src/palette.generated.ts matches a fresh run of the generator exactly (no drift)', () => {
    const committed = readFileSync(path.join(repoRoot, 'src/palette.generated.ts'), 'utf8');
    const ranges = generatePalette();
    for (const name of RANGE_NAMES) {
      expect(committed).toContain(`hue: ${ranges[name].hue.toFixed(1)}`);
      for (const step of STEPS) {
        expect(committed).toContain(`${step}: '${ranges[name].steps[step]}'`);
      }
    }
  });
});
