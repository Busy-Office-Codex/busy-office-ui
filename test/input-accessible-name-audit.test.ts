import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// M10 pilot (framework scoring round): `Input` (`src/components/Input.tsx`) has no accessible-
// name fallback — its DOM label association comes entirely from the caller-supplied `label` prop
// (rendered as visible text inside the wrapping `<label>`); `aria-label`/`aria-labelledby` pass
// through natively but nothing requires one when `label` is omitted. Reproduced live, not assumed:
// `size="search"` usages (Shell's own command palette, several examples/*.tsx screens) commonly
// omit a visible `label` by design (a search-bar field doesn't want a caption above it) — 2 of 6
// real `size="search"` call sites repo-wide shipped with NEITHER `label` nor `aria-label`,
// including `src/shell/Shell.tsx`'s own command palette input, the framework's primary navigation
// mechanism. A screen reader user gets "edit text" with no indication of what it searches.
//
// Scoped to `src/**/*.tsx` only (this round's framework-only boundary — `examples/ListReport.tsx`
// has the same real gap, found and disclosed in ROADMAP.md, deliberately left unfixed here since
// modifying example applications is out of this round's scope). Auto-discovers every `<Input`
// JSX usage under `src/` rather than a maintained file list (unlike `test/shell-token-audit.
// test.ts`'s static TARGET_FILES) — there's exactly one real framework call site today
// (`src/shell/Shell.tsx`), so a hardcoded list would be a single-entry ratchet; a directory walk
// costs nothing extra and catches the next one automatically.

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const srcDir = path.join(repoRoot, 'src');

function listTsxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listTsxFiles(full);
    return entry.isFile() && entry.name.endsWith('.tsx') ? [full] : [];
  });
}

// Same limits as `test/shell-token-audit.test.ts`'s own `stripComments` (line/block comments
// only, no awareness of `//`/`/*` inside a string literal) — but that precedent's copy only ever
// runs against a small, manually-reviewed file list, so its author could confirm none of them hit
// the edge case. This one auto-walks every `.tsx` file under `src/`, an intentionally growing,
// non-reviewed set (found during independent review, disclosed rather than silently inherited): a
// future `<Input placeholder="…https://foo…" label="…" />` anywhere under `src/` could have
// everything after `//` on that line eaten, either swallowing its own `label=`/`aria-label=` or
// breaking the block out of matching `/>` entirely — a false negative that looks like "no `<Input>`
// there to check" rather than a caught failure. Zero real files hit this today (confirmed: the one
// real `<Input>` usage under `src/`, `src/shell/Shell.tsx`, has no `//`/`/*` inside its own
// strings) — if this ever needs to be robust against it, replace with a real JSX-attribute parse
// rather than widening the regex further.
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

// `Input` is always self-closing in every real usage checked this session — no call site gives
// it children.
function findInputJsxBlocks(source: string): string[] {
  return Array.from(source.matchAll(/<Input\b[\s\S]*?\/>/g), (match) => match[0]);
}

const HAS_ACCESSIBLE_NAME_PROP = /\b(?:label|aria-label|aria-labelledby)\s*=/;

describe('every <Input> usage under src/ carries a real accessible-name source (M10 pilot, framework-only)', () => {
  const files = listTsxFiles(srcDir);

  it('found at least one .tsx file under src/ to check (guards against a silently empty walk)', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('found at least one real <Input> usage under src/ to check (guards against a silently empty regex)', () => {
    const totalUsages = files.reduce((sum, file) => sum + findInputJsxBlocks(stripComments(readFileSync(file, 'utf8'))).length, 0);
    expect(totalUsages).toBeGreaterThan(0);
  });

  for (const file of files) {
    const relativePath = path.relative(repoRoot, file);
    const blocks = findInputJsxBlocks(stripComments(readFileSync(file, 'utf8')));
    blocks.forEach((block, index) => {
      it(`${relativePath}'s <Input> usage #${index + 1} has label, aria-label, or aria-labelledby`, () => {
        expect(HAS_ACCESSIBLE_NAME_PROP.test(block)).toBe(true);
      });
    });
  }
});
