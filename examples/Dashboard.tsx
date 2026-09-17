import { useState } from 'react';
import { Button, Card, Chart, Chip, Text } from '../src/index.js';
import { color, space } from '../src/tokens.stylex.js';

// Revenue trend — the first real consumer of `Chart` (ROADMAP issue #16's own "19 BI dashboard"
// scenario: "revenue trend vs target"). Six months ending at the same $486K/+6.4% the REVENUE
// THIS MONTH stat card above already states, so the chart and the card agree with each other
// rather than each inventing its own number for the same fact.
// BuilderReports.tsx's "Revenue trend" widget (ROADMAP item 34's "Reports" slice) keeps its own
// literal copy of this exact array — a change here needs the same change made there by hand.
const REVENUE_TREND = [
  { label: 'Apr', value: 410000 },
  { label: 'May', value: 428000 },
  { label: 'Jun', value: 441000 },
  { label: 'Jul', value: 452000 },
  { label: 'Aug', value: 457000 },
  { label: 'Sep', value: 486000 },
];

// The other 2 charts issue #16's "19 BI dashboard" scenario asked for (ROADMAP item 34: "'by
// region' bar, 'mix' donut"). Both break down the same $486K September total the trend chart and
// the REVENUE THIS MONTH stat card already state, the same "share a real figure, don't invent a
// second number for the same fact" choice this file made for the trend chart above.
const REVENUE_BY_REGION = [
  { label: 'North America', value: 210000 },
  { label: 'EMEA', value: 145000 },
  { label: 'APAC', value: 91000 },
  { label: 'LATAM', value: 40000 },
];

const REVENUE_MIX = [
  { label: 'Direct sales', value: 260000 },
  { label: 'Partner / reseller', value: 130000 },
  { label: 'Online', value: 70000 },
  { label: 'Renewals', value: 26000 },
];

/**
 * A KPI dashboard home page: greeting, a grid of stat cards, and 3 real charts (revenue trend,
 * revenue by region, revenue mix). Mirrors
 * the "dashboard" Claude Design template.
 */
export function Dashboard() {
  const [selected, setSelected] = useState('open-orders');

  return (
    <div
      style={{
        background: color.bgCanvas,
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        // ROADMAP item 14 (2026-09-14 design review, confirmed MEDIUM finding): 24px content
        // padding (the reference's own value), matching ListReport.tsx/RecordDetail.tsx — see
        // RecordDetail.tsx for the full box-sizing/minHeight reasoning shared by all three pages.
        // `boxSizing: 'border-box'` was already set here (unlike RecordDetail's root, which
        // needed it added), so this page's `padding: 40` was already absorbed into its declared
        // height rather than adding to it — only the 40->24 padding value and the removed
        // `minHeight: '100vh'` are new.
        padding: space.space6,
        boxSizing: 'border-box',
      }}
    >
      {/* `margin: 0`, not `'0 auto'` — left-aligns instead of centering, so this page's left edge
          matches ListReport.tsx's (no inner max-width wrapper) and RecordDetail.tsx's (same fix)
          at the same x position. No page-level `maxWidth` cap — fills whatever width AppShell
          gives it (see docs/design-conventions.md's "Page width and responsive layout"); the KPI
          cards already reflow on their own via their `repeat(auto-fit, minmax(...))` grid. */}
      <div style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: space.space8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.space2 }}>
          <Text variant="heading">Good morning, Priya</Text>
          <Text variant="body">Here's what needs your attention today.</Text>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: space.space4 }}>
          <Card selected={selected === 'open-orders'} onClick={() => setSelected('open-orders')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.space2 }}>
              <Text variant="overline">OPEN ORDERS</Text>
              <Text variant="display">128</Text>
              <Text variant="caption">+12 this week</Text>
            </div>
          </Card>

          <Card selected={selected === 'approvals'} onClick={() => setSelected('approvals')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.space2 }}>
              <Text variant="overline">PENDING APPROVALS</Text>
              <Text variant="display">17</Text>
              <Text variant="caption">3 waiting over 48h</Text>
            </div>
          </Card>

          <Card selected={selected === 'overdue'} onClick={() => setSelected('overdue')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.space2 }}>
              <Text variant="overline">OVERDUE INVOICES</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: space.space2 }}>
                <Text variant="display">9</Text>
                <Chip variant="status" tone="danger">
                  Overdue
                </Chip>
              </div>
              <Text variant="caption">$42,500 outstanding</Text>
            </div>
          </Card>

          <Card selected={selected === 'revenue'} onClick={() => setSelected('revenue')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.space2 }}>
              <Text variant="overline">REVENUE THIS MONTH</Text>
              <Text variant="display">$486K</Text>
              <Text variant="caption">+6.4% vs last month</Text>
            </div>
          </Card>
        </div>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.space4 }}>
            <Text variant="title">Revenue trend</Text>
            <Chart type="line" title="Revenue trend, last 6 months" valueLabel="$" data={REVENUE_TREND} />
          </div>
        </Card>

        {/* A CSS grid of equal-weight cards, not docs/design-conventions.md's flex "main pane plus
            side panel" recipe — that recipe is for an asymmetric multi-pane layout (unequal
            flex-grow, a primary vs. secondary column); these two charts carry equal weight, so
            this instead matches the KPI stat-card grid above (`repeat(auto-fit, minmax(...))`),
            the established pattern on this same page for a row of same-weight cards. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: space.space4 }}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.space4 }}>
              <Text variant="title">Revenue by region</Text>
              <Chart type="bar" title="Revenue by region, September 2026" valueLabel="$" data={REVENUE_BY_REGION} />
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.space4 }}>
              <Text variant="title">Revenue mix</Text>
              <Chart type="donut" title="Revenue mix by channel, September 2026" valueLabel="$" data={REVENUE_MIX} />
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
