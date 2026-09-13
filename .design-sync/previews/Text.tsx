import { Text } from '@busyoffice/design-system';

const stack = { display: 'flex', flexDirection: 'column' as const, gap: 12 };

export function TypeScale() {
  return (
    <div style={stack}>
      <Text variant="display">Quarterly review</Text>
      <Text variant="heading">Purchase orders</Text>
      <Text variant="title">Order total</Text>
      <Text variant="body">
        Rejecting this order will notify the requester and Finance. Your comment will be visible to both and saved to
        the record history.
      </Text>
      <Text variant="caption">Created 3 days ago by J. Rivera</Text>
      <Text variant="overline">Records</Text>
    </div>
  );
}

export function RecordHeader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Text variant="overline">Sales order</Text>
      <Text variant="heading">SO-1042 · Northwind Traders</Text>
      <Text variant="caption">Awaiting approval · Created 3 days ago by J. Rivera</Text>
    </div>
  );
}

export function CustomElement() {
  return (
    <div style={stack}>
      <Text variant="title" as="h2">Line items</Text>
      <Text variant="body" as="span">12 lines across 3 suppliers</Text>
    </div>
  );
}
