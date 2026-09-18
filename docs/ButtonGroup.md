---
category: forms
tests:
  - test/browser/button-group.spec.ts
  - test/browser/compact-controls.spec.ts
  - test/components.test.ts
---

A small, fixed set of mutually-exclusive options rendered as one joined pill, not a row of separately-spaced capsules. `options` (`{ value, label, disabled?, ariaLabel? }[]`), `value` (the selected option's `value`), `onChange`. Implements the WAI-ARIA "radio group" pattern — the track is `role="radiogroup"` (labelled by the required `aria-label` prop), each segment is `role="radio"` with `aria-checked`, and only the selected segment is in the tab order (roving `tabindex`); Left/Up and Right/Down arrow keys both move focus and select the neighboring segment (wrapping at the ends, skipping `disabled` ones), Home/End jump to the first/last enabled segment, matching how a native `<input type="radio">` group behaves. The selected segment fills with the same dark-ink treatment as `Button`'s `primary` variant and filter `Chip`'s `selected` state — the one "this is active" look this design system already uses everywhere else. Height and font size come from the ambient `Density` tier, the same `controlHeight` alias `Button`/`Dropdown`'s trigger/filter `Chip` read. A `disabled` option stays visible (dimmed, per the shared 0.4-opacity convention) rather than being omitted — pair it with an `ariaLabel` (e.g. `"Dark — not available yet"`) when a segment is present but not yet usable, and a caption nearby explaining why. Not for navigation (tabs that change the page's content or URL — `Shell`'s app strip already covers that) or for more than a handful of options — past ~5, a wide joined pill reads worse than `Dropdown`.

```jsx
(() => {
  const [density, setDensity] = React.useState('comfortable');
  return (
    <ButtonGroup
      aria-label="Density"
      value={density}
      onChange={setDensity}
      options={[
        { value: 'compact', label: 'Compact' },
        { value: 'comfortable', label: 'Comfortable' },
        { value: 'spacious', label: 'Spacious', disabled: true, ariaLabel: 'Spacious — not available yet' },
      ]}
    />
  );
})()
```
