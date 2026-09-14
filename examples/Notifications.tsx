import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { Button, Card, Density, Text } from '../src/index.js';
// This package has no Toggle/Switch export (see examples/Settings.tsx), so each channel row
// below reuses that same `<label>` + native `<input type="checkbox">` pattern, styled via the
// shared examples/checkboxStyles.ts examples/ListReport.tsx's row checkboxes also use — one
// checkbox look across this package's examples, not a fourth one invented for this file.
import { checkboxStyles } from './checkboxStyles.js';
import { FilterTabs } from './filterTabs.js';

/**
 * A notifications list page: header actions, a filter-Chip-as-tabs row (see Profile.tsx for why
 * this package uses filter `Chip` in place of a `Tab` component, which doesn't exist here), a
 * notification list grouped by day, and a channel-preferences panel below it. Mirrors
 * `templates/erp-skeleton`'s "05 · Notifications" screen. Meant to render as the content inside
 * `AppShell` (module="General", route "Notifications" — already present in AppShell.tsx's
 * `NAV.General`) — see AppShell.tsx.
 *
 * Only "Unread" is selected, and — matching Profile.tsx's structural-first-pass scope — the
 * other tabs ("Approvals" / "Orders" / "Finance" / "System") render as present-but-inactive
 * chips with no filtering logic yet.
 */

type NotificationAction = { label: string; ariaLabel: string };

type NotificationItem = {
  id: string;
  message: string;
  time: string;
  action?: NotificationAction;
};

type NotificationGroup = {
  label: string;
  items: NotificationItem[];
};

// Sample entities line up with the other example pages' sample data (PO-1042/PO-1029 are
// Jordan Lee's awaiting-approval purchase orders in ListReport.tsx; Northwind Traders is
// RecordDetail.tsx's sales-order customer and Settings.tsx's own org name; Austin, TX is
// Settings.tsx's org address) — one shared sample world across the examples, not fifteen
// unrelated ones.
const GROUPS: NotificationGroup[] = [
  {
    label: 'Today',
    items: [
      {
        id: 'po-1042',
        message: 'PO-1042 needs your approval',
        time: '10m ago',
        action: { label: 'Approve', ariaLabel: 'Approve PO-1042' },
      },
      {
        id: 'so-1038',
        message: 'SO-1038 was confirmed',
        time: '32m ago',
        action: { label: 'Open', ariaLabel: 'Open SO-1038' },
      },
      {
        id: 'inv-2231',
        message: 'Invoice INV-2231 is 3 days overdue',
        time: '1h ago',
        action: { label: 'Open', ariaLabel: 'Open INV-2231' },
      },
      {
        id: 'maintenance',
        message: 'Scheduled maintenance completes tonight at 11:00 PM',
        time: '3h ago',
      },
    ],
  },
  {
    label: 'Yesterday',
    items: [
      {
        id: 'po-1029',
        message: 'PO-1029 needs your approval',
        time: 'Yesterday, 4:15 PM',
        action: { label: 'Approve', ariaLabel: 'Approve PO-1029' },
      },
      {
        id: 'so-1035',
        message: 'SO-1035 shipped to Northwind Traders',
        time: 'Yesterday, 2:02 PM',
        action: { label: 'Open', ariaLabel: 'Open SO-1035' },
      },
      {
        id: 'sign-in',
        message: 'New sign-in from a device in Austin, TX',
        time: 'Yesterday, 9:40 AM',
      },
    ],
  },
];

const TABS = ['Unread', 'Approvals', 'Orders', 'Finance', 'System'];

type Channel = { key: string; label: string; defaultEnabled: boolean };

const CHANNELS: Channel[] = [
  { key: 'in-app', label: 'In-app', defaultEnabled: true },
  { key: 'email', label: 'Email', defaultEnabled: true },
  { key: 'push', label: 'Push', defaultEnabled: false },
  { key: 'digest', label: 'Weekly digest email', defaultEnabled: true },
];

// Each row's action button repeats the same visible text ("Approve"/"Open") across multiple
// rows, so `aria-label` disambiguates them the same way ListReport.tsx's row checkboxes do
// (`aria-label={`Select ${order.po}`}`) — a screen-reader user navigating by control name needs
// more than the shared visible label to tell rows apart.
function NotificationRow({ item, isLast }: { item: NotificationItem; isLast: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        paddingBlock: 10,
        borderBottom: isLast ? 'none' : '1px solid #e2e8f0',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text variant="body">{item.message}</Text>
        <Text variant="caption">{item.time}</Text>
      </div>
      {item.action && (
        <Button type="button" variant="secondary" aria-label={item.action.ariaLabel}>
          {item.action.label}
        </Button>
      )}
    </div>
  );
}

export function Notifications() {
  const [channelEnabled, setChannelEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(CHANNELS.map((channel) => [channel.key, channel.defaultEnabled])),
  );

  return (
    <div
      style={{
        background: '#f8fafc',
        padding: 24,
        boxSizing: 'border-box',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 760, margin: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Density value="compact">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text variant="heading">Notifications</Text>
            <div style={{ flex: 1 }} />
            <Button type="button" variant="ghost">
              Preferences
            </Button>
            <Button type="button" variant="secondary">
              Mark all read
            </Button>
          </div>
        </Density>

        <FilterTabs tabs={TABS} selected="Unread" />

        <Density value="compact">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {GROUPS.map((group) => (
              <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Text variant="overline">{group.label}</Text>
                <Card>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {group.items.map((item, index) => (
                      <NotificationRow key={item.id} item={item} isLast={index === group.items.length - 1} />
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </Density>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Text variant="title">Notification channels</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CHANNELS.map((channel) => (
                <label
                  key={channel.key}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
                >
                  <Text variant="body">{channel.label}</Text>
                  <input
                    type="checkbox"
                    checked={channelEnabled[channel.key]}
                    onChange={() =>
                      setChannelEnabled((prev) => ({ ...prev, [channel.key]: !prev[channel.key] }))
                    }
                    {...stylex.props(checkboxStyles.checkbox)}
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
