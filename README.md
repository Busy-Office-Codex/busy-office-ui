# Busy Office UI

This repository packages the reusable `@busyoffice/design-system` React
components, StyleX stylesheet, fonts, and pure reference page compositions.

## Public imports

```ts
import { Button, Card, Text } from '@busyoffice/design-system';
import '@busyoffice/design-system/styles.css';
import { AppShell } from '@busyoffice/design-system/examples/app-shell';
```

The existing example guide remains at [examples/README.md](examples/README.md).
Use [docs/design-conventions.md](docs/design-conventions.md) as the canonical
component-composition guide.

## Local checks

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm test:browser
pnpm security
pnpm build:preview
pnpm preview
```

The loopback-only preview at `http://127.0.0.1:4174` renders a sample host with
the existing AppShell, ListReport, and RecordDetail compositions. Its data and
interactions are illustrative and do not connect to ERP services.

`pnpm test:browser` starts the standalone preview automatically. Set
`BUSYOFFICE_UI_PREVIEW_BASE_URL` only when an integration suite intentionally
supplies another compatible preview host.

When a package store is already warm, `pnpm install --frozen-lockfile --offline`
also avoids registry access.
