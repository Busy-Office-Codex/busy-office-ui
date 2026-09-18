import * as React from 'react';
import * as DesignSystem from '@busyoffice/design-system';
import { Shell } from '@busyoffice/design-system/shell';
import { ListReport } from '@busyoffice/design-system/examples/list-report';
import { RecordDetail } from '@busyoffice/design-system/examples/record-detail';
import { AppShell } from '@busyoffice/design-system/examples/app-shell';

// The real, built package — this is the only place docs-site imports it for demo purposes,
// and it goes through the documented `@busyoffice/design-system` / `/shell` / `/examples/*`
// subpaths, the same way any external host would. `ListReport`/`RecordDetail`/`AppShell` are
// here because their own docs (docs/ListReport.md, docs/RecordDetail.md, docs/AppShell.md) demo
// the sample-page composition, not a raw package component.
const SCOPE: Record<string, unknown> = { ...DesignSystem, Shell, ListReport, RecordDetail, AppShell };
const SCOPE_KEYS = Object.keys(SCOPE);
const SCOPE_VALUES = SCOPE_KEYS.map((key) => SCOPE[key]);

// M10 (issue #24): every component specimen used to render exactly one static state — whatever
// the doc's own fenced example happened to show, in whatever the browser's OS theme was at load.
// That capped the "themes" and "documentation/specimen usability" scoring dimensions for every
// component, since no specimen had ever actually been checked rendering in dark mode or under a
// non-default density tier. `Theme`/`Density`/`ButtonGroup` are the same real, exported package
// components a host would use for this — reused here, not reimplemented, the same "test through
// the real built package" rule the rest of this repo already follows for demos.
const { Theme, Density, ButtonGroup } = DesignSystem;

type ThemeChoice = 'system' | 'light' | 'dark';
type DensityChoice = 'compact' | 'comfortable' | 'spacious';

const THEME_OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const DENSITY_OPTIONS: { value: DensityChoice; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
];

export type LiveDemoProps = {
  /** A single compiled JS expression (see `src/lib/compileJsx.ts`), not raw JSX. */
  code: string;
};

/**
 * Hydrates a doc page's fenced code sample as a real, rendered instance of the component(s) it
 * names, with real theme/density toggle controls around it. `Theme`'s own contract (`src/
 * components/Theme.tsx`) has no `"system"` value — that's what omitting the wrapper already
 * means — so `"System"` here renders no `Theme` wrapper at all, mirroring `examples/AppShell.tsx`'s
 * own `ControlCenter`-driven `themed()` helper exactly, not a new pattern invented for docs-site.
 */
export function LiveDemo({ code }: LiveDemoProps) {
  const [theme, setTheme] = React.useState<ThemeChoice>('system');
  const [density, setDensity] = React.useState<DensityChoice>('comfortable');

  const element = React.useMemo<React.ReactNode>(() => {
    try {
      // eslint-disable-next-line no-new-func -- compiled at build time from a trusted, in-repo doc file.
      const factory = new Function(...SCOPE_KEYS, 'React', `return (${code});`);
      return factory(...SCOPE_VALUES, React) as React.ReactNode;
    } catch (error) {
      return React.createElement('pre', { role: 'alert' }, error instanceof Error ? error.message : String(error));
    }
  }, [code]);

  const themed = theme === 'system' ? element : <Theme value={theme}>{element}</Theme>;

  return (
    <div className="live-demo-wrapper">
      <div className="live-demo-controls" data-testid="live-demo-controls">
        <ButtonGroup aria-label="Theme" value={theme} onChange={(value) => setTheme(value as ThemeChoice)} options={THEME_OPTIONS} />
        <ButtonGroup aria-label="Density" value={density} onChange={(value) => setDensity(value as DensityChoice)} options={DENSITY_OPTIONS} />
      </div>
      <div className="live-demo">
        <Density value={density}>{themed}</Density>
      </div>
    </div>
  );
}
