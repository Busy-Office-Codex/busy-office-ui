import { Chip } from '@busyoffice/design-system';

const row = { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const };

export function FilterChips() {
  return (
    <div style={row}>
      <Chip variant="filter" selected>All open · 24</Chip>
      <Chip variant="filter">Mine · 6</Chip>
      <Chip variant="filter">Overdue · 3</Chip>
      <Chip variant="filter" selected onRemove={() => {}}>Vendor: Alden Paper Co.</Chip>
      <Chip variant="filter" disabled>Archived</Chip>
    </div>
  );
}

export function StatusTones() {
  return (
    <div style={row}>
      <Chip variant="status" tone="neutral">Draft</Chip>
      <Chip variant="status" tone="strong">Confirmed</Chip>
      <Chip variant="status" tone="accent">Awaiting approval</Chip>
      <Chip variant="status" tone="danger">Overdue</Chip>
    </div>
  );
}

export function Counts() {
  return (
    <div style={row}>
      <Chip variant="status" tone="accent">7 waiting</Chip>
      <Chip variant="status" tone="accent">3</Chip>
      <Chip variant="status" tone="neutral">12 lines</Chip>
    </div>
  );
}
