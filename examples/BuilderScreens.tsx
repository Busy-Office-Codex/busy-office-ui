import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, Chip, type ChipTone, Density, Text } from '../src/index.js';

/**
 * A screen/page-definition builder (ROADMAP M7's ERP reference-app initiative, Slice 6, Builder)
 * — fills NAV.Builder's own pre-existing 'Pages' placeholder (M6) alongside the Forms/Workflows
 * builders that page already sits next to.
 *
 * Unlike BuilderForms.tsx/BuilderWorkflow.tsx (both explicit, documented STATIC treatments —
 * ROADMAP M6 batch 4's own classification, a deliberate structural-first-pass scope, not an
 * oversight), this screen is deliberately made genuinely interactive: the brief's own named
 * Slice 6 journey is "open definition → modify → validate → preview → save → reopen", and a
 * static mockup can't demonstrate that journey at all. Add/remove a widget, see a real "Unsaved
 * changes" state, switch to a real Preview render, Save, then reopen a different definition and
 * come back — the saved layout is still there, not reverted.
 *
 * State lives in this component only (not the shared examples/data store): page-layout
 * definitions are Builder/UI-configuration territory, a different bounded concern from the ERP
 * transactional data (orders, stock, users…) the shared store owns — same boundary line
 * AGENTS.md already draws around the package itself, just applied one level down. Persistence is
 * real for the length of this browser session (the component never unmounts once visited — see
 * preview/client.tsx's SamplePreview, which keeps every visited route's pane alive as a hidden
 * div) — exactly what "save → reopen" needs to demonstrate honestly, without inventing a backend.
 *
 * Report/dashboard builder (the brief's other named Slice 6 target) is deliberately NOT built
 * here or as a second file: no existing NAV.Builder placeholder fits it, and one genuinely
 * interactive builder demonstrating the full journey end-to-end is more valuable than two shallow
 * static ones. Left as a disclosed gap for the verification report, not silently dropped.
 */

type WidgetType = 'Table' | 'Chart' | 'Stat tile' | 'Form section';

type Widget = { id: string; type: WidgetType; label: string };

type PageDefinition = { id: string; name: string; widgets: Widget[] };

const WIDGET_TONE: Record<WidgetType, ChipTone> = {
  Table: 'accent',
  Chart: 'strong',
  'Stat tile': 'neutral',
  'Form section': 'accent',
};

const PALETTE: WidgetType[] = ['Table', 'Chart', 'Stat tile', 'Form section'];

const SEED_DEFINITIONS: Record<string, PageDefinition> = {
  'customer-360': {
    id: 'customer-360',
    name: 'Customer 360',
    widgets: [
      { id: 'w-1', type: 'Stat tile', label: 'Lifetime value' },
      { id: 'w-2', type: 'Table', label: 'Open orders' },
    ],
  },
  'procurement-overview': {
    id: 'procurement-overview',
    name: 'Procurement overview',
    widgets: [
      { id: 'w-3', type: 'Chart', label: 'Spend by supplier' },
      { id: 'w-4', type: 'Table', label: 'Pending approvals' },
    ],
  },
};

const VIEW_MODES = [
  { value: 'Design', label: 'Design' },
  { value: 'Preview', label: 'Preview' },
] as const;

let nextWidgetSeq = 1;

export function BuilderScreens() {
  const [definitions, setDefinitions] = useState<Record<string, PageDefinition>>(SEED_DEFINITIONS);
  const [selectedId, setSelectedId] = useState('customer-360');
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
              PAGE DEFINITIONS
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
                  <Text variant="caption">This page has no widgets to preview yet.</Text>
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
