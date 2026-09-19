// Single source for the `category` frontmatter's display order/labels (docs/*.md's own schema,
// content.config.ts) — extracted from index.astro so the new /components/ gallery page (which
// filters by the same categories) doesn't hand-copy a second list that can drift from the first.
export const CATEGORY_ORDER = ['actions', 'forms', 'data-display', 'feedback', 'layout', 'typography', 'media'] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  actions: 'Actions',
  forms: 'Forms',
  'data-display': 'Data display',
  feedback: 'Feedback',
  layout: 'Layout',
  typography: 'Typography',
  media: 'Media',
};

// Doc ids to leave out of a component listing/gallery: the 4 pattern compositions (shown under
// their own "Patterns" section instead) plus AppShell (a full sample-page composition — it keeps
// its /components/appshell/ URL, see components/[id].astro's own comment on why, but doesn't
// belong in a grid of individually-demoable components). This is the *display* exclusion set
// (index.astro's own list); [id].astro's routing exclusion is deliberately narrower (no
// 'appshell') for reasons explained in its own comment — the two lists differ on purpose, don't
// unify them.
export const NON_COMPONENT_DOC_IDS = ['listreport', 'recorddetail', 'launcher', 'dashboard', 'appshell'];

type DocEntry = { id: string; data: { category?: string } };

/** Every real component doc, sorted A-Z — the same query index.astro, the /components/ gallery
 * and llms.txt.ts each need against the full `docs` collection they already fetched themselves
 * (kept as a plain filter here, not a `getCollection` call of its own, so none of the three ends
 * up fetching the collection twice). */
export function selectComponentEntries<T extends DocEntry>(allDocs: T[]): T[] {
  return allDocs
    .filter((entry) => entry.id !== 'design-conventions' && entry.id !== 'layouts' && !NON_COMPONENT_DOC_IDS.includes(entry.id))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Buckets already-selected component entries by `CATEGORY_ORDER`, plus whatever doesn't match any
 * known category — the one grouping index.astro and the gallery page both render from. */
export function groupByCategory<T extends DocEntry>(entries: T[]) {
  const componentsByCategory = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category] ?? category,
    entries: entries.filter((entry) => entry.data.category === category),
  })).filter((group) => group.entries.length > 0);
  const uncategorized = entries.filter((entry) => !CATEGORY_ORDER.includes(entry.data.category ?? ''));
  return { componentsByCategory, uncategorized };
}
