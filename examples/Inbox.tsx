import { useState } from 'react';
import { Button, Card, Chip, Density, Dropdown, Input, Text } from '../src/index.js';
import { color } from '../src/tokens.stylex.js';

/**
 * A two-pane inbox: a filterable thread list on the left, and a linked-record
 * context + message thread + reply composer on the right. Mirrors
 * `templates/erp-skeleton`'s "04 Inbox" screen. Meant to render as the
 * content inside `AppShell` (module="General", route "Inbox" — see
 * `AppShell.tsx`'s `NAV.General`, which already lists "Inbox" as a sibling
 * screen).
 *
 * The right-pane detail is a single static pairing with `SELECTED_THREAD_ID`
 * (the one thread rendered with `Card`'s `selected` prop) rather than a full
 * click-to-switch inbox — per this milestone's structural-first-pass scope,
 * a static always-visible detail pane is enough to show the composition.
 * `Filter` is still real (`Dropdown` + `useState`, same controlled pattern as
 * ListReport.tsx's toolbar filters) and does narrow the left-pane thread
 * list; it's independent of which thread the detail pane shows, so picking a
 * filter that excludes the highlighted thread just means the list no longer
 * shows it selected, not that the right pane goes blank.
 *
 * The detail pane deliberately reuses RecordDetail.tsx's exact SO-1042 ·
 * Northwind Traders sample data (same order total, same "Awaiting approval"
 * status/tone) rather than inventing a new record — one consistent sample
 * order across the example pages that reference it.
 *
 * The thread list (owner-directed restyle, 2026-09-15, inspired by a Linear
 * inbox screenshot) trades a full bordered `Card` per thread for flat,
 * single-line-truncated rows inside ONE wrapping `Card`, separated by a
 * hairline — the same group-of-flat-rows pattern `NotificationRow` already
 * established in Notifications.tsx, not a new one invented for this file.
 * Each row gets a small category-colored initial badge (existing color
 * tokens only — `accent` for Mentions, `action` for Assigned, `textDisabled`
 * for System — not a new arbitrary palette) so category reads as more than
 * text alone, and the row is markedly shorter (one line of context instead
 * of a full card), closer to a scannable list than a stack of cards.
 */

type ThreadCategory = 'Mentions' | 'Assigned' | 'System';

type Thread = {
  id: string;
  subject: string;
  record?: string;
  category: ThreadCategory;
  sender: string;
  preview: string;
  timestamp: string;
};

const THREADS: Thread[] = [
  {
    id: 'th-1',
    subject: 'Approval needed · linked to SO-1042',
    record: 'SO-1042',
    category: 'Assigned',
    sender: 'Jordan Lee',
    preview: "Northwind's order is over the auto-approve threshold and needs your sign-off.",
    timestamp: '10:42 AM',
  },
  {
    id: 'th-2',
    subject: 'You were mentioned on PO-1042',
    record: 'PO-1042',
    category: 'Mentions',
    sender: 'Priya Shah',
    preview: 'Flagging you in case the expected date needs to move up a week.',
    timestamp: '9:15 AM',
  },
  {
    id: 'th-3',
    subject: 'Question about PO-1038',
    record: 'PO-1038',
    category: 'Mentions',
    sender: 'Marcus Webb',
    preview: 'Redline says this shipment is already overdue — any update on receiving?',
    timestamp: 'Yesterday',
  },
  {
    id: 'th-4',
    subject: 'Assigned: expedite PO-1035',
    record: 'PO-1035',
    category: 'Assigned',
    sender: 'Priya Shah',
    preview: 'Summit can only partially fulfill this order — please confirm the split shipment.',
    timestamp: 'Yesterday',
  },
  {
    id: 'th-5',
    subject: 'Backorder alert · linked to PO-1021',
    record: 'PO-1021',
    category: 'System',
    sender: 'System',
    preview: 'Harborline Print & Signage marked 2 line items as backordered.',
    timestamp: 'Sep 12',
  },
  {
    id: 'th-6',
    subject: 'Weekly digest is ready',
    category: 'System',
    sender: 'System',
    preview: '6 approvals, 3 overdue orders, and 12 new records this week.',
    timestamp: 'Sep 08',
  },
];

const MESSAGES = [
  {
    id: 'm-1',
    sender: 'Jordan Lee',
    timestamp: '9:14 AM',
    text: "Can you take a look at SO-1042? We're over the auto-approve threshold.",
  },
  {
    id: 'm-2',
    sender: 'You',
    timestamp: '9:20 AM',
    text: 'On it — reviewing the line items now.',
  },
  {
    id: 'm-3',
    sender: 'Jordan Lee',
    timestamp: '10:42 AM',
    text: "Northwind's asking for a same-week ship date, so it's a bit urgent.",
  },
];

const FILTER_ITEMS: Array<'All' | ThreadCategory> = ['All', 'Mentions', 'Assigned', 'System'];
const SELECTED_THREAD_ID = 'th-1';

const CATEGORY_COLOR: Record<ThreadCategory, string> = {
  Mentions: color.accent,
  Assigned: color.action,
  System: color.textDisabled,
};

function ThreadRow({ thread, selected, isLast }: { thread: Thread; selected: boolean; isLast: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '10px 4px',
        background: selected ? color.bgSubtle : 'transparent',
        borderBottom: isLast ? 'none' : `1px solid ${color.borderSubtle}`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          flexShrink: 0,
          background: CATEGORY_COLOR[thread.category],
          color: color.textOnInk,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {thread.sender.charAt(0)}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            <Text variant="body">{thread.subject}</Text>
          </div>
          <Text variant="caption" as="span">
            {thread.timestamp}
          </Text>
        </div>
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          <Text variant="caption">
            {thread.sender} · {thread.preview}
          </Text>
        </div>

        {/* Assign/Archive get their own line, not the title's — sharing the title's row with
            two buttons squeezed a long subject down to 1-2 characters before ellipsis on a
            narrow/mobile row (caught visually, not just by the no-horizontal-overflow check:
            that check passed while the title was already unreadable). This keeps the row
            compact — no per-thread Card — while staying legible at every width, without a
            `@media` query. */}
        <Density value="compact">
          <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
            {/* Every row's Assign/Archive repeats the same visible text — disambiguating
                aria-label per row, same precedent as ListReport.tsx's row-selection
                checkboxes ("Select ${order.po}"). */}
            <Button type="button" variant="ghost" aria-label={`Assign ${thread.subject}`}>
              Assign
            </Button>
            <Button type="button" variant="ghost" aria-label={`Archive ${thread.subject}`}>
              Archive
            </Button>
          </div>
        </Density>
      </div>
    </div>
  );
}

export function Inbox() {
  const [filter, setFilter] = useState<'All' | ThreadCategory>('All');

  const visibleThreads = THREADS.filter((thread) => filter === 'All' || thread.category === filter);

  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* No page-level `maxWidth` cap — fills whatever width AppShell gives it (see
          docs/design-conventions.md's "Page width and responsive layout"); the thread-list and
          detail-pane columns below use flexible bases so the row wraps to a stacked mobile
          layout on its own. */}
      <div style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Density value="compact">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text variant="heading">Inbox</Text>
            <div style={{ flex: 1 }} />
            <Dropdown
              label={`Filter · ${filter}`}
              items={FILTER_ITEMS.map((label) => ({ label, selected: label === filter }))}
              onSelect={(label) => setFilter(label as 'All' | ThreadCategory)}
              active={filter !== 'All'}
            />
            <Button type="button" variant="secondary">
              Mark all read
            </Button>
          </div>
        </Density>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 400px', minWidth: 320, maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visibleThreads.length > 0 ? (
              <Card>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {visibleThreads.map((thread, index) => (
                    <ThreadRow
                      key={thread.id}
                      thread={thread}
                      selected={thread.id === SELECTED_THREAD_ID}
                      isLast={index === visibleThreads.length - 1}
                    />
                  ))}
                </div>
              </Card>
            ) : (
              <Card role="status">
                <Text variant="body">No threads match this filter.</Text>
              </Card>
            )}
          </div>

          <div style={{ flex: '2 1 380px', minWidth: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Text variant="title">SO-1042 · Northwind Traders</Text>
                <Chip variant="status" tone="accent">
                  Awaiting approval
                </Chip>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Text variant="caption" as="span">
                    Order total
                  </Text>
                  <Text variant="body">$24,300</Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Text variant="caption" as="span">
                    Requested by
                  </Text>
                  <Text variant="body">Sales — East region</Text>
                </div>
              </div>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MESSAGES.map((message) => (
                <div key={message.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Text variant="caption">
                    {message.sender} · {message.timestamp}
                  </Text>
                  <Text variant="body">{message.text}</Text>
                </div>
              ))}
            </div>

            <Card>
              <Density value="compact">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button type="button" variant="ghost">
                    @ Mention
                  </Button>
                  <Button type="button" variant="ghost">
                    Attach
                  </Button>
                  <Button type="button" variant="ghost">
                    / Command
                  </Button>
                </div>
              </Density>
              <Density value="compact">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    {/* This package's Input has no multiline/textarea variant — a disclosed
                        simplification: a single-line placeholder reply field stands in for what
                        a real composer would render as an expanding multi-line box. */}
                    <Input aria-label="Reply" placeholder="Reply…" />
                  </div>
                  <Button type="button" variant="primary">
                    Send
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
