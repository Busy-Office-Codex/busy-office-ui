import { Dropdown } from '@busyoffice/design-system';

const STATUSES = ['All statuses', 'Awaiting approval', 'Confirmed', 'Overdue'];

export function Closed() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Dropdown label="Status · All statuses" items={STATUSES.map((label) => ({ label, selected: label === 'All statuses' }))} />
      <Dropdown label="Vendor" items={[{ label: 'Alden Paper Co.' }, { label: 'Northgate Office Supply' }]} />
    </div>
  );
}

export function Open() {
  return (
    <div style={{ minHeight: 220 }}>
      <Dropdown
        label="Status · Awaiting approval"
        defaultOpen
        items={STATUSES.map((label) => ({ label, selected: label === 'Awaiting approval' }))}
      />
    </div>
  );
}
