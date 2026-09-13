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

**No milestone is current.** The owner sets the next one — M2 (item 3) is one
option, once its `[UI request]` is agreed with the core session; item 3's own
line still applies either way.

After M2, stop expanding the framework: new work starts only from a request
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
   `./shell` subpath; a browser test moves between them by app strip, palette
   command and dock, and checks `aria-current` and the visible page heading
   after each move; each page documents its loading, empty, error and
   permission states in `docs/`; the core session records `accepted` with the
   commit it tested. Serves: Objective 1. Needs: a `[UI request]` issue agreed
   with the core session.
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

Each batch needs an acceptance-to-test mapping and one independent review.
Loop runs follow [LOOP.md](LOOP.md).
