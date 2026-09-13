import { Chip, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '@busyoffice/design-system';

const ORDERS = [
  { po: 'PO-1042', vendor: 'Alden Paper Co.', status: 'Awaiting approval', tone: 'accent' as const, amount: '$1,240.00' },
  { po: 'PO-1041', vendor: 'Northgate Office Supply', status: 'Confirmed', tone: 'strong' as const, amount: '$8,960.50' },
  { po: 'PO-1038', vendor: 'Redline Facilities Group', status: 'Overdue', tone: 'danger' as const, amount: '$3,415.75' },
  { po: 'PO-1035', vendor: 'Summit Hardware & Tools', status: 'Confirmed', tone: 'strong' as const, amount: '$620.00' },
];

const frame = { border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' as const };

export function PurchaseOrders() {
  return (
    <div style={frame}>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Order</TableHeaderCell>
            <TableHeaderCell>Vendor</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell align="end">Amount</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ORDERS.map((order) => (
            <TableRow key={order.po}>
              <TableCell>{order.po}</TableCell>
              <TableCell>{order.vendor}</TableCell>
              <TableCell>
                <Chip variant="status" tone={order.tone}>{order.status}</Chip>
              </TableCell>
              <TableCell align="end">{order.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function Empty() {
  return (
    <div style={frame}>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Invoice</TableHeaderCell>
            <TableHeaderCell>Customer</TableHeaderCell>
            <TableHeaderCell align="end">Total</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <Text variant="caption">No invoices match these filters.</Text>
            </TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
