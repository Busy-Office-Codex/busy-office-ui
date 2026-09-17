import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, Chart, type ChartSeries, Chip, type ChipTone, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { color, space } from '../src/tokens.stylex.js';
import { appStore } from './data/appStore.js';
import { useStoreState } from './data/store.js';
import { materialsStockedByWarehouse } from './data/types.js';

/**
 * A report/dashboard-definition builder (ROADMAP M7's ERP reference-app initiative, Slice 13,
 * Builder) — "the brief's other named Slice 6 target", per BuilderScreens.tsx's own header
 * comment, which deliberately left it unbuilt: neither pre-existing NAV.Builder placeholder
 * ('Fields', 'Publish') fits a report/dashboard designer. This slice resolves that disclosed gap
 * by adding a NEW NAV.Builder entry, 'Reports & dashboards', rather than force-fitting it into a
 * placeholder meant for something else.
 *
 * Same architecture as BuilderScreens.tsx (add/remove a widget, real "Unsaved changes" state, a
 * real Preview render, Save, reopen a different definition and come back) — this is the same
 * "open definition → modify → validate → preview → save → reopen" journey, applied to a
 * report/dashboard layout instead of a page layout. State lives in this component only, not the
 * shared examples/data store, for the exact reason BuilderScreens.tsx already draws that
 * boundary: report/dashboard LAYOUT definitions are Builder/UI-configuration territory, a
 * different bounded concern from the ERP transactional data the shared store owns.
 *
 * The widget palette (KPI stat / Bar chart / Line chart / Donut chart / Table) mirrors the real
 * `Chart` component's own `type` union ('bar' | 'line' | 'donut') plus the two non-chart shapes
 * Dashboard.tsx/Inventory.tsx already compose with it — a plausible reflection of what this
 * package's own components could render, not an invented taxonomy.
 *
 * Preview renders a REAL `Chart`/`Table` against REAL data (ROADMAP item 34's "Reports" slice,
 * 2026-09-17) for the 5 widgets `SEED_DEFINITIONS` already names — each backed by the exact same
 * fact another real screen already states, not a sixth invented aggregation: "Revenue this
 * month"/"Revenue trend" mirror Dashboard.tsx's own $486K/6-month-trend figures (kept as a
 * literal, deliberately not a cross-screen import between two otherwise-independent example
 * compositions — same "duplicate the literal, disclose the sync obligation" convention
 * `Chart.tsx`'s own `PALETTE` already uses against `tokens.stylex.ts`); "Stock by warehouse"/
 * "Stock mix by warehouse" read live `stockLevels` from the shared store, the same aggregation
 * Inventory.tsx's own "stock by warehouse" bar chart computes; "Open requisitions" reads live
 * `pending_approval` requisitions from the same store Requisitions.tsx owns. A widget added from
 * the palette during this session (an invented "New bar chart" with no real backing fact) still
 * renders the original structural placeholder — there is nothing real to compute for a label
 * nobody defined, and inventing one would be exactly the "second number for the same fact"
 * problem this initiative's other slices have deliberately avoided throughout.
 *
 * Naming note: 'Reports & dashboards' shares the word "Reports" with NAV.Finance's own
 * still-unbuilt 'Reports' placeholder — like 'Users' / 'Users and roles' before it (see
 * AppShell.tsx's NAV.Administration comment), a plain `/^Reports\b/` selector would be ambiguous
 * if Finance's placeholder is ever built too; use the same `\s+[A-Z]` (hint-anchored) selector
 * this codebase already relies on for that case. This was also preview/client.tsx's 32nd and, at
 * the time, final route: `SHELL_MAX_ROUTES` (`src/shell/Shell.tsx`) was a hard cap at exactly 32
 * — raised to 40 (owner-directed, 2026-09-16) once the Finance module and BI explore (both
 * still-open issue #16 consumers needing their own new routes) made the exact-32 ceiling a real
 * blocker, not a hypothetical one.
 */

type WidgetType = 'KPI stat' | 'Bar chart' | 'Line chart' | 'Donut chart' | 'Table';

type Widget = { id: string; type: WidgetType; label: string };

type ReportDefinition = { id: string; name: string; widgets: Widget[] };

const WIDGET_TONE: Record<WidgetType, ChipTone> = {
  'KPI stat': 'neutral',
  'Bar chart': 'strong',
  'Line chart': 'strong',
  'Donut chart': 'strong',
  Table: 'accent',
};

const PALETTE: WidgetType[] = ['KPI stat', 'Bar chart', 'Line chart', 'Donut chart', 'Table'];

// Widget labels reuse facts and figures already established elsewhere (Dashboard.tsx's own
// "Revenue trend"/"REVENUE THIS MONTH", Inventory.tsx's stock-by-warehouse bar+donut,
// Requisitions.tsx's own worklist) — the same "the fact already exists elsewhere, name it the
// same way" discipline every slice in this initiative has used, not a second, disconnected cast
// of invented report names.
const SEED_DEFINITIONS: Record<string, ReportDefinition> = {
  'sales-performance': {
    id: 'sales-performance',
    name: 'Sales performance report',
    widgets: [
      { id: 'w-1', type: 'KPI stat', label: 'Revenue this month' },
      { id: 'w-2', type: 'Line chart', label: 'Revenue trend' },
    ],
  },
  'ops-dashboard': {
    id: 'ops-dashboard',
    name: 'Operations dashboard',
    widgets: [
      { id: 'w-3', type: 'Bar chart', label: 'Stock by warehouse' },
      { id: 'w-4', type: 'Donut chart', label: 'Stock mix by warehouse' },
      { id: 'w-5', type: 'Table', label: 'Open requisitions' },
    ],
  },
};

const VIEW_MODES = [
  { value: 'Design', label: 'Design' },
  { value: 'Preview', label: 'Preview' },
] as const;

// Dashboard.tsx's own REVENUE_TREND/REVENUE_THIS_MONTH, literally, not a cross-screen import —
// see this file's own header comment for why. Kept in sync by hand, the same disclosed-duplicate
// convention Chart.tsx's own PALETTE already uses for tokens.stylex.ts's real hex values.
const REVENUE_TREND: ChartSeries = [
  { label: 'Apr', value: 410000 },
  { label: 'May', value: 428000 },
  { label: 'Jun', value: 441000 },
  { label: 'Jul', value: 452000 },
  { label: 'Aug', value: 457000 },
  { label: 'Sep', value: 486000 },
];

let nextWidgetSeq = 1;

export function BuilderReports() {
  const state = useStoreState(appStore, (s) => s);

  // Same aggregation Inventory.tsx's own "stock by warehouse" bar chart computes, read live from
  // the same shared store via the same shared helper (data/types.ts's materialsStockedByWarehouse)
  // rather than a third copy — duplicating this byte-identical across files was the original bug
  // (ROADMAP item 52/issue #22).
  const byWarehouse: ChartSeries = materialsStockedByWarehouse(state.stockLevels, state.warehouses);

  // "Open" = not yet resolved — the same `pending_approval` status Requisitions.tsx's own
  // "Pending approval" Chip already names, not a new definition of "open".
  const openRequisitions = Object.values(state.requisitions)
    .filter((requisition) => requisition.status === 'pending_approval')
    .sort((a, b) => (a.id < b.id ? 1 : -1));

  const [definitions, setDefinitions] = useState<Record<string, ReportDefinition>>(SEED_DEFINITIONS);
  const [selectedId, setSelectedId] = useState('sales-performance');
  const selected = definitions[selectedId]!;

  const [draftWidgets, setDraftWidgets] = useState<Widget[]>(selected.widgets);
  const [tab, setTab] = useState<'Design' | 'Preview'>('Design');
  const [justSaved, setJustSaved] = useState(false);

  // Re-drafts from the saved definition whenever the selection changes — this is exactly
  // "reopen": whatever was last Saved for that definition is what comes back, not whatever an
  // earlier, abandoned draft looked like.
  useEffect(() => {
    setDraftWidgets(definitions[selectedId]!.widgets);
    setJustSaved(false);
  }, [selectedId]);

  const isDirty = JSON.stringify(draftWidgets) !== JSON.stringify(selected.widgets);

  const addWidget = (type: WidgetType) => {
    const id = `w-new-${nextWidgetSeq}`;
    nextWidgetSeq += 1;
    setDraftWidgets((prev) => [...prev, { id, type, label: `New ${type.toLowerCase()}` }]);
    setJustSaved(false);
  };

  const removeWidget = (id: string) => {
    setDraftWidgets((prev) => prev.filter((widget) => widget.id !== id));
    setJustSaved(false);
  };

  const save = () => {
    setDefinitions((prev) => ({ ...prev, [selectedId]: { ...prev[selectedId]!, widgets: draftWidgets } }));
    setJustSaved(true);
  };

  // Real render for the 5 widgets `SEED_DEFINITIONS` names (matched on type + label, not type
  // alone — an arbitrary "New bar chart" added from the palette has the same `type` as "Stock by
  // warehouse" but no real fact behind it, so it falls through to `null` and keeps the structural
  // placeholder below). Returns null, never a fabricated chart, for anything unmatched.
  function renderRealWidget(widget: Widget) {
    if (widget.type === 'KPI stat' && widget.label === 'Revenue this month') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.space1 }}>
          <Text variant="display">$486K</Text>
          <Text variant="caption">+6.4% vs last month</Text>
        </div>
      );
    }
    if (widget.type === 'Line chart' && widget.label === 'Revenue trend') {
      return <Chart type="line" title="Revenue trend, last 6 months" valueLabel="$" data={REVENUE_TREND} height={140} />;
    }
    if (widget.type === 'Bar chart' && widget.label === 'Stock by warehouse') {
      return <Chart type="bar" title="Materials stocked by warehouse" valueLabel="materials" data={byWarehouse} height={140} />;
    }
    if (widget.type === 'Donut chart' && widget.label === 'Stock mix by warehouse') {
      // Same `byWarehouse` data as the bar widget above, deliberately — the widget's own seeded
      // label asks for a warehouse mix, not a different cut of the data the way Inventory.tsx's
      // sibling bar/donut pair (by warehouse vs. by material) does. A distinct chart `title`
      // ("share of", not a restatement of the bar's own title) is the one visible cue that this is
      // a proportional view of the same totals, not a second, independent metric.
      return <Chart type="donut" title="Share of materials stocked by warehouse" valueLabel="materials" data={byWarehouse} height={140} />;
    }
    if (widget.type === 'Table' && widget.label === 'Open requisitions') {
      return (
        // aria-label, not a <caption> — this table is genuinely visible (unlike Chart's own
        // visually-hidden accessible table), and a <caption> would duplicate the widget's own
        // label text already shown above it.
        <Table aria-label="Open requisitions">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Requisition #</TableHeaderCell>
              <TableHeaderCell>Requested by</TableHeaderCell>
              <TableHeaderCell>Department</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {openRequisitions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>No requisitions pending approval.</TableCell>
              </TableRow>
            ) : (
              openRequisitions.map((requisition) => (
                <TableRow key={requisition.id}>
                  <TableCell>{requisition.id}</TableCell>
                  <TableCell>{requisition.requestedBy}</TableCell>
                  <TableCell>{requisition.department}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      );
    }
    return null;
  }

  return (
    <div
      style={{
        background: color.bgCanvas,
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: space.space6,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: space.space5,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.space4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.space3, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Text variant="heading">{selected.name}</Text>
            {isDirty ? (
              <Chip variant="status" tone="accent">
                Unsaved changes
              </Chip>
            ) : (
              justSaved && (
                <Chip variant="status" tone="strong">
                  Saved
                </Chip>
              )
            )}
          </div>
          <div style={{ flex: 1 }} />
          <Density value="compact">
            <Button type="button" variant="primary" disabled={!isDirty} onClick={save}>
              Save
            </Button>
          </Density>
        </div>

        <Density value="compact">
          <ButtonGroup options={VIEW_MODES} value={tab} onChange={(value) => setTab(value as 'Design' | 'Preview')} aria-label="View mode" />
        </Density>
      </div>

      <div style={{ display: 'flex', gap: space.space4, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 220px', minWidth: 200, maxWidth: 280, display: 'flex', flexDirection: 'column', gap: space.space5 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.space2 }}>
            <Text variant="caption" as="span">
              REPORT &amp; DASHBOARD DEFINITIONS
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.space2 }}>
              {Object.values(definitions).map((definition) => (
                <Card key={definition.id} selected={definition.id === selectedId} onClick={() => setSelectedId(definition.id)}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: space.space3 }}>
                    <Text variant="body">{definition.name}</Text>
                    <Text variant="caption">{definition.widgets.length} widgets</Text>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {tab === 'Design' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.space2 }}>
              <Text variant="caption" as="span">
                ADD A WIDGET
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: space.space1 }}>
                {PALETTE.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addWidget(type)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: `1px solid ${color.border}`,
                      background: color.bgSurface,
                      textAlign: 'left',
                      cursor: 'pointer',
                      font: 'inherit',
                    }}
                  >
                    <Text variant="body">+ {type}</Text>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: '3 1 360px', minWidth: 320 }}>
          <Card>
            {tab === 'Design' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: space.space3 }}>
                <Text variant="title">Canvas</Text>
                {draftWidgets.length === 0 ? (
                  <div
                    style={{
                      border: `1px dashed ${color.borderStrong}`,
                      borderRadius: 10,
                      padding: space.space6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: color.bgCanvas,
                    }}
                  >
                    <Text variant="caption">No widgets yet — add one from the palette.</Text>
                  </div>
                ) : (
                  draftWidgets.map((widget) => (
                    <div
                      key={widget.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: space.space3,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: `1px solid ${color.border}`,
                        background: color.bgSurface,
                      }}
                    >
                      <Chip variant="status" tone={WIDGET_TONE[widget.type]}>
                        {widget.type}
                      </Chip>
                      <div style={{ flex: 1 }}>
                        <Text variant="body">{widget.label}</Text>
                      </div>
                      <Density value="compact">
                        <Button type="button" variant="ghost" onClick={() => removeWidget(widget.id)}>
                          Remove
                        </Button>
                      </Density>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: space.space3 }}>
                <Text variant="title">Preview</Text>
                {draftWidgets.length === 0 ? (
                  <Text variant="caption">This report has no widgets to preview yet.</Text>
                ) : (
                  // minmax 260px, not the original 200px — found live: a real Chart's own legend
                  // (the donut's, specifically) needs more room than the plain structural box this
                  // grid was sized for before this slice added real chart rendering.
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: space.space3 }}>
                    {draftWidgets.map((widget) => {
                      const real = renderRealWidget(widget);
                      return (
                        <div
                          key={widget.id}
                          style={{
                            border: `1px solid ${color.border}`,
                            borderRadius: 10,
                            padding: space.space4,
                            background: color.bgSurface,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                            minHeight: 96,
                          }}
                        >
                          <Text variant="caption">{widget.type.toUpperCase()}</Text>
                          <Text variant="body">{widget.label}</Text>
                          {real}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
