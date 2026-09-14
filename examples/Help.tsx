import { Button, Card, Chip, Density, Input, Text } from '../src/index.js';

/**
 * The Help center / setup-checklist screen. Mirrors `templates/erp-skeleton`'s
 * "08 · Help" screen (Claude Design project "Busy Office Design System"): a
 * help-article search field, a setup checklist with a completion count, a
 * guided-tour invitation, and a set of link-list sections (docs, shortcuts,
 * support, what's new). Meant to render as `AppShell`'s content for
 * module="General", route "Help" — see AppShell.tsx.
 */

type SetupStep = { label: string; done: boolean };

const SETUP_STEPS: SetupStep[] = [
  { label: 'Company profile', done: true },
  { label: 'Invite team', done: true },
  { label: 'Chart of accounts', done: true },
  { label: 'Import customers', done: false },
  { label: 'Connect a bank account', done: false },
  { label: 'Set approval policies', done: false },
];

const COMPLETED_STEPS = SETUP_STEPS.filter((step) => step.done).length;

// The batch spec calls this "three link-list sections" but names four —
// Docs & articles, Keyboard shortcuts, Contact support, What's new. Building
// all four, since each is individually named; treating "three" as a
// miscount rather than dropping one of the four named sections.
const LINK_SECTIONS: { title: string; items: string[] }[] = [
  {
    title: 'Docs & articles',
    items: [
      'Getting started with Busy Office',
      'Setting up your chart of accounts',
      'Creating your first purchase order',
      'Understanding approval policies',
    ],
  },
  {
    title: 'Keyboard shortcuts',
    items: ['⌘K — Open command palette', '⌘N — New record', '⌘/ — Search this page', 'Esc — Close dialog'],
  },
  {
    title: 'Contact support',
    items: ['Email support — support@busyoffice.example', 'Live chat — Mon–Fri, 8am–6pm ET', 'Submit a ticket'],
  },
  {
    title: "What's new",
    items: [
      'Approval policies now support multi-step routing',
      'New: bulk import for customers',
      'Dashboard KPI cards now support drill-down',
    ],
  },
];

export function Help() {
  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        // Matches the 24px content padding / border-box sizing shared by every other sample page
        // (see RecordDetail.tsx for the full box-sizing reasoning).
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* `margin: 0`, left-aligned like every other sample page's content frame. `maxWidth: 880` is
          this file's own call (no measured reference width available here) — wide enough for the
          two-column link-section grid below, narrower than RecordDetail's 960 since this page has
          no table to accommodate. */}
      <div style={{ maxWidth: 880, margin: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Text variant="heading">Help</Text>
          <Text variant="caption">Search articles, finish setup, or contact support.</Text>
        </div>

        <div style={{ maxWidth: 480 }}>
          <Input placeholder="Search help articles…" size="search" />
        </div>

        <Card>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <Text variant="title">Finish setting up your workspace</Text>
            <Text variant="caption">
              {COMPLETED_STEPS} of {SETUP_STEPS.length} complete
            </Text>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SETUP_STEPS.map((step) => (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Text variant="body">{step.label}</Text>
                {step.done ? (
                  <Chip variant="status" tone="strong">
                    Done
                  </Chip>
                ) : (
                  <Density value="compact">
                    <Button variant="ghost">Start</Button>
                  </Density>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Text variant="title">Take a guided tour</Text>
          <Text variant="caption">A five-minute walkthrough of records, approvals, and the command palette.</Text>
          <Density value="compact">
            <div>
              <Button variant="primary">Start tour</Button>
            </div>
          </Density>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {LINK_SECTIONS.map((section) => (
            <Card key={section.title}>
              <Text variant="title">{section.title}</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.items.map((item) => (
                  <Text key={item} variant="body">
                    {item}
                  </Text>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
