import { Input } from '@busyoffice/design-system';

const stack = { display: 'flex', flexDirection: 'column' as const, gap: 16, maxWidth: 360 };

export function Labelled() {
  return (
    <div style={stack}>
      <Input label="Vendor name" placeholder="Acme Supply Co." />
      <Input label="Tax ID" defaultValue="94-3210987" />
    </div>
  );
}

export function Error() {
  return (
    <div style={stack}>
      <Input label="Tax ID" defaultValue="9432" error="Tax ID must be 9 digits." />
      <Input label="Comment" placeholder="Required for a rejection" error="A comment is required." />
    </div>
  );
}

export function Search() {
  return (
    <div style={stack}>
      <Input placeholder="Search vendor or PO number..." />
      <Input placeholder="Search records, run actions, jump to pages…" disabled />
    </div>
  );
}
