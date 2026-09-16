import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, Chip, type ChipTone, Density, Text } from '../src/index.js';

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
 * package's own components could render, not an invented taxonomy. Preview stays structural
 * (a labeled box per widget), same as BuilderScreens.tsx's own Preview: rendering each widget with
 * a REAL `Chart` against REAL store data is a bigger, separate feature (wiring five different
 * live aggregations, several not computed anywhere yet — cash-flow, spend-by-supplier-style
 * breakdowns), not this builder's own "can I lay out and save a definition" journey.
 *
 * Naming note: 'Reports & dashboards' shares the word "Reports" with NAV.Finance's own
 * still-unbuilt 'Reports' placeholder — like 'Users' / 'Users and roles' before it (see
 * AppShell.tsx's NAV.Administration comment), a plain `/^Reports\b/` selector would be ambiguous
 * if Finance's placeholder is ever built too; use the same `\s+[A-Z]` (hint-anchored) selector
 * this codebase already relies on for that case. This is also preview/client.tsx's 32nd and
 * FINAL route: `SHELL_MAX_ROUTES` is a hard cap (`src/shell/Shell.tsx`), so the next NAV entry
 * that needs a real route (Fields, Publish, Finance's Reports, or anything new) requires either
 * retiring an existing route or raising the cap — a one-way, package-level change per LOOP.md,
 * not a call this slice makes unilaterally.
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

let nextWidgetSeq = 1;

export function BuilderReports() {
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

  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: 24,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 220px', minWidth: 200, maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Text variant="caption" as="span">
              REPORT &amp; DASHBOARD DEFINITIONS
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.values(definitions).map((definition) => (
                <Card key={definition.id} selected={definition.id === selectedId} onClick={() => setSelectedId(definition.id)}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                    <Text variant="body">{definition.name}</Text>
                    <Text variant="caption">{definition.widgets.length} widgets</Text>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {tab === 'Design' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Text variant="caption" as="span">
                ADD A WIDGET
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {PALETTE.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addWidget(type)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Text variant="title">Canvas</Text>
                {draftWidgets.length === 0 ? (
                  <div
                    style={{
                      border: '1px dashed #cbd5e1',
                      borderRadius: 10,
                      padding: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f8fafc',
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
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Text variant="title">Preview</Text>
                {draftWidgets.length === 0 ? (
                  <Text variant="caption">This report has no widgets to preview yet.</Text>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    {draftWidgets.map((widget) => (
                      <div
                        key={widget.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: 10,
                          padding: 16,
                          background: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          minHeight: 96,
                        }}
                      >
                        <Text variant="caption">{widget.type.toUpperCase()}</Text>
                        <Text variant="body">{widget.label}</Text>
                      </div>
                    ))}
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
