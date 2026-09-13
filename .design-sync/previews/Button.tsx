import { Button } from '@busyoffice/design-system';

const row = { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const };

export function Variants() {
  return (
    <div style={row}>
      <Button variant="primary">New purchase order</Button>
      <Button variant="secondary">Export</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="danger">Reject</Button>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={row}>
      <Button variant="primary" disabled>Approve</Button>
      <Button variant="secondary" disabled>Request changes</Button>
      <Button variant="danger" disabled>Delete supplier</Button>
    </div>
  );
}

export function ActionRow() {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
      <Button variant="ghost">Cancel</Button>
      <Button variant="secondary">Request changes</Button>
      <Button variant="primary">Approve</Button>
    </div>
  );
}
