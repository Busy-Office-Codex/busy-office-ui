import { Card, Chart, Text } from '../src/index.js';
import { color, space } from '../src/tokens.stylex.js';
import { appStore } from './data/appStore.js';
import { documentTotal } from './data/types.js';
import { useStoreState } from './data/store.js';

/**
 * The Finance "Overview" screen — a card-grid module hub, the same shape AdminOverview.tsx
 * already established for a module's landing page (ROADMAP item 34, "Finance" slice, closing
 * issue #16's own "17 Finance — cash flow, 12 months" named consumer). Meant to render as
 * `AppShell`'s content when module="Finance" route="Overview" is active — previously a NAV
 * placeholder only (AppShell.tsx's `NAV.Finance`), the module's first real screen.
 *
 * One real figure, the rest disclosed as sample — the same split AdminOverview.tsx's own header
 * comment already discloses for its module ("a seats/plan concept has no data model anywhere in
 * this store to connect to honestly"): "Receivables" reads live `state.invoices` (balance due =
 * documentTotal(lines) minus posted payments, the exact computation Billing.tsx's own
 * "Record payment" action already uses and mutates) — a genuine live aggregation, real if a
 * viewer records a payment on Billing.tsx and comes back. "Ledger"/"Payables"/"Reports" stay
 * static descriptive cards: there's no journal-entry, AP-bill, or custom-report data model in
 * this store to connect to. The "Cash flow, last 12 months" chart is disclosed sample data for
 * the same reason: `Invoice.payments` genuinely can hold real, live-dated payment records once a
 * viewer starts using Billing.tsx, but the seed data starts every invoice unpaid (`payments: []`)
 * — there is no seeded 12-month payment history to aggregate a real trend from, only what a
 * single session's own live interactions would produce, which is not what "last 12 months" means.
 */

type FinanceArea = { label: string; description: string };

// 12 months ending Sep 2026 — the same month every other sample page's own "this month" figures
// (Dashboard.tsx's $486K, etc.) already end on, kept consistent rather than picking a different
// arbitrary date. Disclosed sample data (see this file's own header comment for why).
const CASH_FLOW = [
  { label: 'Oct', value: 168000 },
  { label: 'Nov', value: 182000 },
  { label: 'Dec', value: 201000 },
  { label: 'Jan', value: 149000 },
  { label: 'Feb', value: 163000 },
  { label: 'Mar', value: 177000 },
  { label: 'Apr', value: 171000 },
  { label: 'May', value: 188000 },
  { label: 'Jun', value: 196000 },
  { label: 'Jul', value: 179000 },
  { label: 'Aug', value: 205000 },
  { label: 'Sep', value: 214000 },
];

const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US')}`;

export function Finance() {
  const state = useStoreState(appStore, (s) => s);

  // Same definition of "unpaid" Analytics.tsx's own "Finance" exceptions count already uses
  // (`status === 'sent' || status === 'overdue'`) — not `!== 'cancelled'`, which would also count
  // `'draft'` (never sent, not really receivable yet) and `'paid'` (already collected), and would
  // disagree with Analytics.tsx about the same fact once a real second invoice existed.
  const unpaidInvoices = Object.values(state.invoices).filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue');
  const balanceDue = (invoice: (typeof unpaidInvoices)[number]) => documentTotal(invoice.lines) - invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalReceivables = unpaidInvoices.reduce((sum, invoice) => sum + balanceDue(invoice), 0);
  const overdueCount = unpaidInvoices.filter((invoice) => invoice.status === 'overdue').length;

  const FINANCE_AREAS: FinanceArea[] = [
    { label: 'Ledger', description: 'View journal entries and account balances by period.' },
    {
      label: 'Receivables',
      description: `${formatCurrency(totalReceivables)} outstanding across ${unpaidInvoices.length} unpaid invoice${unpaidInvoices.length === 1 ? '' : 's'}, ${overdueCount} overdue.`,
    },
    { label: 'Payables', description: 'Track and schedule outgoing supplier payments.' },
    { label: 'Reports', description: 'Build custom financial reports and dashboards.' },
  ];

  return (
    <div
      style={{
        background: color.bgCanvas,
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        // Matches the 24px content padding / border-box sizing shared by every other sample page
        // (ListReport.tsx, RecordDetail.tsx, Dashboard.tsx, AdminOverview.tsx).
        padding: space.space6,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: space.space6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.space2 }}>
          <Text variant="heading">Finance</Text>
          <Text variant="body">Ledger, receivables, payables, and reporting for this workspace.</Text>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: space.space4 }}>
          {FINANCE_AREAS.map((area) => (
            <Card key={area.label}>
              <Text variant="title">{area.label}</Text>
              <Text variant="caption">{area.description}</Text>
            </Card>
          ))}
        </div>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.space4 }}>
            <Text variant="title">Cash flow</Text>
            <Chart type="line" title="Cash flow, last 12 months" valueLabel="$" data={CASH_FLOW} />
          </div>
        </Card>
      </div>
    </div>
  );
}
