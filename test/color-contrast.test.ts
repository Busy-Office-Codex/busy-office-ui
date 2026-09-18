import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// ROADMAP item 19 (real dark/light/system theming, issue #19, `agreed`, project owner,
// 2026-09-16): "AA-contrast-verified for the dark palette the same way items 5/12/13 already did
// for light." Items 5/12/13's own contrast fixes (see test/browser/palette-contrast.spec.ts,
// test/browser/table-header-contrast.spec.ts) document their WCAG math in a comment and then
// assert the *rendered* CSS value changed — this test instead computes the real relative-
// luminance/contrast-ratio formula in code and asserts the numeric result, for both palettes, so
// a future edit to either one that breaks AA fails a real running check instead of only breaking
// an eyeballed comment.
//
// Reads `tokens.stylex.ts`'s source as text (the same technique test/shell-token-audit.test.ts
// already uses) rather than importing the module: `stylex.defineVars`/`createTheme` are meant to
// be compiled by the StyleX bundler plugin (wired into build.mjs, not into vitest), so importing
// this file directly under vitest would run their plain-JS fallback instead of a real build —
// reading the source text sidesteps that entirely and is exactly what this repo's own existing
// token-audit test already does for the same reason.

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const tokensSource = readFileSync(path.join(repoRoot, 'src/tokens.stylex.ts'), 'utf8');

function parsePalette(exportName: 'lightPalette' | 'darkPalette'): Record<string, string> {
  const match = tokensSource.match(new RegExp(`export const ${exportName} = \\{([\\s\\S]*?)\\n\\};`));
  if (!match) {
    throw new Error(`Could not find "export const ${exportName} = {...};" in tokens.stylex.ts — has it moved or been renamed?`);
  }
  const palette: Record<string, string> = {};
  for (const [, key, hex] of match[1].matchAll(/(\w+):\s*'(#[0-9a-fA-F]{3,8})'/g)) {
    palette[key] = hex;
  }
  return palette;
}

// WCAG 2.x relative luminance / contrast ratio formulas (the same ones
// test/browser/table-header-contrast.spec.ts's own comment works through by hand).
function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

const AA_BODY_TEXT = 4.5;
const AA_UI_COMPONENT = 3;

const lightPalette = parsePalette('lightPalette');
const darkPalette = parsePalette('darkPalette');

describe('both color palettes have real hex values to check (guards against a silently empty parse)', () => {
  it('parsed at least the 18 named color vars from each palette', () => {
    expect(Object.keys(lightPalette).length).toBeGreaterThanOrEqual(18);
    expect(Object.keys(darkPalette).length).toBeGreaterThanOrEqual(18);
  });
});

describe.each([
  ['light', lightPalette],
  ['dark', darkPalette],
] as const)('%s palette clears WCAG AA', (name, palette) => {
  it('textPrimary on bgCanvas clears 4.5:1 (body text)', () => {
    expect(contrastRatio(palette.textPrimary, palette.bgCanvas)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  it('textPrimary on bgSurface clears 4.5:1 (body text)', () => {
    expect(contrastRatio(palette.textPrimary, palette.bgSurface)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  it('textSecondary on bgCanvas clears 4.5:1 (body text)', () => {
    expect(contrastRatio(palette.textSecondary, palette.bgCanvas)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  it('textSecondary on bgSurface clears 4.5:1 (body text)', () => {
    expect(contrastRatio(palette.textSecondary, palette.bgSurface)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  // `bgSelected` (token-standardization sweep, 2026-09-17): the selected-row background every
  // list-plus-detail-in-one-route screen uses. Same body-text pairs as bgCanvas/bgSurface above,
  // since a selected row renders the same textPrimary/textSecondary row text as any other row.
  it('textPrimary on bgSelected clears 4.5:1 (body text)', () => {
    expect(contrastRatio(palette.textPrimary, palette.bgSelected)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  it('textSecondary on bgSelected clears 4.5:1 (body text)', () => {
    expect(contrastRatio(palette.textSecondary, palette.bgSelected)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  // `textOnInk` is the text color placed on top of `action`/`accent`/`danger` when any of those
  // three is used as a filled background (Button primary, filter Chip selected, Dropdown active
  // trigger/item, Chip status "accent" tone, Shell's dock badge/active tab, Button danger's
  // `:active` fill) — every one of those is real, always-or-often-visible UI text, not decoration.
  it('textOnInk on action (the filled "primary" background) clears 4.5:1', () => {
    expect(contrastRatio(palette.textOnInk, palette.action)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  it('textOnInk on actionHover clears 4.5:1', () => {
    expect(contrastRatio(palette.textOnInk, palette.actionHover)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  it('textOnInk on actionActive clears 4.5:1', () => {
    expect(contrastRatio(palette.textOnInk, palette.actionActive)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  it('textOnInk on accent (Chip "accent" tone / Shell active tab fill) clears 4.5:1', () => {
    expect(contrastRatio(palette.textOnInk, palette.accent)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  it('textOnInk on danger (Button danger\'s pressed fill) clears 4.5:1', () => {
    expect(contrastRatio(palette.textOnInk, palette.danger)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  // `accent`/`danger` used as flat text (Card's selected label, Dropdown's selected-item color,
  // Button's danger label, Chip's danger outline, Input's error message) against the two
  // backgrounds those actually render on.
  it('accent as flat text on bgSurface clears 4.5:1', () => {
    expect(contrastRatio(palette.accent, palette.bgSurface)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  it('accent as flat text on bgCanvas clears 4.5:1', () => {
    expect(contrastRatio(palette.accent, palette.bgCanvas)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  it('danger as flat text on bgSurface clears 4.5:1', () => {
    expect(contrastRatio(palette.danger, palette.bgSurface)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  it('danger as flat text on bgCanvas clears 4.5:1', () => {
    expect(contrastRatio(palette.danger, palette.bgCanvas)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  // `success`/`warning` (M10 color-scale work, issue #24) — same outlined-Chip flat-text usage
  // as `danger` above, same two backgrounds.
  it('success as flat text on bgSurface clears 4.5:1', () => {
    expect(contrastRatio(palette.success, palette.bgSurface)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  it('success as flat text on bgCanvas clears 4.5:1', () => {
    expect(contrastRatio(palette.success, palette.bgCanvas)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  it('warning as flat text on bgSurface clears 4.5:1', () => {
    expect(contrastRatio(palette.warning, palette.bgSurface)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  it('warning as flat text on bgCanvas clears 4.5:1', () => {
    expect(contrastRatio(palette.warning, palette.bgCanvas)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
  });

  // focusRing is a non-text UI-component boundary (WCAG 1.4.11), not text — 3:1, not 4.5:1.
  it('focusRing clears 3:1 against bgSurface (non-text UI component)', () => {
    expect(contrastRatio(palette.focusRing, palette.bgSurface)).toBeGreaterThanOrEqual(AA_UI_COMPONENT);
  });
});

describe('dark palette is a real, distinct palette (guards against a copy-paste no-op)', () => {
  it('every dark value differs from its light counterpart', () => {
    for (const key of Object.keys(lightPalette)) {
      expect(darkPalette[key], `darkPalette.${key} is identical to lightPalette.${key} — was it actually given a dark value?`).not.toBe(
        lightPalette[key],
      );
    }
  });
});
