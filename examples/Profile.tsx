import { Button, Card, Chip, Density, Input, Text } from '../src/index.js';

/**
 * A user account settings page: avatar + name/role header with a "Change
 * photo" action, a tab-selector row, and a settings form. Mirrors
 * `templates/erp-skeleton`'s "07 Profile" screen. Meant to render as the
 * content inside `AppShell` (module="General", route "Profile") — see
 * AppShell.tsx.
 *
 * This repo has no `Tab` component, so the tab row reuses filter `Chip`
 * (`variant="filter"`) the same way `Shell`'s own command-palette category
 * row does (`src/shell/Shell.tsx`) — one reusable selection affordance
 * instead of a new single-purpose component (AGENTS.md: "no prop or export
 * with a single caller"). Only "Details" is selected, and it's the only tab
 * with real content below it — "Roles & access" / "Preferences" /
 * "Security" / "Activity" render as present-but-inactive chips with no
 * switching logic, per this milestone's structural-first-pass scope.
 */
const TABS = ['Details', 'Roles & access', 'Preferences', 'Security', 'Activity'];

const PROFILE = {
  fullName: 'Alex Morgan',
  jobTitle: 'Sales Manager',
  email: 'alex.morgan@acmeco.com',
  phone: '+1 (415) 555-0142',
  department: 'Sales — East region',
  manager: 'Jordan Lee',
  language: 'English (United States)',
  timeZone: '(UTC-05:00) Eastern Time',
};

export function Profile() {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Decorative placeholder avatar — same pattern as AppShell.tsx's account-slot avatar
              div, sized up for a header rather than a command-bar slot. */}
          <div aria-hidden="true" style={{ width: 64, height: 64, borderRadius: 999, background: '#e2e8f0', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text variant="heading">{PROFILE.fullName}</Text>
            <Text variant="caption">
              {PROFILE.jobTitle} · {PROFILE.email}
            </Text>
          </div>
          <div style={{ flex: 1 }} />
          <Density value="compact">
            <Button type="button" variant="secondary">
              Change photo
            </Button>
          </Density>
        </div>

        <Density value="compact">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TABS.map((tab) => (
              <Chip key={tab} variant="filter" selected={tab === 'Details'}>
                {tab}
              </Chip>
            ))}
          </div>
        </Density>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(200px, 1fr))', gap: 16 }}>
              <Input label="Full name" defaultValue={PROFILE.fullName} />
              <Input label="Job title" defaultValue={PROFILE.jobTitle} />
              <Input label="Email" type="email" defaultValue={PROFILE.email} />
              <Input label="Phone" type="tel" defaultValue={PROFILE.phone} />
              <Input label="Department" defaultValue={PROFILE.department} />
              <Input label="Manager" defaultValue={PROFILE.manager} />
              <Input label="Language" defaultValue={PROFILE.language} />
              <Input label="Time zone" defaultValue={PROFILE.timeZone} />
            </div>
            <Density value="compact">
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
                <Button type="button" variant="primary">
                  Save
                </Button>
              </div>
            </Density>
          </div>
        </Card>
      </div>
    </div>
  );
}
