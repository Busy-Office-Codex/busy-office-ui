# Loop playbook

The rules one unattended tick obeys in this repository. `AGENTS.md` holds the
engineering rules and gates; this file only adds how a tick selects, stops and
records. Where they overlap, `AGENTS.md` wins.

## Trigger

- **One driver:** a single Claude Code session in this checkout running the
  built-in `/loop` (self-paced) with the prompt `Run one tick of LOOP.md`.
  No cron entry, cloud routine, second session or the global `build-loop`
  skill drives this repo. Starting a second driver is a one-way change.
- **Kill switch:** if `.loop/HALT` exists, do nothing and end the tick. The
  owner deletes it to resume. Idle waits between ticks are at least 20 minutes.
- GitHub is read every tick and is never a trigger.

## Tick

1. **Wake.** Check `.loop/HALT`. Read `.loop/state.json`, then `ROADMAP.md`,
   then open issues in `Busy-Office-Codex/busy-office-ui` and
   `Busy-Office-Codex/busy-office-erp`. `git fetch` and start from `main`.
2. **Select, first match wins.**
   1. A comment on an issue this loop handed off asks for a fix → that fix.
   2. An open `[UI request]` issue marked `agreed` → that request.
   3. The first `[ ]` ROADMAP item whose Accept is stated and whose "Needs"
      is met → that item.
   4. None → the empty-queue ladder below.
   Items without a stated Accept are not dispatchable; sharpen them as a
   proposal instead.
3. **Act.** One item per tick, on branch `feat/<item>` (or `chore/loop-<item>`
   for loop/roadmap files) off `main`. At most 3 subagents per tick. Never
   commit to `main`, merge, tag, release or publish.
4. **Verify.** Run the `AGENTS.md` gate suite; then a fresh-context, read-only
   reviewer checks the diff against the item's Accept. Every Accept property
   starts FAIL and flips only on cited output (test name, command result, SHA).
5. **Gate.** Classify each decision where it arises.
   - **Two-way** (internal implementation, tests, docs wording, examples):
     decide, record the reason in the PR body, continue.
   - **One-way** (public props, types or export map, package version,
     dependencies, behaviour an ERP host relies on, anything touching `main`,
     editing `intent.md` or the ROADMAP Objective, closing issues): comment the
     proposal on a `[UI request]` issue as `proposed`, stop that item, and
     select other work next tick. Never mark your own proposal `agreed`.
6. **Record.** Open or update the PR, post the `ready for integration` handoff
   per issue #1 when every Accept property passes, then write
   `.loop/state.json` last.

## State

`.loop/state.json` is local (gitignored); PRs and issue comments are the durable
record.

```json
{ "tick": 0, "item": null, "attempts": 0, "outcome": null, "meta": [],
  "sinceObjectiveReview": 0, "sha": null, "updatedAt": null }
```

`outcome` is one of `landed` · `handed-off` · `blocked` · `refused` · `reverted`
· `steady-state` · `halted`. `meta` holds the last 5 ticks as `true` when the
tick changed nothing under `src/`, `examples/`, `preview/`, `test/` or `docs/`.

## Stops

- `.loop/HALT` exists.
- The ROADMAP "Done for this roadmap" condition holds → `steady-state`; do not
  re-arm until `ROADMAP.md` or `intent.md` changes.
- Two failed attempts on the same item → `blocked`, comment the evidence on its
  issue, select other work.
- Two ticks in a row with no commit and no handoff → `blocked`, create
  `.loop/HALT` with the reason.
- More than 1 of the last 5 ticks was meta → the next tick may only do item
  work or record `steady-state`.

## When no item is dispatchable

1. If the "Done for this roadmap" condition holds, record `steady-state` and
   stop re-arming.
2. Otherwise read `intent.md` and `ROADMAP.md`. Draft 1–3 items that pass the
   Objective tests, each with an Accept and the test or clause it serves. Open
   one `[UI request]` issue per item with status `proposed`. Do not edit
   `intent.md` or the Objective, and do not mark proposals agreed.
3. Start the first proposal that changes no public prop, type, export, version
   or dependency, on a `feat/` branch. Leave the rest `proposed`.
4. If none qualifies, spend one tick on a bounded investigation that writes a
   finding into an issue comment, no code, and record `steady-state`.

**Every 10th tick:** before selecting, re-read `intent.md` against `ROADMAP.md`;
comment a `proposed` retirement on any item that serves no Objective test. Never
re-prioritise silently.
