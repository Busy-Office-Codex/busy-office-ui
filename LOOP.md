# Loop playbook

The rules one unattended tick obeys in this repository. `AGENTS.md` holds the
engineering rules and gates; this file adds how a tick batches, stops and
records. Where they overlap, `AGENTS.md` wins.

**Aim: many small, lean changes per day.** Work, checks and review run once per
batch of items, not once per item. Simplicity wins every tie: the smallest
change that meets the Accept, deletion before addition, no new export without
an agreed request.

## Trigger

- **One driver:** a single Claude Code session in this checkout running the
  built-in `/loop` (self-paced) with the prompt `Run one tick of LOOP.md`.
  No cron entry, cloud routine, second session or the global `build-loop`
  skill drives this repo. Starting a second driver is a one-way change.
- **Kill switch:** if `.loop/HALT` exists, do nothing and end the tick. The
  owner deletes it to resume.
- **Cadence:** re-arm immediately after a handoff; wait at least 20 minutes
  only after `blocked` or `steady-state`. GitHub is read every tick and is
  never a trigger.

## Tick

1. **Wake.** Check `.loop/HALT`. Read `.loop/state.json`, `ROADMAP.md`, then
   open issues in `Busy-Office-Codex/busy-office-ui` and
   `Busy-Office-Codex/busy-office-erp`. `git fetch`; start from `develop`.
2. **Select a batch.** Take, in this order, until the batch holds 3 items:
   1. fixes requested on anything this loop handed off;
   2. open `[UI request]` issues marked `agreed`;
   3. `[ ]` ROADMAP items whose Accept is stated and whose "Needs" is met.
   Skip one-way items (see Gate) and items without a stated Accept. An empty
   batch goes to the empty-queue ladder.
3. **Build.** One branch `feat/batch-<first-item>` (or `chore/loop-…` for loop
   or roadmap files) off `develop`, one commit per item. Work branches stay
   local: never push them and never open PRs for them. Items that touch
   different files run as parallel builder subagents (at most 3); items that
   share files run in sequence. Never commit directly to `develop` or `main`,
   and never tag, release or publish. While building,
   each builder runs only `pnpm typecheck`, `pnpm lint` and `pnpm test`.
4. **Verify once, for the whole batch.**
   - Run the full `AGENTS.md` gate suite once on the batch head. Skip
     `pnpm security` when `package.json` and `pnpm-lock.yaml` are unchanged.
   - One fresh-context, read-only reviewer checks the whole batch diff against
     every item's Accept and against simplicity (dead code, props with one
     caller, duplication). Each Accept property starts FAIL and flips only on
     cited output (test name, command result, SHA).
   - If one item fails and cannot be fixed within the tick, revert its commit
     and ship the rest; that item's `attempts` goes up by one.
5. **Gate.** Classify each decision where it arises.
   - **Two-way** (internal implementation, tests, docs wording, examples,
     additive ARIA attributes): decide, note the reason in the merge commit
     message, continue.
   - **One-way** (removing or renaming public props, types or exports, new
     exports, package version, dependencies, behaviour an ERP host relies on,
     releases or anything touching `main`, editing `intent.md` or the ROADMAP
     Objective, closing issues): comment the proposal on a `[UI request]` issue as
     `proposed` and leave the item out of the batch. Never mark your own
     proposal `agreed`.
6. **Record.** Tick the items in `ROADMAP.md` on the batch branch. When the
   gate suite and the reviewer both pass, `git fetch`, rebase the batch branch
   onto `origin/develop` if it moved, merge it into local `develop` with
   `--no-ff`, push `develop`, and delete the local branch. The merge commit
   message lists the items closed, the net line change under `src/`, the
   two-way decisions taken and, if the release rule below now holds, a
   release recommendation. Post one `ready for integration` handoff per
   issue #1 citing that merge commit's SHA. Write `.loop/state.json` last.

## Branches and releases

Gitflow. Work branches (`feat/`, `fix/`, `chore/`) are local only: they come
off `develop` and are merged back into `develop` locally with `--no-ff`; only
`develop` is pushed. No owner approval is needed to merge into `develop` once
verify passes. `main` only receives release merges, and the loop never merges
into `main`, tags or releases — it recommends.

**Recommend a release** when `develop` is green and at least one holds:
- the ERP host needs a version to pin (an issue asks for one, or a handoff is
  `accepted`);
- a public export, prop or behaviour a host sees has changed since the last tag;
- 3 or more ROADMAP items have closed since the last tag;
- 2 weeks have passed with unreleased commits on `develop`.

Version: patch for fixes only, minor for anything a host can see. A release is
`release/x.y.z` from `develop` → version bump and notes → merge into `main`
with the owner's OK → tag `vx.y.z` → merge `main` back into `develop`.

## State

`.loop/state.json` is local (gitignored); merge commits on `develop` and issue
comments are the durable record.

```json
{ "tick": 0, "batch": [], "attempts": {}, "outcome": null, "meta": [],
  "sinceObjectiveReview": 0, "sha": null, "updatedAt": null }
```

`outcome` is one of `landed` · `handed-off` · `blocked` · `refused` · `reverted`
· `steady-state` · `halted`. `meta` holds the last 5 ticks as `true` when the
tick changed nothing under `src/`, `examples/`, `preview/`, `test/` or `docs/`.

## Stops

- `.loop/HALT` exists.
- The ROADMAP "Done for this roadmap" condition holds → `steady-state`; do not
  re-arm until `ROADMAP.md` or `intent.md` changes.
- An item reaches 2 attempts → `blocked`; comment the evidence on its issue and
  leave it out of later batches.
- Two ticks in a row with no handoff → `blocked`; create `.loop/HALT` with the
  reason.
- More than 1 of the last 5 ticks was meta → the next tick may only build items
  or record `steady-state`.

## When no item is dispatchable

1. If the "Done for this roadmap" condition holds, record `steady-state` and
   stop re-arming.
2. Otherwise read `intent.md` and `ROADMAP.md`. Draft 1–3 items that pass the
   Objective tests, each with an Accept and the test it serves. Open one
   `[UI request]` issue per item with status `proposed`. Do not edit
   `intent.md` or the Objective, and do not mark proposals agreed.
3. Build the proposals that are two-way as one batch. Leave the rest
   `proposed`.
4. If none qualifies, spend one tick on a bounded investigation that writes a
   finding into an issue comment, no code, and record `steady-state`.

**Every 10th tick:** before selecting, re-read `intent.md` against `ROADMAP.md`;
comment a `proposed` retirement on any item that serves no Objective test, and
name one export or prop that could be deleted. Never re-prioritise silently.
