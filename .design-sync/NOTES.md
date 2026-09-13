# design-sync notes — @busyoffice/design-system

Repo-specific facts a future sync should not have to rediscover.

## Build / environment

- Package shape, no Storybook. Entry `dist/index.js` (build with `pnpm build`); `--node-modules ./node_modules`.
- pnpm does not hoist `playwright-core` to the top level, so `package-validate.mjs` cannot import `playwright` from the repo. Install the repo's own version into the staged dir: `(cd .ds-sync && npm i playwright@$(node -p "require('./node_modules/@playwright/test/package.json').version"))`. Chromium builds are cached at `~/Library/Caches/ms-playwright` (macOS default), not `~/.cache/ms-playwright`.
- Node 26 works (engines `>=22 <27`).

## Config decisions

- `dtsPropsFor` overrides exist because the extractor flattens `ChipProps` (a discriminated union — `tone`, `selected`, `onRemove` were lost), drops `disabled`/`onClick` from `Button`/`Card` (inherited HTML attrs), leaves `DropdownItem` undefined in `Dropdown.d.ts`, and explodes `Text.as` into 164 element names. Re-check after any prop-type change in `src/components/`.
- `docsMap` points the five Table sub-parts at `docs/Table.md` so they group under `data-display` with `Table` instead of `general`.
- Default `guidelinesGlob` (`docs/*.md`) also copies the per-component docs into `guidelines/`; harmless duplication, left as is.
- `overrides.Modal` is `cardMode: single`; the preview also wraps the Modal in a `transform: translateZ(0)` frame so the `position: fixed` overlay centres inside the card rather than the browser viewport.

## Previews

- Table sub-parts (`TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`) deliberately ship the floor card — they only make sense composed inside `Table`, whose preview covers them.
- Hover/pressed states are not captured (static render).
- `Modal` preview shows the initial focus ring on its first field: real behaviour (the component focuses the first focusable child on open), not an artefact.

## Known render warns

- (none outstanding after authoring — `[RENDER_BLANK] Input` and `[RENDER_THIN] Modal` were both resolved by authored previews)

## Re-sync risks

- `dtsPropsFor` bodies are hand-copied from `src/components/*.tsx`; a prop rename upstream will silently leave the design agent with a stale contract. Diff them against the sources on every re-sync.
- Fonts come from `fonts/ibm-plex-sans.css` via `extraFonts` (three Latin weights, 400/500/600). If the repo adds weights or italics, add them there too or designs fall back.
- The Playwright version pin in `.ds-sync/` must track `@playwright/test` in the repo lockfile, or the render check fails with "Executable doesn't exist".
- Verified with Chromium only.
