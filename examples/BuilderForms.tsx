import * as stylex from '@stylexjs/stylex';
import { Button, Card, Density, Dropdown, Input, Text } from '../src/index.js';
// This repo's shared native-checkbox treatment (see examples/ListReport.tsx/Settings.tsx for the
// full history) — reused here for the Properties panel's Required/Read-only/Show on mobile rows.
import { checkboxStyles } from './checkboxStyles.js';
import { FilterTabs } from './filterTabs.js';

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
 * a real but non-interactive form preview, and the right panel shows the Customer field's
 * properties as a fixed "currently selected field" sample rather than wiring real selection state.
 *
 * Same tab convention Profile.tsx/RolePage.tsx established: this package has no `Tab` component,
 * so Design/Logic/Data/Preview reuse filter `Chip` (`variant="filter"`). Only "Design" is selected
 * and has real content below it — "Logic"/"Data"/"Preview" render as present-but-inactive chips
 * with no switching logic, per this milestone's structural-first-pass scope.
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

const VISIBLE_TO_ITEMS = ['Everyone', 'Sales', 'Sales Manager', 'Finance', 'Administrator'];
const EDITABLE_BY_ITEMS = ['Sales', 'Sales Manager', 'Finance', 'Administrator'];

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text variant="heading">Sales order form</Text>
            <Text variant="caption">Draft v4</Text>
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
                <Input label="Order date *" placeholder="Select a date…" disabled />
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
            </div>
          </Card>
        </div>

        <div style={{ flex: '1 1 260px', minWidth: 240, maxWidth: 340 }}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Text variant="title">Properties</Text>
              <Text variant="caption">Field: Customer</Text>

              <Input label="Label" defaultValue="Customer" />
              <Input label="Field key" defaultValue="customer_id" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Text variant="caption" as="span">
                  Type
                </Text>
                <Dropdown label="Lookup" items={[{ label: 'Lookup', selected: true }]} active={false} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" defaultChecked {...stylex.props(checkboxStyles.checkbox)} />
                  <Text variant="body">Required</Text>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" {...stylex.props(checkboxStyles.checkbox)} />
                  <Text variant="body">Read-only</Text>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" defaultChecked {...stylex.props(checkboxStyles.checkbox)} />
                  <Text variant="body">Show on mobile</Text>
                </label>
              </div>

              <Input label="Default value" placeholder="None" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Text variant="caption" as="span">
                  Visible to
                </Text>
                <Dropdown label={VISIBLE_TO_ITEMS[0]} items={VISIBLE_TO_ITEMS.map((label) => ({ label, selected: label === VISIBLE_TO_ITEMS[0] }))} active={false} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Text variant="caption" as="span">
                  Editable by
                </Text>
                <Dropdown label={EDITABLE_BY_ITEMS[0]} items={EDITABLE_BY_ITEMS.map((label) => ({ label, selected: label === EDITABLE_BY_ITEMS[0] }))} active={false} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
