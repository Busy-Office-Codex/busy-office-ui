---
category: layout
tests:
  - test/color-contrast.test.ts
  - test/components.test.ts
  - test/browser/theme-contrast.spec.ts
---

Forces a color mode — `value="light" | "dark"` — on its subtree, regardless of the viewer's OS `prefers-color-scheme`. This is the opt-in half of real dark/light/system theming (ROADMAP item 19): every `color.*` token (`bgCanvas`, `bgSurface`, `textPrimary`, `accent`, …) already carries a light default and a `@media (prefers-color-scheme: dark)` override, so a host that renders no `Theme` at all already gets correct light/dark behavior for free, following the system setting — that is what "system" means here, not a third value of this prop. `Theme` exists only for the host that wants to override the system setting for one region: pin a screen to `dark` inside an otherwise-light app, force `light` for a printable/exported view, or similar. Not for per-component styling — there is no palette beyond light/dark, no per-component color override prop, and no persistence of a host's choice across sessions; a host that wants to remember a visitor's forced choice owns that storage itself, the same as it owns any other view preference. Tiers nest the same way `Density` does — the nearest `Theme` ancestor wins.

Known gaps, disclosed rather than silently dropped: this covers the `color.*` token group only. Most of `examples/*.tsx`'s own sample screens use plain inline hex literals (never StyleX), so they will not visually follow dark mode even though every real `src/` component does — but not all of them: `examples/ControlCenter.tsx` genuinely imports `glass`/`shadow` from `tokens.stylex.ts` directly (the same StyleX tokens `Modal` and `Dropdown` use), so it shares their gap below rather than the inline-hex one. `Modal`'s backdrop/panel, `Dropdown`'s menu popover, and `ControlCenter`'s own popover all read the `glass.*` token group (M10 Dropdown scoring, issue #24: re-verified directly — `glass` is a plain `stylex.defineVars` with no `@media (prefers-color-scheme: dark)` branch at all, unlike `color.*`), so all three stay a frozen light-glass panel regardless of theme; `shadow.*` is the same shape. `Shell`'s own chrome has a related but distinct gap — its command bar/app-strip use hardcoded translucent `rgba()` literals directly, not the `glass` tokens at all. Theming `glass`/`shadow` for real is a separate, larger token-group decision outside this component's scope — this file only names the gap, not a plan to close it.

```jsx
<Theme value="dark">
  <Card>
    <Text variant="title">Always dark, regardless of system setting</Text>
    <Button variant="primary">Continue</Button>
    <Theme value="light">
      <Card>
        <Text variant="caption">A nested light region — the nearest Theme always wins</Text>
      </Card>
    </Theme>
  </Card>
</Theme>
```
