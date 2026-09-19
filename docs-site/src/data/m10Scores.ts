// M10's framework-scoring round (issue #24) is the only scoring/assessment system this repo has
// ever had — quality.astro used to say flatly "there is no scoring... system anywhere," which was
// true when that page was written (issue #21) and has been false since M10 landed (ROADMAP.md
// items 55, 59, 61-66, closed by the "M10: round-closing summary" commit, 88fa981). This file is
// a hand-transcribed snapshot of that real data, not a live query: there is no structured score
// store anywhere in the repo, only ROADMAP.md's own narrated item text (the same "hand-kept in
// sync, not generated" tradeoff Base.astro's own palette literals already make, for the same
// reason — no machine-readable source exists to generate from). If a future round rescopes a
// component, this file goes stale until someone updates it; each row cites the exact ROADMAP.md
// item its number came from so a reader can verify or refresh it against the real source.
//
// Every score here is the FINAL (post-independent-review) number, not the first draft — the round
// summary itself discloses that review caught and fixed a real defect in nearly every batch (a
// score-arithmetic error, an incomplete-scope claim, two overclaims in one item), so the first-pass
// numbers were not what shipped.
export type M10Score = {
  /** Matches the doc's content-collection id (docs/<Name>.md, lowercased) — links to /components/<id>/. */
  id: string;
  /** Out of 100. Some components have a lower max raw-point total than 36: 32 (one dimension
   * marked N/A — Card, Modal, Icon) or 28 (two dimensions marked N/A — Text, Density, Theme, each
   * for its own stated reason in ROADMAP.md). Normalization still puts every score on the same
   * /100 scale either way, per the frozen rubric (ROADMAP.md:444-474). */
  score: number;
  /** The ROADMAP.md item(s) that recorded this score. */
  item: string;
  /** Does every *applicable* dimension clear its own floor (score capped by the weakest dimension,
   * not averaged away)? Only Dropdown misses this, on a real, disclosed, deliberately-deferred gap. */
  clearsFloor: boolean;
  /** A real, component-specific caveat alongside the score, when one exists. */
  note?: string;
};

// 9 dimensions, each 0-4 (0 absent/broken … 4 exemplary with real verification): readability,
// density, themes, interaction/accessibility, API simplicity, maintainability, performance,
// relevant security, documentation/specimen usability. Summed (max 36, or less when a dimension is
// marked N/A for that component) and normalized to /100. Full per-dimension definitions live in
// issue #24, not ROADMAP.md itself.
export const RUBRIC_DIMENSIONS = [
  'Readability',
  'Density',
  'Themes',
  'Interaction / accessibility',
  'API simplicity',
  'Maintainability',
  'Performance',
  'Relevant security',
  'Documentation / specimen usability',
];

export const THRESHOLD = 85;

// Applies to every row below, for the identical reason in every case: no repo-wide re-render-count
// test exists anywhere in this repo yet, so the Performance dimension is capped at 3/4 (never 4/4)
// for every single component (ROADMAP.md:2521-2526) — a real, disclosed, not-yet-closed gap, not a
// rounding footnote.
export const PROVISIONAL_NOTE =
  'PROVISIONAL: capped by one repo-wide gap — no re-render-count test exists yet, so Performance holds at 3/4 for every component here, not 4/4.';

export const M10_SCORES: M10Score[] = [
  { id: 'input', score: 88, item: 'items 55, 59', clearsFloor: true },
  { id: 'button', score: 97, item: 'item 61', clearsFloor: true },
  { id: 'text', score: 96, item: 'item 62', clearsFloor: true },
  { id: 'table', score: 94, item: 'item 63', clearsFloor: true },
  { id: 'card', score: 96, item: 'item 64', clearsFloor: true },
  {
    id: 'dropdown',
    score: 91,
    item: 'item 64',
    clearsFloor: false,
    note: "The one component that doesn't clear every per-dimension floor: its glass token group has no dark-mode variant, a real, disclosed, deliberately-deferred visual-design gap, not smoothed over.",
  },
  { id: 'chip', score: 97, item: 'item 65', clearsFloor: true },
  { id: 'modal', score: 96, item: 'item 65', clearsFloor: true },
  { id: 'buttongroup', score: 97, item: 'item 65', clearsFloor: true },
  { id: 'chart', score: 93, item: 'item 66', clearsFloor: true },
  { id: 'density', score: 96, item: 'item 66', clearsFloor: true },
  { id: 'icon', score: 96, item: 'item 66', clearsFloor: true },
  { id: 'theme', score: 96, item: 'item 66', clearsFloor: true },
];
