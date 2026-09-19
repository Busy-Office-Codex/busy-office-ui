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

// A doc's own fenced sample often renders `Text variant="heading"`/`"title"`/`"display"` with no
// `as` override, which `Text.tsx`'s own default element map turns into a real `<h1>`/`<h2>`/`<h3>`
// (see `docs/Card.md`'s "Open orders"/"128" pair). On [id].astro that's harmless — one demo per
// page, sitting after that page's own "Live demo" heading. On the /components/ gallery, many
// tiles' demos share one page inside a real category/tile heading structure, and those same demo
// headings land at the same rank as the page's real navigational headings — a screen reader's
// heading list (NVDA/JAWS "H", VoiceOver rotor) ends up mixing in sample content like "128"
// alongside real section titles. `neutralizeHeadings` (below) swaps in a `Text` that keeps every
// variant's real font styling but renders heading variants as a plain `<span>` instead, for
// exactly that aggregate context — [id].astro's own single-demo usage doesn't pass it, so its
// behavior there is unchanged.
const HEADING_VARIANTS = new Set(['display', 'heading', 'title']);
function NeutralHeadingText({ variant, as, ...rest }: DesignSystem.TextProps) {
  const resolvedAs = as ?? (variant && HEADING_VARIANTS.has(variant) ? 'span' : undefined);
  return <DesignSystem.Text variant={variant} as={resolvedAs} {...rest} />;
}
const NEUTRAL_SCOPE: Record<string, unknown> = { ...SCOPE, Text: NeutralHeadingText };
const SCOPE_KEYS = Object.keys(SCOPE);
const SCOPE_VALUES = SCOPE_KEYS.map((key) => SCOPE[key]);
const NEUTRAL_SCOPE_VALUES = SCOPE_KEYS.map((key) => NEUTRAL_SCOPE[key]);

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
  /** See the comment on `NeutralHeadingText` above — pass `true` on a page that renders more than
   * one `LiveDemo` sharing a real heading structure (the /components/ gallery); leave it off (the
   * default) on a page like [id].astro with exactly one demo of its own. */
  neutralizeHeadings?: boolean;
};

/**
 * Hydrates a doc page's fenced code sample as a real, rendered instance of the component(s) it
 * names, with real theme/density toggle controls around it. `Theme`'s own contract (`src/
 * components/Theme.tsx`) has no `"system"` value — that's what omitting the wrapper already
 * means — so `"System"` here renders no `Theme` wrapper at all, mirroring `examples/AppShell.tsx`'s
 * own `ControlCenter`-driven `themed()` helper exactly, not a new pattern invented for docs-site.
 */
export function LiveDemo({ code, neutralizeHeadings }: LiveDemoProps) {
  const [theme, setTheme] = React.useState<ThemeChoice>('system');
  const [density, setDensity] = React.useState<DensityChoice>('comfortable');

  // The sample is rendered as its OWN component, not as an element built during this component's
  // render. That distinction is load-bearing: a doc sample may call hooks (docs/Modal.md and
  // docs/ButtonGroup.md both use `React.useState` to be self-contained), and evaluating it inside a
  // `useMemo` here registered those hooks against *LiveDemo's* hook list on the first render only.
  // The memo never re-ran, so the sample's own `setState` dropped the hook count and React threw
  // #300 "Rendered fewer hooks than expected", killing the island — found live: clicking the Modal
  // sample's trigger, or the ButtonGroup sample's own density segments, crashed the demo silently.
  // Calling the factory inside `DocSample`'s render puts the sample's hooks where they belong, so
  // its state updates re-render just the sample.
  const DocSample = React.useMemo(() => {
    const values = neutralizeHeadings ? NEUTRAL_SCOPE_VALUES : SCOPE_VALUES;
    return function DocSample() {
      try {
        // eslint-disable-next-line no-new-func -- compiled at build time from a trusted, in-repo doc file.
        const factory = new Function(...SCOPE_KEYS, 'React', `return (${code});`);
        return factory(...values, React) as React.ReactNode;
      } catch (error) {
        // Keeps the visible-alert contract `docs-site/scripts/check-live-demos.mjs` greps for, on
        // the server-rendered pass as well as in the browser.
        return React.createElement('pre', { role: 'alert' }, error instanceof Error ? error.message : String(error));
      }
    };
  }, [code, neutralizeHeadings]);

  const element = <DocSample />;
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
