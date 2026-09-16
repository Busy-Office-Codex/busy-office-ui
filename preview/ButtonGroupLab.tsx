import { useState } from 'react';
import { ButtonGroup } from '../src/index.js';

/**
 * A dedicated preview route (`/#button-group-lab`, see client.tsx) for
 * `test/browser/button-group.spec.ts`'s disabled-segment keyboard contract (docs/ButtonGroup.md:
 * arrow-key navigation "skipping `disabled` ones"). Until wiring the real `Theme` component to
 * `examples/ControlCenter.tsx`'s Appearance control (ROADMAP item 36's own disclosed follow-up,
 * issue #19), that Appearance `ButtonGroup` — Dark/System rendered `disabled` while real theming
 * wasn't wired up yet — was this contract's only real call site anywhere in `examples/`. Making
 * every Appearance segment a genuine, enabled option (the whole point of that change) left
 * `disabled` with no real consumer left to test against live, so this harness exists purely to
 * keep that contract exercised in a real browser. Same reasoning and non-shipped status as
 * `DensityLab.tsx`/`ShellBreadcrumbsLab.tsx`: not part of the package's public example set
 * (`examples/`) and not wired into `package.json`'s `exports`.
 */
export function ButtonGroupLab() {
  const [value, setValue] = useState<'enabled' | 'skip-1' | 'skip-2'>('enabled');

  return (
    <div style={{ padding: 24 }}>
      <ButtonGroup
        aria-label="Lab options"
        value={value}
        onChange={(next) => setValue(next as 'enabled' | 'skip-1' | 'skip-2')}
        options={[
          { value: 'enabled', label: 'Enabled' },
          { value: 'skip-1', label: 'Skip 1', disabled: true, ariaLabel: 'Skip 1 — disabled for this test' },
          { value: 'skip-2', label: 'Skip 2', disabled: true, ariaLabel: 'Skip 2 — disabled for this test' },
        ]}
      />
    </div>
  );
}
