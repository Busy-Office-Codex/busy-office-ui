import { Card, Text } from '@busyoffice/design-system';

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 };
const stack = { display: 'flex', flexDirection: 'column' as const, gap: 8 };

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div style={stack}>
      <Text variant="title">{label}</Text>
      <Text variant="heading">{value}</Text>
    </div>
  );
}

export function SummaryTiles() {
  return (
    <div style={grid}>
      <Card><Kpi label="Order total" value="$24,300" /></Card>
      <Card><Kpi label="Line items" value="12" /></Card>
      <Card><Kpi label="Requested by" value="Sales — East region" /></Card>
    </div>
  );
}

export function States() {
  return (
    <div style={grid}>
      <Card><Kpi label="Open orders" value="38" /></Card>
      <Card selected><Kpi label="Awaiting approval" value="7" /></Card>
      <Card disabled><Kpi label="Archived" value="412" /></Card>
    </div>
  );
}

export function Interactive() {
  return (
    <div style={grid}>
      <Card onClick={() => {}}><Kpi label="Receivables" value="$118,940" /></Card>
      <Card onClick={() => {}} selected><Kpi label="Payables" value="$62,110" /></Card>
    </div>
  );
}
