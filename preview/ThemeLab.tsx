import { Theme, color } from '../src/index.js';

/**
 * A dedicated preview route (`/#theme-lab`, see client.tsx) for `test/browser/theme-contrast
 * .spec.ts` (M10 Theme scoring, issue #24). `Theme.tsx`'s own docstring claims nesting works the
 * same way `Density`'s already-tested nesting does — "a `dark`-forced region can still contain a
 * `light`-forced region inside it" — but no existing test anywhere actually nests one `Theme`
 * inside another; this page exists purely to give that claim a real, addressable element to check
 * against, the same reason `DensityLab.tsx` exists for `Density`'s own nesting tests.
 */
export function ThemeLab() {
  return (
    <div style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
      <Theme value="dark">
        <div data-testid="outer-dark" style={{ background: color.bgCanvas, padding: 24 }}>
          Outer dark region
          <Theme value="light">
            <div data-testid="inner-light" style={{ background: color.bgCanvas, padding: 24 }}>
              Inner light region
            </div>
          </Theme>
        </div>
      </Theme>
    </div>
  );
}
