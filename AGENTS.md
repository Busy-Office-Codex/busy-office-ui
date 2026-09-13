# Busy Office UI — Agent Instructions

Coordination with the ERP/core session runs through GitHub Issues per
[busy-office-ui#1](https://github.com/Busy-Office-Codex/busy-office-ui/issues/1),
the canonical protocol. Check open requests there (and ERP-side requests marked
ready for integration) before selecting work, and hand off completed work with
the exact reviewed commit SHA and test evidence per that issue's lifecycle. Do
not duplicate its rules here.

This repository owns the reusable `@busyoffice/design-system` package and its
pure React example compositions. It does not own ERP business rules, application
data, runtime, contracts, identity, permissions, deployment, or marketplace
behavior, and must not depend on a parent ERP repository at runtime.

Keep the package's public export map stable unless a reviewed versioned package
release changes it. Consumers import only the documented package and example
subpaths; UI examples are illustrative compositions only and must not connect to
ERP services or encode application-specific behavior here.

Before nontrivial work read intent.md, ARCHITECTURE.md, ROADMAP.md and relevant
UI specifications. Map acceptance to tests before implementation and keep a
separate reviewer (one per batch of changes is enough); do not expand the
UI/framework boundary. Keep the framework lean: prefer the smallest change,
deletion over addition, and no prop or export with a single caller. New components and
props must pass the ROADMAP.md Objective tests. Unattended or repeated runs
follow [LOOP.md](LOOP.md).

Write acceptance as the property a test checks, not the value you expect. A new
check lands with a red-proof: show it failing on a planted defect in its commit message. A
check that cannot run must fail, not skip. Assert removals on structure (element,
role, attribute), not on raw text. Every behaviour a `docs/*.md` page claims has
a test; prop lists come from the built `.d.ts`, not from hand-written tables.

Branches follow Solo Flow (trunk-based — one writer, no other humans
committing, so no `develop`/`main` split to coordinate): work branches come
off `main`, stay local (not pushed, no PRs) and are merged into `main` locally
with `--no-ff`. Never commit directly to `main`. Merging into `main` needs no
owner approval once the gates and an independent review pass — that is the
normal outcome of a tick, not a release; tags, releases and publishing need
the owner. Handoffs cite the `main` merge commit SHA. Every push to `main`
re-runs the full gate suite in GitHub Actions (`.github/workflows/gates.yml`);
a red run on `main` is fixed before any other work. Release rules are in
[LOOP.md](LOOP.md).

Use [docs/design-conventions.md](docs/design-conventions.md) and the component
sources before changing UI. Only this repository's writers may change its source
or release files. Run `pnpm build`, `pnpm lint`, `pnpm typecheck`, and `pnpm test`
plus `pnpm security`, `pnpm build:preview` and relevant `pnpm test:browser`
checks before handing off a change. Validate a fresh checkout with
`pnpm install --frozen-lockfile`. The core session integrates reviewed commit pins;
do not edit its ERP submodule checkout or infer merge/release/deploy permission.
