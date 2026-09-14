import { useState } from 'react';
import { Button, Card, Chip, Text } from '../src/index.js';

/**
 * A KPI dashboard home page: greeting, and a grid of stat cards. Mirrors
 * the "dashboard" Claude Design template.
 */
export function Dashboard() {
  const [selected, setSelected] = useState('open-orders');

  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        // ROADMAP item 14 (2026-09-14 design review, confirmed MEDIUM finding): 24px content
        // padding (the reference's own value), matching ListReport.tsx/RecordDetail.tsx — see
        // RecordDetail.tsx for the full box-sizing/minHeight reasoning shared by all three pages.
        // `boxSizing: 'border-box'` was already set here (unlike RecordDetail's root, which
        // needed it added), so this page's `padding: 40` was already absorbed into its declared
        // height rather than adding to it — only the 40->24 padding value and the removed
        // `minHeight: '100vh'` are new.
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* `margin: 0`, not `'0 auto'` — left-aligns instead of centering, so this page's left edge
          matches ListReport.tsx's (no inner max-width wrapper) and RecordDetail.tsx's (same fix)
          at the same x position. */}
      <div style={{ maxWidth: 1120, margin: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Text variant="heading">Good morning, Priya</Text>
          <Text variant="body">Here's what needs your attention today.</Text>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <Card selected={selected === 'open-orders'} onClick={() => setSelected('open-orders')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Text variant="overline">OPEN ORDERS</Text>
              <Text variant="display">128</Text>
              <Text variant="caption">+12 this week</Text>
            </div>
          </Card>

          <Card selected={selected === 'approvals'} onClick={() => setSelected('approvals')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Text variant="overline">PENDING APPROVALS</Text>
              <Text variant="display">17</Text>
              <Text variant="caption">3 waiting over 48h</Text>
            </div>
          </Card>

          <Card selected={selected === 'overdue'} onClick={() => setSelected('overdue')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Text variant="overline">OVERDUE INVOICES</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text variant="display">9</Text>
                <Chip variant="status" tone="danger">
                  Overdue
                </Chip>
              </div>
              <Text variant="caption">$42,500 outstanding</Text>
            </div>
          </Card>

          <Card selected={selected === 'revenue'} onClick={() => setSelected('revenue')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Text variant="overline">REVENUE THIS MONTH</Text>
              <Text variant="display">$486K</Text>
              <Text variant="caption">+6.4% vs last month</Text>
            </div>
          </Card>
        </div>

        <div>
          <Button variant="secondary">View full report</Button>
        </div>
      </div>
    </div>
  );
}
