import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

// Roadmap item 6: docs cannot silently drift from the components they
// describe. "Component" here means every named export from a `./components/*`
// or shell `./Shell.js` file in the two package entry points — discovered
// from the export lines themselves, not a hand-kept list, so a new component
// export with no doc fails this test instead of going unchecked.
function componentDocNamesFrom(entryFile) {
  const source = readFileSync(path.join(repoRoot, entryFile), 'utf8');
  const names = [];
  for (const line of source.split('\n')) {
    if (line.startsWith('export type')) continue;
    const match = line.match(/^export \{[^}]*\} from '\.\/(?:components\/)?([A-Za-z]+)\.js';?$/);
    if (match) names.push(match[1]);
  }
  return names;
}

const COMPONENT_DOC_NAMES = [
  ...componentDocNamesFrom('src/index.ts'),
  ...componentDocNamesFrom('src/shell/index.ts'),
];

// Minimal frontmatter reader for this repo's own docs — a `key: value` line,
// or a `key:` line followed by indented `- item` lines for an array. Good
// enough for a format this test also controls; not a general YAML parser.
function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: null, body: markdown };
  const [, frontmatterText, body] = match;
  const frontmatter = {};
  const lines = frontmatterText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const arrayHeader = line.match(/^(\w+):\s*$/);
    if (arrayHeader) {
      const items = [];
      while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
        i++;
        items.push(lines[i].replace(/^\s*-\s+/, '').trim());
      }
      frontmatter[arrayHeader[1]] = items;
      continue;
    }
    const scalar = line.match(/^(\w+):\s*(.+)$/);
    if (scalar) frontmatter[scalar[1]] = scalar[2].trim();
  }
  return { frontmatter, body };
}

describe('every component doc stays honest about what it documents', () => {
  it('discovers at least one component export to check', () => {
    expect(COMPONENT_DOC_NAMES.length).toBeGreaterThan(0);
  });

  for (const name of COMPONENT_DOC_NAMES) {
    describe(`docs/${name}.md`, () => {
      const docPath = path.join(repoRoot, 'docs', `${name}.md`);

      it('exists', () => {
        expect(existsSync(docPath), `docs/${name}.md is missing for the exported "${name}" component`).toBe(true);
      });

      if (!existsSync(docPath)) return;

      const raw = readFileSync(docPath, 'utf8');
      const { frontmatter, body } = parseFrontmatter(raw);

      it('has category frontmatter', () => {
        expect(frontmatter, `docs/${name}.md has no --- frontmatter block`).not.toBeNull();
        expect(frontmatter?.category, `docs/${name}.md is missing a "category" in its frontmatter`).toBeTruthy();
      });

      it('states what it is not for', () => {
        expect(
          /\bNot for\b/.test(body),
          `docs/${name}.md has no "Not for ..." boundary sentence`,
        ).toBe(true);
      });

      it('has at least one usage example', () => {
        expect(/```[a-z]*\n[\s\S]+?```/.test(body), `docs/${name}.md has no fenced code example`).toBe(true);
      });

      it('does not hand-write a prop table', () => {
        expect(/^\s*\|.*\|.*\|/m.test(body), `docs/${name}.md contains a markdown table (hand-written prop list)`).toBe(
          false,
        );
      });

      it('declares the tests that back its behaviour claims, and they are real', () => {
        const tests = frontmatter?.tests;
        expect(Array.isArray(tests) && tests.length > 0, `docs/${name}.md has no "tests" frontmatter list`).toBe(
          true,
        );
        for (const testPath of tests ?? []) {
          const resolved = path.join(repoRoot, testPath);
          expect(existsSync(resolved), `docs/${name}.md declares tests: ${testPath}, which does not exist`).toBe(
            true,
          );
          if (!existsSync(resolved)) continue;
          const testSource = readFileSync(resolved, 'utf8');
          expect(
            /\b(it|test)\s*\(/.test(testSource),
            `docs/${name}.md declares tests: ${testPath}, which contains no test`,
          ).toBe(true);
        }
      });
    });
  }
});
