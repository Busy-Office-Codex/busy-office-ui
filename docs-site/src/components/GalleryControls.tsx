import * as React from 'react';
import { Input, Chip, ButtonGroup } from '@busyoffice/design-system';

// The gallery page's own chrome, built from the real package it documents — every other page in
// docs-site (Base.astro's header/nav, this page's own <table>s elsewhere) is plain hand-rolled
// HTML/CSS, not the design system it's a site *for*. A docs site that never uses its own
// components is exactly the kind of drift this repo's rest of the review culture would flag on
// any other file; this component (and the gallery page that renders it) dogfoods instead.
//
// Filters the *already server-rendered* tiles by DOM attribute rather than owning the tile list
// itself — the tiles' own live demos (LiveDemo.tsx) are separate Astro/React islands with no
// shared state, and there's no reason to duplicate their content into this component's own props
// just to filter them.

export type GalleryControlsProps = {
  categories: { value: string; label: string }[];
};

type Layout = 'comfortable' | 'compact';

const LAYOUT_OPTIONS: { value: Layout; label: string }[] = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
];

export function GalleryControls({ categories }: GalleryControlsProps) {
  const [search, setSearch] = React.useState('');
  // The filtering effect below reads this, not `search` directly, and the result-count paragraph
  // is a `role="status"` live region — without debouncing, each keystroke re-filters and queues
  // another "N components shown" announcement, so a screen reader keeps speaking stale interim
  // counts for a couple of seconds after someone has already finished typing. Category/layout
  // changes don't need this: they're discrete clicks, not a per-keystroke stream.
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [layout, setLayout] = React.useState<Layout>('comfortable');
  const [visibleCount, setVisibleCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  React.useEffect(() => {
    const grid = document.querySelector('[data-gallery-grid]');
    if (!grid) return;
    grid.setAttribute('data-layout', layout);

    const needle = debouncedSearch.trim().toLowerCase();
    const items = Array.from(grid.querySelectorAll<HTMLElement>('[data-gallery-item]'));
    let visible = 0;
    for (const item of items) {
      const name = item.dataset.name ?? '';
      const category = item.dataset.category ?? '';
      const matchesSearch = needle === '' || name.includes(needle);
      const matchesCategory = activeCategory === null || category === activeCategory;
      const isVisible = matchesSearch && matchesCategory;
      item.hidden = !isVisible;
      if (isVisible) visible += 1;
    }

    const sections = Array.from(grid.querySelectorAll<HTMLElement>('[data-category-section]'));
    for (const section of sections) {
      const sectionItems = Array.from(section.querySelectorAll<HTMLElement>('[data-gallery-item]'));
      section.hidden = sectionItems.length > 0 && sectionItems.every((item) => item.hidden);
    }

    setVisibleCount(visible);
  }, [debouncedSearch, activeCategory, layout]);

  return (
    <div className="gallery-controls">
      <Input
        size="search"
        aria-label="Search components"
        placeholder="Search components…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div className="gallery-controls-row">
        {/* Known limitation, disclosed not silently accepted: this selection is mutually
            exclusive (picking a category clears any other), which is really a radiogroup pattern
            — but Chip's own "filter" variant contract (src/components/Chip.tsx) always renders
            aria-pressed on a plain <button>, matching its other real, precedented multi-select use
            (independently-toggleable filter tags elsewhere in examples/*.tsx). Overriding that
            per call site here would leave one button with both aria-pressed and a conflicting
            role, and changing Chip's own contract isn't this task's call to make. Still fully
            keyboard-operable (every chip is a real, Tab-reachable, Enter/Space button) — just
            without a radiogroup's roving-tabindex/arrow-key navigation or "N of M" announcement. */}
        <div className="gallery-category-filter" role="group" aria-label="Filter by category">
          <Chip variant="filter" selected={activeCategory === null} onClick={() => setActiveCategory(null)}>
            All
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category.value}
              variant="filter"
              selected={activeCategory === category.value}
              onClick={() => setActiveCategory(activeCategory === category.value ? null : category.value)}
            >
              {category.label}
            </Chip>
          ))}
        </div>
        <ButtonGroup aria-label="Grid layout" value={layout} onChange={(value) => setLayout(value as Layout)} options={LAYOUT_OPTIONS} />
      </div>
      <p className="gallery-controls-count" role="status">
        {visibleCount === null ? ' ' : `${visibleCount} component${visibleCount === 1 ? '' : 's'} shown`}
      </p>
    </div>
  );
}
