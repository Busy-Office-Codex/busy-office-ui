import type { ShellBreadcrumb } from '../src/shell/index.js';

// Issue #20 (agreed, project owner, 2026-09-16): shared by exactly Shell's own two named
// breadcrumbs consumers, RecordDetail.tsx and Requisitions.tsx — internal to `examples/`, not a
// new package export (same category as `examples/filterTabs.tsx`/`examples/checkboxStyles.ts`).
//
// Neither consumer renders a `Shell` of its own to pass the real `breadcrumbs` prop into: both
// are plain content panes mounted as `children` under the single shared AppShell/Shell instance
// `preview/client.tsx` owns (see examples/Analytics.tsx's own header comment on why content
// panes in this app are deliberately route-agnostic, with no way to reach upward into that
// instance). Threading per-route breadcrumb data through AppShell's whole registry for just these
// two routes would be a materially bigger, disproportionate change than "a prop and a small
// render region" — so each page renders its own trail directly, as real page content, reusing
// Shell's own exported `ShellBreadcrumb` shape (`src/shell/index.ts`) for the data contract and
// this file for the rendering, rather than duplicating both across two files. Deliberately the
// same visual/accessible contract as `ShellBreadcrumbTrail` in `src/shell/Shell.tsx` (WAI-ARIA
// `nav[aria-label="Breadcrumb"]` > `ol` > `li`, last entry `aria-current="page"`, non-interactive)
// — implemented separately rather than shared, since one lives in the package's public component
// tree and this one is example-only, the same boundary `docs/design-conventions.md`'s "Where the
// truth lives" draws between `src/` and `examples/`.
export function BreadcrumbTrail({ items }: { items: readonly ShellBreadcrumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, margin: 0, padding: 0, listStyle: 'none' }}>
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {crumb.onClick && !isLast ? (
                <button
                  type="button"
                  onClick={crumb.onClick}
                  style={{
                    fontFamily: 'inherit',
                    fontSize: 12.5,
                    color: '#475569',
                    background: 'none',
                    border: 0,
                    padding: 0,
                    cursor: 'pointer',
                  }}
                >
                  {crumb.label}
                </button>
              ) : (
                // Unconditional for the last entry even if it was given an onClick — matching
                // ShellBreadcrumbTrail's own contract (src/shell/Shell.tsx): "here" is never a
                // button, regardless of what data a host passes.
                <span
                  aria-current={isLast ? 'page' : undefined}
                  style={{ fontSize: 12.5, color: isLast ? '#0f172a' : '#475569', fontWeight: isLast ? 600 : undefined }}
                >
                  {crumb.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" style={{ color: '#64748b', fontSize: 12.5 }}>
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
