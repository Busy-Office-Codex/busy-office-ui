import { useState } from 'react';
import { Button, Card, Chip, Density, Input, Text } from '../src/index.js';
import { FilterTabs } from './filterTabs.js';

/**
 * A cross-module approval queue: a mixed-type queue list on the left (purchase
 * orders, sales orders, expenses, journal entries, access requests — anything
 * "waiting on you") and a detail pane on the right for whichever queue item is
 * selected. Mirrors `templates/erp-skeleton`'s "16 · Approvals" screen. Meant
 * to render as `AppShell`'s content for module="General", route "Approvals"
 * (see `AppShell.tsx`'s `NAV.General`, which already lists "Approvals" as a
 * sibling of "Inbox"/"Notifications").
 *
 * Same tab convention RolePage.tsx/Profile.tsx established: this package has
 * no `Tab` component, so Mine/Purchase orders/Sales orders/Expenses/Journal
 * entries/Access requests reuse filter `Chip` (`variant="filter"`). Only
 * "Mine" is selected and has real content below it — the cross-module queue
 * itself already *is* "Mine" (everything currently waiting on this user
 * across modules), so the other five render as present-but-inactive chips
 * with no filtering logic, per this milestone's structural-first-pass scope
 * (same judgment RolePage.tsx documents for its own Team/Targets/Permissions
 * tabs).
 *
 * Row selection is real (`useState` + `Card`'s own `selected`/`onClick`
 * support, same pattern ListReport.tsx's row checkboxes and RecordDetail.tsx's
 * reject `Modal` use for local interactivity) — clicking a queue row swaps
 * the detail pane's content, rather than Inbox.tsx's single static
 * list/detail pairing, since every queue item here already carries the full
 * set of detail fields a real approval needs.
 *
 * Sample data deliberately reuses existing example records rather than
 * inventing a parallel set: PO-1042/PO-1029 and their supplier/buyer/total
 * fields come from ListReport.tsx, and SO-1042 · Northwind Traders (amount,
 * "Sales — East region", "J. Rivera") comes from RecordDetail.tsx/Inbox.tsx.
 * The comment field is a single-line `Input`, not a textarea — this
 * package has no multiline variant, the same disclosed simplification
 * Inbox.tsx's reply composer already establishes for this milestone.
 */

type ApprovalCategory = 'Purchase orders' | 'Sales orders' | 'Expenses' | 'Journal entries' | 'Access requests';

const TABS: Array<'Mine' | ApprovalCategory> = [
  'Mine',
  'Purchase orders',
  'Sales orders',
  'Expenses',
  'Journal entries',
  'Access requests',
];

type SummaryField = { label: string; value: string };

type ApprovalItem = {
  id: string;
  category: ApprovalCategory;
  record: string;
  title: string;
  context: string;
  elapsed: string;
  step: string;
  requester: string;
  policy: string;
  summary: SummaryField[];
  budgetImpact: string;
  attachments: string[];
};

const QUEUE: ApprovalItem[] = [
  {
    id: 'po-1042',
    category: 'Purchase orders',
    record: 'PO-1042',
    title: 'PO-1042 · Alden Paper Co.',
    context: 'Over $1,000 auto-approve threshold',
    elapsed: '2h ago',
    step: 'Step 2 of 3',
    requester: 'Jordan Lee',
    policy: 'Purchase orders over $1,000 require manager sign-off before they can be sent to the supplier.',
    summary: [
      { label: 'Amount', value: '$1,240.00' },
      { label: 'Vendor', value: 'Alden Paper Co.' },
      { label: 'Requester', value: 'Jordan Lee' },
    ],
    budgetImpact: '3% over the Office Supplies budget for September.',
    attachments: ['PO-1042-quote.pdf'],
  },
  {
    id: 'so-1042',
    category: 'Sales orders',
    record: 'SO-1042',
    title: 'SO-1042 · Northwind Traders',
    context: 'Discount exceeds 15%',
    elapsed: '5h ago',
    step: 'Step 1 of 2',
    requester: 'J. Rivera',
    policy: 'Discounts over 15% need sales-manager sign-off before the order can be confirmed.',
    summary: [
      { label: 'Amount', value: '$24,300.00' },
      { label: 'Customer', value: 'Northwind Traders' },
      { label: 'Requester', value: 'J. Rivera · Sales — East region' },
    ],
    budgetImpact: 'Reduces this quarter’s regional margin by an estimated 4%.',
    attachments: ['SO-1042-discount-approval.pdf', 'Northwind-PO.pdf'],
  },
  {
    id: 'po-1029',
    category: 'Purchase orders',
    record: 'PO-1029',
    title: 'PO-1029 · Cascade IT Distribution',
    context: 'New supplier, no purchase history',
    elapsed: '1d ago',
    step: 'Step 1 of 3',
    requester: 'Jordan Lee',
    policy: 'First order from a new supplier requires procurement sign-off before onboarding.',
    summary: [
      { label: 'Amount', value: '$14,802.20' },
      { label: 'Vendor', value: 'Cascade IT Distribution' },
      { label: 'Requester', value: 'Jordan Lee' },
    ],
    budgetImpact: 'Within the IT Equipment budget for September.',
    attachments: ['Cascade-supplier-onboarding.pdf'],
  },
  {
    id: 'so-1051',
    category: 'Sales orders',
    record: 'SO-1051',
    title: 'SO-1051 · Bluepeak Logistics',
    context: 'Discount exceeds 12%',
    elapsed: '1d ago',
    step: 'Step 1 of 2',
    requester: 'Priya Shah',
    policy: 'Discounts over 10% need sales-manager sign-off before the order can be confirmed.',
    summary: [
      { label: 'Amount', value: '$9,860.00' },
      { label: 'Customer', value: 'Bluepeak Logistics' },
      { label: 'Requester', value: 'Priya Shah' },
    ],
    budgetImpact: 'Reduces this quarter’s regional margin by an estimated 2%.',
    attachments: ['SO-1051-discount-approval.pdf'],
  },
  {
    id: 'exp-2201',
    category: 'Expenses',
    record: 'EXP-2201',
    title: 'EXP-2201 · Priya Shah',
    context: 'Meal expense over per-diem limit',
    elapsed: '3h ago',
    step: 'Step 1 of 1',
    requester: 'Priya Shah',
    policy: 'Expenses over the $75 daily per-diem require a manager’s approval before reimbursement.',
    summary: [
      { label: 'Amount', value: '$184.50' },
      { label: 'Category', value: 'Meals & entertainment' },
      { label: 'Employee', value: 'Priya Shah' },
    ],
    budgetImpact: '$109.50 over the per-diem limit for this trip.',
    attachments: ['receipt-scan.jpg'],
  },
  {
    id: 'je-0847',
    category: 'Journal entries',
    record: 'JE-0847',
    title: 'JE-0847 · Month-end accrual',
    context: 'Manual entry to a closed-period account',
    elapsed: '6h ago',
    step: 'Step 2 of 2',
    requester: 'Marcus Webb',
    policy: 'Manual entries to Accrued Liabilities require controller sign-off before posting.',
    summary: [
      { label: 'Amount', value: '$8,450.00' },
      { label: 'Account', value: 'Accrued Liabilities' },
      { label: 'Requester', value: 'Marcus Webb' },
    ],
    budgetImpact: 'Brings the September accrual balance to $42,900.',
    attachments: ['JE-0847-support.xlsx'],
  },
  {
    id: 'ar-118',
    category: 'Access requests',
    record: 'AR-118',
    title: 'AR-118 · Priya Shah',
    context: 'Requesting the Finance role',
    elapsed: '1d ago',
    step: 'Step 1 of 1',
    requester: 'Priya Shah',
    policy: 'Requests for the Finance role need a Finance admin’s approval before access is granted.',
    summary: [
      { label: 'Role requested', value: 'Finance — Read/write' },
      { label: 'Requested by', value: 'Priya Shah' },
      { label: 'Reason', value: 'Covering month-end close for the team' },
    ],
    budgetImpact: 'Adds 1 seat to the Finance role tier — no added license cost this cycle.',
    attachments: ['manager-approval-email.pdf'],
  },
];

export function Approvals() {
  const [selectedId, setSelectedId] = useState(QUEUE[0].id);
  const [comment, setComment] = useState('');

  const selected = QUEUE.find((item) => item.id === selectedId) ?? QUEUE[0];

  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 1120, margin: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Density value="compact">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Text variant="heading">Approvals</Text>
              <Text variant="caption">{QUEUE.length} waiting on you</Text>
            </div>
            <div style={{ flex: 1 }} />
            <Button type="button" variant="secondary">
              Delegate
            </Button>
            <Button type="button" variant="ghost">
              History
            </Button>
          </div>
        </Density>

        <FilterTabs tabs={TABS} selected="Mine" />

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div
            role="region"
            aria-label="Approval queue"
            style={{ flex: '0 1 380px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {QUEUE.map((item) => (
              <Card
                key={item.id}
                selected={item.id === selectedId}
                onClick={() => setSelectedId(item.id)}
                aria-label={`View ${item.title}`}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                  <Text variant="title">{item.title}</Text>
                  <Chip variant="status" tone="neutral">
                    {item.category}
                  </Chip>
                </div>
                <Text variant="caption">
                  {item.context} · {item.elapsed} · {item.step}
                </Text>
              </Card>
            ))}
          </div>

          <div style={{ flex: '1 1 420px', minWidth: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Text variant="title">{selected.title}</Text>
                <Chip variant="status" tone="accent">
                  {selected.step}
                </Chip>
              </div>
              <Text variant="caption">
                Requested by {selected.requester} · {selected.elapsed}
              </Text>
              <Text variant="body">{selected.policy}</Text>
            </Card>

            <Card>
              <Text variant="caption" as="h3">
                Record summary
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
                {selected.summary.map((field) => (
                  <div key={field.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Text variant="caption" as="span">
                      {field.label}
                    </Text>
                    <Text variant="body">{field.value}</Text>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <Text variant="caption" as="h3">
                Budget impact
              </Text>
              <Text variant="body">{selected.budgetImpact}</Text>
            </Card>

            <Card>
              <Text variant="caption" as="h3">
                Attachments
              </Text>
              <ul style={{ margin: 0, paddingInlineStart: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {selected.attachments.map((file) => (
                  <li key={file}>
                    <Text variant="body" as="span">
                      {file}
                    </Text>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <Density value="compact">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    {/* This package's Input has no multiline/textarea variant — same disclosed
                        simplification as Inbox.tsx's reply composer: a single-line comment field
                        stands in for what a real approval comment box would render as an
                        expanding multi-line box. */}
                    <Input label="Comment" placeholder="Add a comment (optional)" value={comment} onChange={(event) => setComment(event.target.value)} />
                  </div>
                </div>
              </Density>
              <Density value="compact">
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Button type="button" variant="ghost">
                    Open record ↗
                  </Button>
                  <Button type="button" variant="secondary">
                    Request changes
                  </Button>
                  <Button type="button" variant="primary">
                    Approve
                  </Button>
                  <Button type="button" variant="danger">
                    Reject
                  </Button>
                </div>
              </Density>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
