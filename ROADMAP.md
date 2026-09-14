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

**M3 — One density tier, realigned to the ERP skeleton — complete.** Items
10–14, issue #12 (`agreed`, project owner, 2026-09-14); landed at `77b9e43`. A
host sets one density (`compact` / `comfortable` / `spacious`) on any wrapper
and every control, row and label follows; the sample screens measure against
the ERP skeleton reference instead of approximating it. Set by the owner
after a grilled review (2026-09-14): the "too big at 100%" impression was
traced, with measurements, to ink weight, vertical budget and a missing
13/14px tier — not to the type scale — so a uniform 90% scale was refused.
The full gate suite (including `pnpm test:browser`, 76/76) passed at each
batch head before merging into `main`; the Claude Design project is re-synced
(`/design-sync`, 2026-09-14 — the new `Density` component plus 10
density-wired components re-verified). **`0.4.0` cut and released** for the
whole of M3 (items 10–14: the density tier, filter/action hierarchy, Table
alignment, Shell chrome on tokens, page composition), owner approval
2026-09-14.

**M4 — Docs website for `@busyoffice/design-system` — item 15, issue #14
(`agreed`, project owner, 2026-09-14).** The framework stopped expanding
after M3 (no new component, prop or export cleared the Objective tests in
the open backlog); item 15 documents the system that has stopped moving
instead of adding to it. Scope and Accept carried on #13: Astro; pages
generated from `docs/*.md` with a live demo per page built from the package;
tokens + density pages; the four sample screens as patterns; a CI job that
builds and deploys the site on every push to `main`; a link check passes.

After M4, stop expanding the framework: new work starts only from a request
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
10. [x] Density tier — `density` var group (`controlHeight`/`rowHeight`/
    `cellPaddingX`/`cellPaddingY`/`fieldGap`/`fontSize`, `rem`, compact 28/32/13
    · comfortable 36/40/14 · spacious 44/48/15) and the `Density` component;
    `Button`/`Input`/`Dropdown`/filter-`Chip`/`Table`/`Shell`'s palette trigger
    read it ambiently, `size="compact"`/`density="compact"` kept as deprecated
    per-instance overrides; `sizeControl`(13)/`sizeUi`(14) added to the type
    scale. Issue #12 (`agreed`) — `2dc8370`, fixed `7f50778`.
11. [x] Filter and action hierarchy — `Dropdown` gained an `active?`
    prop (falls back to `items.some(selected)` when omitted) driving the
    trigger's fill, separate from real rest/hover/`:active`/open states;
    keyboard-highlighted options carry a real indicator instead of a
    1.11:1 tint; the listbox keeps a focus-visible ring while open. Issue
    #12 (`agreed`) — `e422e07`.
12. [x] Table aligned to the reference and AA — header cells now
    `textSecondary` on `bgCanvas` (was `textTertiary`/`bgSubtle`,
    4.34:1 → 7.24:1 AA); new `color.borderSubtle` token for row
    separators; `Chip`'s danger tone fixed to `border-box` so every
    row is uniform height; `ListReport`'s selection checkboxes styled
    (16px, radius 4, `borderStrong`, shared focus ring — no `Checkbox`
    export, single consumer). Issue #12 (`agreed`) — `7c3069b`, fixed
    `36f5045`, `d19ecee`.
13. [x] Shell chrome on tokens — root `color: textPrimary`; dock count
    badge rebuilt inside the tile button at reference size (dims with a
    disabled tile, part of its accessible name); palette gets compact
    controls, `textSecondary` contrast, and Enter-runs-highlighted-command
    keyboard support; inactive strip tabs `textSecondary`; notification
    button gets hover/focus states; a unit test greps `Shell.tsx`/
    `AppShell.tsx` against `tokens.stylex.ts`'s own literals. Issue #12
    (`agreed`) — `022034e`, fixed `2835601`, `c95f6ef`.
14. [x] Page composition on the reference frame — all three sample pages
    on the reference's 24px content padding, left-aligned (heading x=24
    on all three at 1280px, was 40/160/80); no page scrolls into empty
    canvas (`scrollHeight`=800px viewport for all three, was up to
    +325px of void); preview host resets the UA body margin, banner
    fixed out of flow and clear of the dock's footprint; Purchase-orders
    stat tile is a real `Card` (16px-vs-14px padding a disclosed
    deviation); `Input` `border-box` (`Chip`'s `filter` variant
    investigated, already `border-box` by UA default — no bug, no fix).
    Issue #12 (`agreed`) — `d5e5047`, fixed `edb62ee`.
15. [ ] **Docs website.** Astro v1 deployed from CI on every push to `main`
    (Cloudflare Pages from the private repo, or the container image if no
    account): one page per `docs/*.md` with its live demo, tokens and density
    pages, the four sample screens as patterns, conventions; no search,
    versioning or build-time check scripts in v1. Accept: a CI job builds and
    deploys the site on every `main` push; every `docs/*.md` page renders
    with a live demo; a link check passes. Serves: intent.md
    "documentation". Needs: hosting choice made (Cloudflare Pages if an
    account exists, else the container route). Issue #13/#14 (`agreed`,
    project owner, 2026-09-14).

Each batch needs an acceptance-to-test mapping and one independent review.
Loop runs follow [LOOP.md](LOOP.md).
