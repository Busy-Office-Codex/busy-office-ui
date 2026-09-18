# Loop playbook

The rules one unattended tick obeys in this repository. `AGENTS.md` holds the
engineering rules and gates; this file adds how a tick batches, parallelises,
stops and records. Where they overlap, `AGENTS.md` wins.

Solo Flow (trunk-based): one writer, one branch (`main`), local-only work
branches, CI as the sole independent check. There is no `develop` — every
commit that lands on `main` has already passed the full gate suite, so there
is no "unstable" state a second branch would need to shield anyone from. The
one external consumer (the ERP/core session, issue #1's protocol) pins exact
commit SHAs, not "whatever's on a branch," so it needs nothing a second branch
would add.

**Aim: finish the current milestone fast with lean changes.** Work runs in
parallel; checks and review run once per batch. Simplicity wins every tie: the
smallest change that meets the Accept, deletion before addition, no new export
without an agreed request.

## Trigger

- **One driver:** a single Claude Code session in this checkout running the
  built-in `/loop` (self-paced) with the prompt `Run one tick of LOOP.md`.
  No cron entry, cloud routine, second session or the global `build-loop`
  skill drives this repo. Starting a second driver is a one-way change.
- **Kill switch:** if `.loop/HALT` exists, do nothing and end the tick. The
  owner deletes it to resume.
- **Cadence:** re-arm immediately after a merge; wait at least 20 minutes only
  after `blocked`. Do not re-arm after `milestone-complete` or `steady-state`.
  GitHub is read every tick and is never a trigger.

## Tick

1. **Wake.** Check `.loop/HALT`. Read `.loop/state.json`, the `ROADMAP.md`
   Milestone section and items, open issues in `Busy-Office-Codex/busy-office-ui`
   and `Busy-Office-Codex/busy-office-erp`, and the latest `gates` run on
   `main` (`gh run list -w gates -b main -L 1`). `git fetch`; start from an
   up-to-date local `main`.
2. **Select a batch** of at most 4 items, in this order:
   0. a failing `gates` run on `main` → fixing it is the whole batch;
   1. fixes requested on anything this loop handed off;
   2. `[ ]` items listed in the **current milestone** whose Accept is stated,
      whose "Needs" is met and whose linked issue (if any) is `agreed`, taking
      the lowest wave that still has open items.
   Items outside the current milestone are never selected. Skip one-way items
   (see Gate). No selectable item → the milestone check under Stops.
3. **Build in parallel.** Create the local batch branch `feat/m<N>-batch-<tick>`
   off `main`. Split the batch into waves: items that touch no common file
   form one wave; an item sharing a file with another waits for the next wave.
   - Each builder is a subagent in its **own git worktree** (Agent tool
     `isolation: "worktree"`, or `git worktree add ../busy-office-ui-wt/<item>
     -b feat/<item> <batch branch>`), with its own `pnpm install
     --frozen-lockfile`, `dist/` and local branch. At most 4 builders at once.
   - A builder commits its item on its own branch and runs only
     `pnpm typecheck`, `pnpm lint` and `pnpm test` there. It never runs
     `pnpm test:browser` (one fixed port), never pushes and never merges.
   - The main session merges each finished builder branch into the batch
     branch with `--no-ff`, resolves conflicts, and starts the next wave from
     the updated batch branch. Remove each worktree after merging it.
   - Never commit directly to `main`; never tag, release or publish; never
     push work branches or open PRs.
4. **Verify once, for the whole batch,** in the main checkout.
   - Run the full `AGENTS.md` gate suite on the batch head. Skip
     `pnpm security` when `package.json` and `pnpm-lock.yaml` are unchanged.
   - One fresh-context, read-only reviewer checks the whole batch diff against
     every item's Accept and against simplicity (dead code, props with one
     caller, duplication), and reports findings as a schema: one row per
     `item:acceptClause`, each starting FAIL and flipping to PASS only on
     cited evidence (test name, command result, SHA). Only when this batch
     closes the current milestone, fan the same diff out to three parallel
     reviewer lenses instead of one — spec-match, contrast/accessibility,
     simplicity-and-duplication — each reporting the same schema; a clause
     fails if any lens fails it. This costs more tokens but no extra
     wall-clock, since the lenses run concurrently.
   - A clause still FAIL after a fix-and-reverify round is one round short of
     the cap, not resolved by re-asking the same question. Cap fix-then-
     reverify at 2 rounds per batch: a clause still FAIL after round 2 has
     its item's merge reverted on the batch branch regardless of cause; the
     rest ships and that item's `attempts` goes up.
5. **Gate.** Classify each decision where it arises.
   - **Two-way** (internal implementation, tests, docs wording, examples,
     additive ARIA attributes): decide, note the reason in the merge commit
     message, continue.
   - **One-way** (removing or renaming public props, types or exports, new
     exports, package version, dependencies, behaviour an ERP host relies on,
     tags, releases, publishing, editing `intent.md`, the ROADMAP Objective or
     the Milestone section, closing issues): comment the proposal on a
     `[UI request]` issue as `proposed` and leave the item out of the batch.
     Never mark your own proposal `agreed`. "New exports" means a new
     top-level name importable from a package entry point (`Avatar`,
     `useSomething`) — a real, evidenced M10 miss (issue #25) caught this
     exactly, corrected before merge. Adding a new key to an *already*-
     exported token/style object (`color.dangerSubtle` alongside the
     already-exported `color`) is two-way, same as additive ARIA
     attributes above — real precedent, not just asserted: items 56 and 61
     both did this citing only their milestone's own agreed issue, and
     both cleared independent review on that basis. Removing or renaming
     an existing key on such an object is still one-way (covered by
     "removing or renaming... exports" above) — additions are cheap,
     subtractions are gated, the same asymmetry a minor-version bump
     already implies.
6. **Record.** Tick the closed items in `ROADMAP.md` on the batch branch.
   `git fetch`; rebase the batch branch onto `origin/main` if it moved; merge
   it into local `main` with `--no-ff`; push `main`; delete the local
   branches. The merge commit message lists the milestone, items closed, the
   net line change under `src/`, the two-way decisions taken and, when the
   release rule holds, a release recommendation. Post one `ready for
   integration` handoff per linked issue citing that merge commit's SHA. Write
   `.loop/state.json` last.

## Branches and releases

Solo Flow. Work branches (`feat/`, `fix/`, `chore/`) are local only: they come
off `main` and are merged back into `main` locally with `--no-ff`; only `main`
is pushed. No owner approval is needed to merge into `main` once verify
passes — merges into `main` are the normal outcome of a tick, not a release.
The loop never tags, releases or publishes — it recommends; the owner
approves.

**Recommend a release** when the latest `gates` run on `main` passed and at
least one holds:
- the current milestone just became complete;
- the ERP host needs a version to pin (an issue asks for one, or a handoff is
  `accepted`);
- a public export, prop or behaviour a host sees has changed since the last tag;
- 2 weeks have passed with unreleased commits since the last tag.

Version: patch for fixes only, minor for anything a host can see. A release is
an annotated tag on the `main` commit to release, pushed, with notes published
as a GitHub Release — nothing merges between branches to produce it:

```bash
git tag -a v<x.y.z> -m "<x.y.z>: <one-line summary>"
git push origin v<x.y.z>
```

Use the ephemeral `release/x.y.z` branch only when the version bump and notes
need more than one commit, or the owner wants to review them before they're
permanent; fast-forward `main` to include it, then tag. Tags are immutable —
a wrong tag gets a new patch version, never a moved tag.

## State

`.loop/state.json` is local (gitignored); merge commits on `main` and issue
comments are the durable record.

```json
{ "tick": 0, "milestone": "M1", "batch": [], "attempts": {}, "outcome": null,
  "meta": [], "sinceObjectiveReview": 0, "sha": null, "updatedAt": null }
```

`outcome` is one of `landed` · `handed-off` · `blocked` · `refused` · `reverted`
· `milestone-complete` · `steady-state` · `halted`. `meta` holds the last 5
ticks as `true` when the tick changed nothing under `src/`, `examples/`,
`preview/`, `test/` or `docs/`.

## Stops

- `.loop/HALT` exists.
- **Milestone complete** (its condition in `ROADMAP.md` holds after this tick's
  `gates` run passes) → record `milestone-complete`, recommend the release in
  an issue comment on the latest handoff, and stop re-arming until the owner
  changes the Milestone section.
- Every open item in the milestone is blocked or waiting on an issue → record
  `blocked`, comment what each needs on its issue, create `.loop/HALT` with
  the reason.
- An item reaches 2 attempts → `blocked` for that item; comment the evidence on
  its issue and leave it out of later batches.
- Two ticks in a row with no merge → `blocked`; create `.loop/HALT` with the
  reason.
- More than 1 of the last 5 ticks was meta → the next tick may only build items
  or stop.

## When the milestone is complete and no next one is set

Read `intent.md` and `ROADMAP.md`. Draft a next milestone of 2–4 items that pass
the Objective tests, each with an Accept, and open it as one `[UI request]`
issue with status `proposed`. Do not edit `intent.md`, the Objective or the
Milestone section, and do not start the proposal. Record `steady-state`.

**Every 10th tick:** before selecting, re-read `intent.md` against `ROADMAP.md`;
comment a `proposed` retirement on any item that serves no Objective test, and
name one export or prop that could be deleted. Never re-prioritise silently.
