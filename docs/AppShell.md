---
category: sample-page
tests:
  - test/app-shell-navigation.test.ts
  - test/browser/app-shell-fallback.spec.ts
  - test/browser/shell-focus.spec.ts
  - test/browser/shell-scroll-chrome.spec.ts
  - test/browser/shell-chrome-color.spec.ts
  - test/browser/control-center.spec.ts
  - test/browser/dock-badge.spec.ts
  - test/browser/notification-button.spec.ts
---

`examples/AppShell.tsx`, published as the preview-only `@busyoffice/design-system/examples/app-shell` subpath — a sample host composition over the real, exported `Shell` (`@busyoffice/design-system/shell`; see `docs/Shell.md`), with sample modules, pinned apps, commands and `Launcher` wired in as the home slot. Mirrors `templates/erp-skeleton`'s "Shell anatomy": command bar, module-aware app strip, content, floating dock, launcher — no sidebar. Not for a Claude Design canvas template — its command palette and launcher toggle are real `useState`/`useEffect` interactions; use it as a buildable page composition, not a static template. **Preview-only**: `Shell` is the production contract this repo publishes; `AppShell` is a sample host built on top of it so a consuming host has a concrete, on-brand starting point to read and adapt, not something to import into a real application as-is.

All props are optional — `<AppShell />` alone renders a complete, self-contained sample: its own internal route registry (every module's `NAV` entries), `module="General"`, `active="Home"`, and `Launcher` as its page content (both `children` and `Shell`'s separate `home` slot default to it — see below). A host wires its own real navigation and page content through `navigation`/`children` instead:

- **`module`** (`AppShellModule`, default `'General'`) / **`active`** (`string`, default `'Home'`): which module's app-strip siblings show, and which one starts active, when `navigation` is omitted.
- **`children`**: page content to render in `Shell`'s content area for the active route — defaults to `<Launcher />` when omitted, the same default `Shell`'s separate `home` slot always uses (Control Center's Density/Theme selections reach both, since `Shell` keeps them as two distinct subtrees, never merged into one).
- **`navigation`** (`{ routes, activeRouteId, onNavigate }`): host-controlled routing. Omit it for the self-contained sample built from this file's own module map; pass it to drive the app strip, dock and command palette's "Pages" group from real host routes instead. Commands/counts stay sample data regardless — a host supplies its own real ones through `Shell`'s own `commands`/`pinned` props if it renders `Shell` directly rather than through this composition.

Also demonstrates, as real (not illustrative) interactions: the command bar's ⌘K/Ctrl+K listener opening a real command palette (search, category filter, keyboard-run commands), the floating dock's launcher tile mounting `Launcher.tsx` as content, and a Control Center popover driving the ambient `Density` tier and `Theme` appearance (`'system'` default — see `docs/Theme.md`) for the whole subtree.

```jsx
<AppShell />
```
