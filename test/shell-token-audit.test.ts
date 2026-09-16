import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// ROADMAP item 13 (M3, issue #12) Accept text: "no raw value remains in
// `Shell.tsx`/`AppShell.tsx` for which a token exists (a unit test greps the
// two files against the token values)." Scoped to `color` group hex literals
// specifically (the confirmed 2026-09-14 design-review finding was about raw
// hex duplicating a named color token — space/radius/font literal duplicates
// are the review's own "harmless, lower priority" bucket and are out of this
// test's scope, a deliberate boundary, not an oversight).
//
// The token values are read from `tokens.stylex.ts`'s own source rather than
// hardcoded here or imported at runtime: `stylex.defineVars` compiles each
// value to a `var(--...)` reference at import time, so only the source text
// still has the literal hex strings to compare against.
//
// ROADMAP item 19 (real dark/light/system theming) moved the actual hex literals out of the
// `color = stylex.defineVars({...})` call itself and into two source objects it now only
// *references* (`lightPalette`/`darkPalette` — one `default` value and one
// `@media (prefers-color-scheme: dark)` value per var, mirroring how `motion`'s durations already
// used a media query per value). This audit now reads both, which only widens its coverage —
// Shell.tsx/AppShell.tsx get checked against the new dark-mode hex values too, not just light's.

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

function colorTokenHexValues(): string[] {
  const tokensSource = readFileSync(path.join(repoRoot, 'src/tokens.stylex.ts'), 'utf8');
  const paletteBlocks = tokensSource.match(/export const (?:lightPalette|darkPalette) = \{([\s\S]*?)\n\};/g);
  if (!paletteBlocks || paletteBlocks.length < 2) {
    throw new Error(
      'Could not find both `export const lightPalette = {...};` and `export const darkPalette = {...};` in tokens.stylex.ts — have they moved or been renamed?',
    );
  }
  return Array.from(new Set(paletteBlocks.flatMap((block) => Array.from(block.matchAll(/#[0-9a-fA-F]{3,8}/g), (match) => match[0]))));
}

// Line (`//`) and block (`/* */`) comments only — good enough for this repo's
// own two files (neither contains a `//`/`/*` inside a string literal, e.g. a
// URL, that this would wrongly eat) — so an explanatory comment can still
// name a hex value (e.g. "was #64748b") without tripping the check below,
// which cares about *rendered style* values, not prose.
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

// ROADMAP item 38 (2026-09-16): widened from the original 2 files into this repo's general
// theme-safety ratchet — every examples/*.tsx file confirmed raw-hex-free stays that way. A file
// is added here the moment its own theme-safe pass lands (docs/design-conventions.md's "Theme-safe
// page chrome" recipe); this list only ever grows, never shrinks, so a later edit can't silently
// reintroduce a literal a prior pass removed.
//
// Token-standardization sweep (owner-directed, 2026-09-17, issue #21): widened to every
// examples/*.tsx file plus src/shell/Shell.tsx — the full 45-file surface, not a partial list.
// "No exception" is this array covering every real file and this test passing, not a narrative
// claim; a small number of genuinely off-palette literals remain by design (see
// docs/design-conventions.md's "Theme-safe page chrome" section) but each is either not a hex
// literal duplicating a token value at all, or is out of THIS test's declared scope (comments are
// stripped before the check, so an explanatory "was #xxxxxx" note doesn't trip it).
const TARGET_FILES = [
  'src/shell/Shell.tsx',
  'examples/AccessDenied.tsx',
  'examples/AccountLocked.tsx',
  'examples/AdminOverview.tsx',
  'examples/Analytics.tsx',
  'examples/Approvals.tsx',
  'examples/AppShell.tsx',
  'examples/AuditLog.tsx',
  'examples/Billing.tsx',
  'examples/breadcrumbTrail.tsx',
  'examples/BuilderForms.tsx',
  'examples/BuilderReports.tsx',
  'examples/BuilderScreens.tsx',
  'examples/BuilderWorkflow.tsx',
  'examples/Companies.tsx',
  'examples/confirmDialog.tsx',
  'examples/ControlCenter.tsx',
  'examples/Customers.tsx',
  'examples/Dashboard.tsx',
  'examples/Delivery.tsx',
  'examples/entryScreenLayout.tsx',
  'examples/filterTabs.tsx',
  'examples/Help.tsx',
  'examples/Inbox.tsx',
  'examples/Integrations.tsx',
  'examples/Inventory.tsx',
  'examples/Invoice.tsx',
  'examples/Launcher.tsx',
  'examples/ListReport.tsx',
  'examples/Login.tsx',
  'examples/NotFound.tsx',
  'examples/Notifications.tsx',
  'examples/PasswordReset.tsx',
  'examples/Planning.tsx',
  'examples/ProductionOrders.tsx',
  'examples/Profile.tsx',
  'examples/Quotations.tsx',
  'examples/RecordDetail.tsx',
  'examples/Requisitions.tsx',
  'examples/RolePage.tsx',
  'examples/Roles.tsx',
  'examples/SalesOrderList.tsx',
  'examples/SessionExpired.tsx',
  'examples/Settings.tsx',
  'examples/Users.tsx',
  'examples/UsersAndRoles.tsx',
];
const TOKEN_HEX_VALUES = colorTokenHexValues();

describe('Shell.tsx and every examples/*.tsx file carry no raw color value that duplicates an existing token (ROADMAP items 13, 38, 49)', () => {
  it('found at least one color token value to check source files against (guards against a silently empty check)', () => {
    expect(TOKEN_HEX_VALUES.length).toBeGreaterThan(0);
  });

  it('comment-stripping actually removes text (guards against a no-op stripper silently passing everything)', () => {
    const source = readFileSync(path.join(repoRoot, 'src/shell/Shell.tsx'), 'utf8');
    const rawHexCount = (source.match(/#[0-9a-fA-F]{3,8}/g) ?? []).length;
    const strippedHexCount = (stripComments(source).match(/#[0-9a-fA-F]{3,8}/g) ?? []).length;
    expect(strippedHexCount).toBeLessThan(rawHexCount);
  });

  for (const file of TARGET_FILES) {
    it(`${file} contains no literal hex color string matching a color token's value`, () => {
      const source = readFileSync(path.join(repoRoot, file), 'utf8');
      const code = stripComments(source);
      const offendingValues = TOKEN_HEX_VALUES.filter((hex) => code.includes(hex));
      expect(offendingValues).toEqual([]);
    });
  }
});
