import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { Button, Card, Density, Dropdown, Input, Text } from '../src/index.js';
// This package has no Toggle/Switch export, so each Modules row below renders as a `<label>`
// (text + control, giving the checkbox its accessible name for free) wrapping a real native
// `<input type="checkbox">`, styled via the same shared examples/checkboxStyles.ts
// examples/ListReport.tsx's row-selection checkboxes use (see that file for the full history) —
// one checkbox look across this package's examples, not a second one invented for this file.
import { checkboxStyles as toggleStyles } from './checkboxStyles.js';

const BASE_CURRENCY_ITEMS = ['USD', 'EUR', 'GBP'];
const FISCAL_YEAR_START_ITEMS = ['January', 'April', 'July', 'October'];
const DATE_FORMAT_ITEMS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
const TIME_ZONE_ITEMS = ['Eastern Time (ET)', 'Central Time (CT)', 'Pacific Time (PT)', 'UTC'];

type ModuleRow = { key: string; label: string; defaultEnabled: boolean };

const MODULES: ModuleRow[] = [
  { key: 'sales', label: 'Sales', defaultEnabled: true },
  { key: 'purchase-inventory', label: 'Purchase & Inventory', defaultEnabled: true },
  { key: 'finance', label: 'Finance', defaultEnabled: true },
  { key: 'bi', label: 'BI', defaultEnabled: true },
  { key: 'builder', label: 'Builder', defaultEnabled: false },
];

/**
 * An organization settings form. Mirrors `templates/erp-skeleton`'s "25 · Settings" screen
 * (Claude Design project "Busy Office Design System"): a "General" header with Discard/Save
 * changes actions, then three labeled sections — Company (legal name, tax ID, address, logo
 * upload), Locale & currency (four real `Dropdown` value pickers), and Modules (five enable/hide
 * toggles). Meant to render as `AppShell`'s content for `module="Settings"`, whose own `NAV` entry
 * list starts with `'General'` — this screen's own reference header — so its route label lines up
 * with the module's first sibling screen (see AppShell.tsx's `NAV.Settings`).
 */
export function Settings() {
  const [legalName, setLegalName] = useState('Northwind Traders, LLC');
  const [taxId, setTaxId] = useState('84-2947103');
  const [address, setAddress] = useState('4500 Meridian Ave, Suite 200, Austin, TX 78745');

  const [baseCurrency, setBaseCurrency] = useState(BASE_CURRENCY_ITEMS[0]);
  const [fiscalYearStart, setFiscalYearStart] = useState(FISCAL_YEAR_START_ITEMS[0]);
  const [dateFormat, setDateFormat] = useState(DATE_FORMAT_ITEMS[0]);
  const [timeZone, setTimeZone] = useState(TIME_ZONE_ITEMS[0]);

  const [moduleEnabled, setModuleEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(MODULES.map((module) => [module.key, module.defaultEnabled])),
  );

  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        // Matches ListReport.tsx/RecordDetail.tsx/Dashboard.tsx's shared 24px content
        // padding/border-box frame (see RecordDetail.tsx for the full box-sizing reasoning).
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* `margin: 0`, not `'0 auto'` — left-aligns instead of centering, matching every other
          sample page's left edge (see RecordDetail.tsx). `maxWidth: 720` is this file's own call
          (the reference gives no measured form width) — narrower than RecordDetail's 960, since a
          settings form reads better as a single column than stretched to that width. */}
      <div style={{ maxWidth: 720, margin: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Density value="compact">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text variant="heading">General</Text>
            <div style={{ flex: 1 }} />
            <Button variant="ghost">Discard</Button>
            <Button variant="primary">Save changes</Button>
          </div>
        </Density>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Text variant="title">Company</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <Input label="Legal name" value={legalName} onChange={(event) => setLegalName(event.target.value)} />
              <Input label="Tax ID" value={taxId} onChange={(event) => setTaxId(event.target.value)} />
            </div>
            <Input label="Address" value={address} onChange={(event) => setAddress(event.target.value)} />
            <div>
              {/* Static sample — no real file picker/upload wiring, per this batch's structural-
                  first-pass scope. */}
              <Button variant="secondary">Upload logo</Button>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Text variant="title">Locale &amp; currency</Text>
            {/* `active={false}` on every field here, deliberately not following ListReport.tsx's
                toolbar-filter Dropdown pattern verbatim: `active` (docs/design-conventions.md) is
                the dark/filled treatment reserved for "a real narrowed filter," and every one of
                these four fields always has exactly one item `selected` (a required setting has
                no "All …"/unset state) — passing no `active` prop would fall back to
                `items.some(selected)`, which is always true here, permanently filling all four
                triggers and collapsing the very hierarchy ROADMAP item 11 introduced `active` to
                preserve. These are value pickers, not filters, so they stay in the trigger's
                normal (unfilled) rest style. */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <Dropdown
                label={`Base currency · ${baseCurrency}`}
                items={BASE_CURRENCY_ITEMS.map((label) => ({ label, selected: label === baseCurrency }))}
                onSelect={setBaseCurrency}
                active={false}
              />
              <Dropdown
                label={`Fiscal year start · ${fiscalYearStart}`}
                items={FISCAL_YEAR_START_ITEMS.map((label) => ({ label, selected: label === fiscalYearStart }))}
                onSelect={setFiscalYearStart}
                active={false}
              />
              <Dropdown
                label={`Date format · ${dateFormat}`}
                items={DATE_FORMAT_ITEMS.map((label) => ({ label, selected: label === dateFormat }))}
                onSelect={setDateFormat}
                active={false}
              />
              <Dropdown
                label={`Time zone · ${timeZone}`}
                items={TIME_ZONE_ITEMS.map((label) => ({ label, selected: label === timeZone }))}
                onSelect={setTimeZone}
                active={false}
              />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Text variant="title">Modules</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MODULES.map((module) => (
                <label
                  key={module.key}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
                >
                  <Text variant="body">{module.label}</Text>
                  <input
                    type="checkbox"
                    checked={moduleEnabled[module.key]}
                    onChange={() =>
                      setModuleEnabled((prev) => ({ ...prev, [module.key]: !prev[module.key] }))
                    }
                    {...stylex.props(toggleStyles.checkbox)}
                  />
                </label>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
