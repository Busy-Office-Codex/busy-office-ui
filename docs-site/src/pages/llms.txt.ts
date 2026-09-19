import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { selectComponentEntries, groupByCategory, NON_COMPONENT_DOC_IDS } from '../lib/categories.ts';

// A plain-text index for LLM agents/crawlers, generated at build time from the same docs/*.md
// source (content.config.ts's `docs` collection) every other docs-site page already reads — never
// hand-maintained, so it can't drift the way a separately-authored llms.txt would the moment a
// doc is added, renamed or recategorized. Astro prerenders a `.ts` page route like this one to a
// static file in `dist/` in the default (non-adapter) build mode this project already uses, the
// same way every `.astro` page here becomes static HTML.
//
// Links below are root-relative (`/components/input/`), not absolute: this site has no configured
// canonical domain (astro.config.mjs sets no `site`, and docs.yml publishes a ghcr.io container
// image, not a fixed URL) — inventing one here would silently ship a wrong host, and there is
// nothing to toggle to yet, so this isn't even a constant — just the literal paths below.

export const GET: APIRoute = async () => {
  const allDocs = await getCollection('docs');
  const { componentsByCategory, uncategorized } = groupByCategory(selectComponentEntries(allDocs));
  const patternDocs = allDocs
    .filter((entry) => NON_COMPONENT_DOC_IDS.includes(entry.id))
    .sort((a, b) => a.id.localeCompare(b.id));

  const lines: string[] = [];
  lines.push('# Busy Office UI');
  lines.push('');
  lines.push(
    '> Docs for @busyoffice/design-system — a reusable React component package and reference page compositions for Busy Office applications. A UI dependency, not an ERP platform kernel or application implementation.',
  );
  lines.push('');
  lines.push('- [Home](/): overview, install instructions, public import paths');
  lines.push('- [Components gallery](/components/): every component below, live and filterable by category');
  lines.push('- [Design conventions](/conventions/)');
  lines.push('- [Tokens](/tokens/): color, spacing and type scale');
  lines.push('- [Density](/density/): compact/comfortable/spacious tiers');
  lines.push('- [Quality & Verification](/quality/): CI gates, review process, M10 component scores');
  lines.push('');

  lines.push('## Components');
  for (const group of componentsByCategory) {
    lines.push('');
    lines.push(`### ${group.label}`);
    for (const entry of group.entries) {
      const summary = summarize(entry.body ?? '');
      lines.push(`- [${entry.id}](/components/${entry.id}/)${summary ? `: ${summary}` : ''}`);
    }
  }
  if (uncategorized.length > 0) {
    lines.push('');
    lines.push('### Other');
    for (const entry of uncategorized) {
      const summary = summarize(entry.body ?? '');
      lines.push(`- [${entry.id}](/components/${entry.id}/)${summary ? `: ${summary}` : ''}`);
    }
  }

  if (patternDocs.length > 0) {
    lines.push('');
    lines.push('## Patterns');
    lines.push('Composed sample-page journeys, not single components.');
    for (const entry of patternDocs) {
      const href = entry.id === 'appshell' ? '/components/appshell/' : `/patterns/${patternSlug(entry.id)}/`;
      const summary = summarize(entry.body ?? '');
      lines.push(`- [${entry.id}](${href})${summary ? `: ${summary}` : ''}`);
    }
  }

  lines.push('');
  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

// listreport -> list-report, recorddetail -> record-detail; every other pattern id is already
// one word. Matches the hyphenation the same 4 ids use under /patterns/ elsewhere on this site
// (see index.astro's own `patterns` array) — not derived automatically, since it's exactly 2 ids.
function patternSlug(id: string): string {
  if (id === 'listreport') return 'list-report';
  if (id === 'recorddetail') return 'record-detail';
  return id;
}

// A short, single-line description per entry: the start of the doc body, stripped of markdown
// emphasis/code markup and any embedded fenced code block (the sample JSX, not prose), truncated
// to a word boundary. Deliberately NOT "first sentence up to the first period" — this repo's own
// doc prose is full of periods that aren't sentence ends ("e.g.", "AppShell.tsx", "v1.0") that a
// one-line regex can't reliably tell apart from a real one; a clean truncation avoids guessing
// wrong. Good enough for a one-line index entry without pulling in a markdown parser for a text
// file nothing else on this site needs one for.
function summarize(body: string, maxLength = 160): string {
  const withoutCodeBlocks = body.replace(/```[\s\S]*?```/g, '');
  const plain = withoutCodeBlocks
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLength) return plain;
  const truncated = plain.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${(lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim()}…`;
}
