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
separate reviewer; do not expand the UI/framework boundary.

Use [docs/design-conventions.md](docs/design-conventions.md) and the component
sources before changing UI. Only this repository's writers may change its source
or release files. Run `pnpm build`, `pnpm lint`, `pnpm typecheck`, and `pnpm test`
plus `pnpm security`, `pnpm build:preview` and relevant `pnpm test:browser`
checks before handing off a change. Validate a fresh checkout with
`pnpm install --frozen-lockfile`. The core session integrates reviewed commit pins;
do not edit its ERP submodule checkout or infer merge/release/deploy permission.
