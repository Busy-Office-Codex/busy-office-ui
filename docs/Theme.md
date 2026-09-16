---
category: layout
tests:
  - test/color-contrast.test.ts
  - test/components.test.ts
  - test/browser/theme-contrast.spec.ts
---

Forces a color mode — `value="light" | "dark"` — on its subtree, regardless of the viewer's OS `prefers-color-scheme`. This is the opt-in half of real dark/light/system theming (ROADMAP item 19): every `color.*` token (`bgCanvas`, `bgSurface`, `textPrimary`, `accent`, …) already carries a light default and a `@media (prefers-color-scheme: dark)` override, so a host that renders no `Theme` at all already gets correct light/dark behavior for free, following the system setting — that is what "system" means here, not a third value of this prop. `Theme` exists only for the host that wants to override the system setting for one region: pin a screen to `dark` inside an otherwise-light app, force `light` for a printable/exported view, or similar. Not for per-component styling — there is no palette beyond light/dark, no per-component color override prop, and no persistence of a host's choice across sessions; a host that wants to remember a visitor's forced choice owns that storage itself, the same as it owns any other view preference. Tiers nest the same way `Density` does — the nearest `Theme` ancestor wins.

```jsx
<Theme value="dark">
  <Card>
    <Text variant="title">Always dark, regardless of system setting</Text>
    <Button variant="primary">Continue</Button>
  </Card>
</Theme>
```
