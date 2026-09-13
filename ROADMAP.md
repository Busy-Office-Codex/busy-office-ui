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

**Current: M1 — Accessible core, docs that cannot drift** → release 0.3.0.
- Items: 7 (wave 1), 4 (wave 1), 5 (wave 1), 6 (wave 2, after wave 1 lands).
- Complete when every item above is `[x]`, the latest `gates` run on `develop`
  passed at the commit that closed the last item, and a 0.3.0 release
  recommendation is recorded in that merge commit.

**Next: M2 — Framework proven by two real pages** (item 3). Starts when the owner
makes it current and its `[UI request]` is agreed with the core session.

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
4. [ ] **Modal on the native `<dialog>` element.** Accept: `Modal` opens with
   `showModal()` and keeps `ModalProps` unchanged; content outside an open
   modal is absent from the accessibility tree; the existing modal browser
   tests pass unmodified. Serves: Objective 2 (closes the `aria-modal`-only
   containment noted in `docs/Modal.md`).
5. [ ] **State is never carried by colour alone.** Accept: every visual state
   prop (`Card` `selected`/`disabled`, filter `Chip` `selected`, selected
   `Dropdown` item) exposes the state programmatically and by a non-colour cue;
   a unit test enumerates these props and fails when one lacks either channel.
   Serves: Objective 2.
6. [ ] **Docs cannot drift from components.** Accept: a unit test fails when a
   `docs/<Component>.md` lacks `category` frontmatter, a "Not for" sentence or
   one example; behaviour sentences in those docs each map to a test;
   prop lists are not hand-written in docs. The test is shown failing on a
   planted defect in its commit message. Serves: Objective 1.
7. [ ] **Point agent instructions at the central integration repository.**
   Accept: `AGENTS.md` links the `busy-office-integration` repository map and
   shared dependency backlog and says to read them before cross-repository task
   selection; UI keeps its own roadmap and ownership; issue #1 is still named as
   the canonical protocol and none of its rules are copied. Serves: `intent.md`
   (consumers own integration). Refs: issue #8 (`agreed`).

Each batch needs an acceptance-to-test mapping and one independent review.
Loop runs follow [LOOP.md](LOOP.md).
