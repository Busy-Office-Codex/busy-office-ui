# UI framework roadmap

## Objective

**Busy Office hosts import one small, dependable UI package instead of
rebuilding presentation and interaction per screen** (see `intent.md`). The
framework stays lean: simplicity is the first test and wins every tie. Every
proposal to add, change or remove anything passes these three tests before it
becomes an item. "It would be useful" is not enough on its own.

1. **Simplicity — less for more.** *Accept* when the change removes more host
   code or decisions than the API it adds, or deletes code outright. *Refuse* a
   prop, variant or component with one caller. *Rethink* when a composition of
   existing exports already does the job.
2. **Boundary.** *Accept* presentation or interaction a host would otherwise
   reimplement. *Refuse* anything that needs ERP data, business rules,
   permissions or a runtime. *Rethink* screen-specific composition: it belongs
   in `examples/` or the host.
3. **Proven reuse.** A new shared component needs two named consumers (host
   screens or examples) with a concrete scenario, raised as a `[UI request]`
   issue. Suitability at the point of use beats reuse.

## Milestone

The loop works only on the current milestone and stops when it is complete.
The owner sets the next one.

**M1 — Accessible core, docs that cannot drift — complete.** Items 4, 5, 6, 7
are all `[x]`; the full gate suite (including `pnpm test:browser`) passed at
the batch head before it merged into `main`. A release recommendation is
recorded in that merge commit — the owner decides whether to cut it.

**M2 — Prove the framework with real sample pages — UI side complete.** Item
3, issue #11 (`agreed`, project owner, 2026-09-13); landed at `e419e4b`. The
one open clause — the core session records `accepted` on #11 — is an
acknowledgement, not a build item, so M2 stops the loop for nothing and M3
proceeds; item 3 flips to `[x]` when that comment lands.

**M3 — One density tier, realigned to the ERP skeleton — current.** Items
10–14, issue #12 (`agreed`, project owner, 2026-09-14). Goal: a host sets one
density (`compact` / `comfortable` / `spacious`) on any wrapper and every
control, row and label follows, and the sample screens measure against the
ERP skeleton reference instead of approximating it. Set by the owner after a
grilled review (2026-09-14): the "too big at 100%" impression was traced, with
measurements, to ink weight, vertical budget and a missing 13/14px tier — not
to the type scale — so a uniform 90% scale was refused. Waves: item 10 first
and alone (it changes the heights everything else assumes); then 11 + 13
(disjoint files); then 12, then 14. Complete when items 10–14 are `[x]`, the
full gate suite (including `pnpm test:browser`) passes at the batch head
before it merges into `main`, the Claude Design project is re-synced
(`/design-sync`), and a `0.4.0` release is recommended in the merge commit.

Item 15 (docs website) is proposed, not in M3 — it starts only from an agreed
`[UI request]` (#13) and after M3, so it documents a system that has stopped
moving.

After M3, stop expanding the framework: new work starts only from a request
that passes the Objective tests.

## Items

Format: `[x]` done · `[ ]` open · `[?]` proposed (needs an agreed issue).
**Accept** names the property a test checks, never the expected value.
**Serves** names the Objective test or `intent.md` clause. Keep open items
plus at most 10 closed one-liners here; detail lives in commit messages and
issues.

1. [x] Dialog accessibility and command-palette focus containment — PR #3
   (`d27f653`).
2. [x] Minimal reusable shell API, `@busyoffice/design-system/shell` 0.2.0 —
   issue #5, PR #6 (`1986ef0`).
3. [ ] **Prove the framework with the Purchase Orders and Sales sample pages.**
   Accept: the preview host renders both pages only through `Shell` from the
   `./shell` subpath; a browser test crosses between them by command palette
   and dock, and confirms the app strip reflects and can reassert the active
   page (each page is the sole route in its own module here, so app strip has
   no sibling to cross to — verified against `Shell.tsx`'s own `stripRoutes`
   filter, not assumed), checking `aria-current` and the visible page heading
   after each move; each page documents its loading, empty, error and
   permission states in `docs/`; the core session records `accepted` with the
   commit it tested. Serves: Objective 1. Needs: issue #11 (`agreed`, project
   owner, 2026-09-13).
4. [x] Modal on the native `<dialog>` element — `showModal()`/`close()` driven
   by `open`; background content is genuinely `inert` (not just `aria-modal`),
   verified directly since neither `getByRole()` nor `ariaSnapshot()` reflect
   dialog inertness — `a80dce4`, inertness regression test `fab0212`.
5. [x] State is never carried by colour alone — `Card` `selected`/`disabled`
   and filter `Chip` `selected` now expose state both programmatically
   (`aria-pressed`/`aria-disabled`) and by a non-colour cue; enumerated in
   `test/state-channels.test.mjs` — `882c2b5`. Known gap: a `Card` with
   `selected` and no `onClick` still has no programmatic channel (no button
   role to hang `aria-pressed` on); latent today, no real caller does this.
6. [x] Docs cannot drift from components — `test/docs-contract.test.mjs`
   discovers every component doc from the package's own export lines and
   checks `category`, a "Not for" sentence, an example, no hand-written prop
   table, and a `tests:` list of real backing test files — `2eb1964`. That
   last check verifies the doc names real, non-empty tests, not that a given
   sentence maps to a given assertion (disclosed weaker reading; sentence-level
   correspondence isn't mechanically decidable).
7. [x] Point agent instructions at the central integration repository —
   `c03bc2e`. Issue #8 (`agreed`) handoff posted citing this commit.
8. [x] Sample screens aligned to the real ERP skeleton density reference;
   `Dropdown` keyboard/listbox support, `Chip`/`Card` focus-visible rings and
   `Input` placeholder contrast closed (owner-directed, not a milestone item)
   — `0158a19`.
9. [x] Compact `size`/`density` on `Button`/`Input`/`Table` (0.3.0) — closes the
   gap item 8 found; `Shell`'s app-strip nav and the sample host's "+New"
   action moved back onto real `Button` now that it has a compact size. Issue
   #10 (`agreed`), owner-directed — `f0e9748`.
10. [ ] **Density tier.** Accept: `src/tokens.stylex.ts` exports a `density`
    var group — `controlHeight`, `rowHeight`, `cellPaddingX`, `cellPaddingY`,
    `fieldGap`, `fontSize` — whose defaults are the comfortable tier, plus
    `compact` and `spacious` themes (`stylex.createTheme`); a `Density`
    component exported from the package root applies a tier to its subtree
    and tiers nest (a browser test wraps a compact region inside a
    comfortable page and measures both); `Button`, `Input`, `Dropdown`'s
    trigger, filter `Chip`, `Table` head/cells/rows and `Shell`'s command-bar
    and app-strip controls take height, padding and font size only from
    those aliases (a browser test measures each under all three tiers —
    control 28/36/44, row 32/40/48, font 13/14/15 — and fails on any
    hard-coded height); density and type tokens are `rem`, and control/row
    heights never clip their own content when the root font grows —
    `min-height` for ordinary flow elements, `height` for `<tr>` (the only
    property the CSS table row-sizing algorithm honors as a minimum; `min-
    height` is silently ignored on table rows) — a test sets the root font
    to 20px and asserts no row clips its content; the type scale gains `sizeControl`
    (13) and `sizeUi` (14) and `caption` stays metadata-only;
    `size="compact"`/`density="compact"` keep working as per-instance
    overrides onto the same aliases and their docs say they are deprecated.
    Serves: Objective 1 (one mechanism replaces per-component size props);
    intent.md "portable" (a host sets one attribute). Needs: issue #12
    (`agreed`).
11. [ ] **Filter and action hierarchy.** Accept: `Dropdown`'s trigger fills
    only when a narrowing value is selected (`active`; the default "All …"
    item does not count) and is otherwise an outline pill with hover and open
    states (a browser test asserts the four Purchase-orders filters are
    unfilled at rest, one fills after choosing a non-default value, and the
    trigger's computed background differs across rest/hover/open); option
    rows use the density font size, not body; a keyboard-highlighted option
    carries a ≥3:1 indicator and the trigger keeps its focus ring while
    open. Serves: Objective 2 (the reference's toolbar); accessibility.
12. [ ] **Table aligned to the reference and AA.** Accept: header cells
    measure ≥4.5:1 against the head background (the reference recipe —
    `textSecondary` on `bgCanvas`, uppercase, `.04em`); row separators use a
    `borderSubtle` token lighter than the frame; every status `Chip` renders
    the same height regardless of tone (rows are uniform — a test asserts
    all rows in the sample table are equal); the sample table's row-selection
    checkboxes are 16px, radius 4, `borderStrong`, with the shared focus ring
    (styled in the example — no `Checkbox` export until a second consumer
    exists). Serves: accessibility; Objective 2.
13. [ ] **Shell chrome on tokens.** Accept: `Shell`'s root sets
    `color: textPrimary` (the brand label no longer inherits UA black); the
    dock count badge is drawn by `Shell` at reference size (≤16px tall) inside
    the tile button so it fades with a disabled tile and is part of its
    accessible name; the command palette uses compact controls, its group
    labels and `kbd` hint measure ≥4.5:1 on the glass panel, and Enter runs
    the highlighted (default: first visible) command via a roving highlight
    exposed with `aria-activedescendant`; inactive strip tabs use
    `textSecondary`; the sample host's notification button has hover and the
    shared focus ring; no raw value remains in `Shell.tsx`/`AppShell.tsx` for
    which a token exists (a unit test greps the two files against the token
    values). Serves: Objective 2; accessibility.
14. [ ] **Page composition on the reference frame.** Accept: all three sample
    pages use the reference's 24px content padding with left-aligned
    max-widths (a browser test asserts the page heading's x is equal across
    pages at 1280px); no sample page scrolls into empty canvas inside `Shell`
    (`scrollHeight` equals the viewport at 800px for all three); the preview
    host resets the UA body margin and keeps its banner out of the vertical
    flow; the Purchase-orders stat tile is a `Card` (one tile implementation
    across pages; its 16px padding vs the reference's 14 is a disclosed
    deviation); `Input` and `Chip` are `border-box` so declared heights are
    rendered heights. Serves: Objective 1 (less host code); Objective 2.
15. [?] **Docs website.** Astro v1 deployed from CI on every push to `main`
    (Cloudflare Pages from the private repo, or the container image if no
    account): one page per `docs/*.md` with its live demo, tokens and density
    pages, the four sample screens as patterns, conventions; no search,
    versioning or build-time check scripts in v1. Accept: a CI job builds and
    deploys the site on every `main` push; every `docs/*.md` page renders
    with a live demo; a link check passes. Serves: intent.md
    "documentation". Needs: issue #13 agreed and the hosting choice made.

Each batch needs an acceptance-to-test mapping and one independent review.
Loop runs follow [LOOP.md](LOOP.md).
