import { Chip, Density } from '../src/index.js';

// ROADMAP M6 (issue #17): extracted once this exact static filter-Chip-as-tabs row (only one
// tab ever selected, no onClick/switching logic — every M6 page using it is a structural-first-
// pass sample, not a real tab-switcher) reached 9 call sites across 8 files (Profile.tsx,
// RolePage.tsx, Notifications.tsx, Delivery.tsx x2, SalesOrderList.tsx, Approvals.tsx,
// BuilderForms.tsx, UsersAndRoles.tsx) — well past this repo's Objective 3 "two named consumers"
// bar. Internal to `examples/`, not a new package export (same category as
// `examples/checkboxStyles.ts`): every consumer needs exactly this and nothing more: a real
// `Tab` component with real switching would be a different, bigger decision.
export type FilterTabsProps = {
  tabs: readonly string[];
  selected: string;
};

export function FilterTabs({ tabs, selected }: FilterTabsProps) {
  return (
    <Density value="compact">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <Chip key={tab} variant="filter" selected={tab === selected}>
            {tab}
          </Chip>
        ))}
      </div>
    </Density>
  );
}
