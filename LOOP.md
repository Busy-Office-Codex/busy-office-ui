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
   `Busy-Office-Codex/busy-office-erp`. `git fetch`; start from `main`.
2. **Select a batch.** Take, in this order, until the batch holds 3 items:
   1. fixes requested on anything this loop handed off;
   2. open `[UI request]` issues marked `agreed`;
   3. `[ ]` ROADMAP items whose Accept is stated and whose "Needs" is met.
   Skip one-way items (see Gate) and items without a stated Accept. An empty
   batch goes to the empty-queue ladder.
3. **Build.** One branch `feat/batch-<first-item>` (or `chore/loop-…` for loop
   or roadmap files) off `main`, one commit per item. Items that touch
   different files run as parallel builder subagents (at most 3); items that
   share files run in sequence. Never commit to `main`, merge, tag, release or
   publish. While building, each builder runs only `pnpm typecheck`,
   `pnpm lint` and `pnpm test`.
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
     additive ARIA attributes): decide, note the reason in the PR body,
     continue.
   - **One-way** (removing or renaming public props, types or exports, new
     exports, package version, dependencies, behaviour an ERP host relies on,
     anything touching `main`, editing `intent.md` or the ROADMAP Objective,
     closing issues): comment the proposal on a `[UI request]` issue as
     `proposed` and leave the item out of the batch. Never mark your own
     proposal `agreed`.
6. **Record.** One PR per batch listing the items it closes and the net line
   change under `src/`. Post one `ready for integration` handoff per issue #1
   when every item's Accept passes. Tick the items in `ROADMAP.md` on the batch
   branch. Write `.loop/state.json` last.

## State

`.loop/state.json` is local (gitignored); PRs and issue comments are the durable
record.

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
