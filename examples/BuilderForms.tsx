import * as stylex from '@stylexjs/stylex';
import { Button, Card, Chip, Density, Dropdown, Input, Text } from '../src/index.js';
import { color, motion, radius, shadow } from '../src/tokens.stylex.js';
import { FilterTabs } from './filterTabs.js';

const toggleStyles = stylex.create({
  // A hand-rolled toggle-switch VISUAL, not a new shared component — this page's Required/
  // Read-only after approval/Show on mobile rows are the first place this shape is needed
  // anywhere in the repo (docs/design-conventions.md's "two named consumers" threshold for a
  // new shared component isn't met yet; `examples/checkboxStyles.ts`/`filterTabs.tsx` were only
  // extracted once actually reused). Purely decorative (`aria-hidden`, no click handler) — this
  // whole panel is a fixed "currently selected field" sample, not a live form (see the file
  // header), so there's nothing here for a toggle to actually DO yet.
  track: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: '36px',
    height: '20px',
    borderRadius: radius.pill,
    backgroundColor: color.border,
    flexShrink: 0,
    transitionProperty: 'background-color',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeStandard,
  },
  trackOn: {
    backgroundColor: color.action,
  },
  thumb: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: color.bgSurface,
    boxShadow: shadow.xs,
    transitionProperty: 'transform',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeStandard,
  },
  thumbOn: {
    transform: 'translateX(16px)',
  },
  // The canvas field currently mirrored in the Properties panel — a real highlighted border plus
  // a small "Selected" badge, matching the reference's visual link between the two panes (found
  // live: this repo's version had no such link at all; the Properties panel was hardcoded to a
  // fixed "Customer" sample independent of anything drawn on the canvas).
  selectedField: {
    position: 'relative',
  },
  selectedBadge: {
    position: 'absolute',
    top: '-10px',
    right: '10px',
    paddingInline: '8px',
    paddingBlock: '2px',
    borderRadius: radius.pill,
    backgroundColor: color.action,
    color: color.textOnInk,
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
});

function Toggle({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" {...stylex.props(toggleStyles.track, on && toggleStyles.trackOn)}>
      <span {...stylex.props(toggleStyles.thumb, on && toggleStyles.thumbOn)} />
    </span>
  );
}

/**
 * A static 3-pane form/page editor layout. Mirrors `templates/erp-skeleton`'s "23 Builder (forms)"
 * screen (Claude Design project "Busy Office Design System"): a document header (title/version,
 * undo/redo, Design/Logic/Data/Preview tabs, Version history/Publish actions), a left field/layout/
 * block palette, a center rendered form preview, and a right field-properties panel. Meant to
 * render as `AppShell`'s content for module="Builder", route "Forms" (see AppShell.tsx's
 * `NAV.Builder`).
 *
 * Per ROADMAP M6 batch 4's classification, this is a STATIC treatment — no drag-and-drop, no
 * canvas/diagram library. The palette is a plain labeled list (not draggable), the center pane is
 * a real but non-interactive form preview, and the right panel shows the Order date field's
 * properties as a fixed "currently selected field" sample rather than wiring real selection state
 * (owner-directed, 2026-09-15: matches the reference's own sample, which highlights Order date on
 * the canvas — a static Customer/Properties pairing that didn't correspond to anything visibly
 * "selected" was a real gap, not a deliberate simplification, so the canvas field now carries a
 * matching highlight + badge instead of the two panes disagreeing).
 *
 * Same tab convention Profile.tsx/RolePage.tsx established: this package has no `Tab` component,
 * so Design/Logic/Data/Preview (and, in the Properties panel, Properties/Rules/Access) reuse
 * filter `Chip` (`variant="filter"`) via `FilterTabs`. Only "Design"/"Properties" are selected and
 * have real content below them — the rest render as present-but-inactive chips with no switching
 * logic, per this milestone's structural-first-pass scope.
 */

type PaletteGroup = { title: string; items: string[] };

const PALETTE_GROUPS: PaletteGroup[] = [
  { title: 'Fields', items: ['Text', 'Number', 'Date', 'Select', 'Lookup', 'Toggle'] },
  { title: 'Layout', items: ['Section', 'Columns', 'Tabs', 'Table'] },
  { title: 'Blocks', items: ['Line items', 'Totals', 'Approval', 'Attachments'] },
];

const TABS = ['Design', 'Logic', 'Data', 'Preview'];

const PAYMENT_TERMS_ITEMS = ['Net 30', 'Net 15', 'Due on receipt', 'Net 60'];
const WAREHOUSE_ITEMS = ['Main warehouse', 'East distribution center', 'West distribution center'];

const PROPERTIES_TABS = ['Properties', 'Rules', 'Access'];

export function BuilderForms() {
  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        // Matches every other sample page's 24px content padding / border-box frame (see
        // RecordDetail.tsx for the full box-sizing reasoning).
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
            <Text variant="heading">Sales order form</Text>
            <Chip variant="status" tone="neutral">
              Draft v4
            </Chip>
          </div>
          <Density value="compact">
            <div style={{ display: 'flex', gap: 4 }}>
              <Button type="button" variant="ghost">
                Undo
              </Button>
              <Button type="button" variant="ghost">
                Redo
              </Button>
            </div>
          </Density>
          <div style={{ flex: 1 }} />
          <Density value="compact">
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="button" variant="secondary">
                Version history
              </Button>
              <Button type="button" variant="primary">
                Publish
              </Button>
            </div>
          </Density>
        </div>

        <FilterTabs tabs={TABS} selected="Design" />
      </div>

      {/* Flexible (not fixed) column bases — see docs/design-conventions.md's "Page width and
          responsive layout" — so this 3-pane row wraps to full-width stacked panes on a narrow/
          mobile viewport with no `@media` query needed. */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 220px', minWidth: 200, maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input aria-label="Search palette" placeholder="Search fields & blocks…" size="search" />
          {PALETTE_GROUPS.map((group) => (
            <div key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Text variant="caption" as="span">
                {group.title.toUpperCase()}
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {group.items.map((item) => (
                  <div
                    key={item}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                    }}
                  >
                    <Text variant="body">{item}</Text>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: '3 1 360px', minWidth: 320 }}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Text variant="title">Sales order</Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {/* `disabled` on every field here — this pane is a rendered form PREVIEW, not a
                    live form (matches this pass's structural-first-pass scope: real components,
                    non-interactive content). */}
                <Input label="Customer *" placeholder="Select a customer…" disabled />
                {/* The field currently mirrored in the Properties panel to the right — see the
                    file header comment. */}
                <div {...stylex.props(toggleStyles.selectedField)}>
                  <span {...stylex.props(toggleStyles.selectedBadge)}>Selected</span>
                  <Input label="Order date *" placeholder="Select a date…" disabled style={{ borderColor: color.accent }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Text variant="caption" as="span">
                    Payment terms
                  </Text>
                  <Dropdown label={PAYMENT_TERMS_ITEMS[0]} items={PAYMENT_TERMS_ITEMS.map((label) => ({ label, selected: label === PAYMENT_TERMS_ITEMS[0] }))} active={false} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Text variant="caption" as="span">
                    Warehouse
                  </Text>
                  <Dropdown label={WAREHOUSE_ITEMS[0]} items={WAREHOUSE_ITEMS.map((label) => ({ label, selected: label === WAREHOUSE_ITEMS[0] }))} active={false} />
                </div>
              </div>

              {/* Placeholder for the "Line items" block — not a real table, per this pass's
                  structural-first-pass scope (this block is a Builder-canvas placeholder, not a
                  rendered record — compare ListReport.tsx's real Table, which renders live rows).
                  No special role: the visible "Line items block" caption below is its own
                  accessible content, same as any other labeled placeholder Card in this package. */}
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
                <Text variant="caption">Line items block</Text>
              </div>

              {/* A second, distinct placeholder region — found live: the reference has two
                  separate dashed areas (a placed "Line items block" plus an empty canvas drop
                  target below it for adding more fields/blocks), this file previously had only
                  the one, collapsing "a block that's already on the canvas" and "empty space to
                  add a new one" into the same box. */}
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
                <Text variant="caption">drop zone</Text>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ flex: '1 1 260px', minWidth: 240, maxWidth: 340 }}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <FilterTabs tabs={PROPERTIES_TABS} selected="Properties" />

              <Input label="Label" defaultValue="Order date" />
              <Input label="Field key" defaultValue="order_date" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Text variant="caption" as="span">
                  Type
                </Text>
                <Dropdown label="Date" items={[{ label: 'Date', selected: true }]} active={false} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <Text variant="body">Required</Text>
                  <Toggle on />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <Text variant="body">Read-only after approval</Text>
                  <Toggle on />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <Text variant="body">Show on mobile</Text>
                  <Toggle on={false} />
                </div>
              </div>

              <Input label="Default value" defaultValue="today()" />

              <Text variant="caption">Visible to: Sales, Finance · Editable by: Sales</Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
