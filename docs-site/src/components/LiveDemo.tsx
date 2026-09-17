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

export type LiveDemoProps = {
  /** A single compiled JS expression (see `src/lib/compileJsx.ts`), not raw JSX. */
  code: string;
};

/** Hydrates a doc page's fenced code sample as a real, rendered instance of the component(s) it names. */
export function LiveDemo({ code }: LiveDemoProps) {
  const element = React.useMemo<React.ReactNode>(() => {
    try {
      // eslint-disable-next-line no-new-func -- compiled at build time from a trusted, in-repo doc file.
      const factory = new Function(...SCOPE_KEYS, 'React', `return (${code});`);
      return factory(...SCOPE_VALUES, React) as React.ReactNode;
    } catch (error) {
      return React.createElement('pre', { role: 'alert' }, error instanceof Error ? error.message : String(error));
    }
  }, [code]);

  return React.createElement('div', { className: 'live-demo' }, element);
}
