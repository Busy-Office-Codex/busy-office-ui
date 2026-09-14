import * as React from 'react';
import {
  Button,
  Density,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@busyoffice/design-system';

const TIERS = ['compact', 'comfortable', 'spacious'] as const;

/** A live, real `Density`-wrapped `Button` + `Table` row for each of the three tiers, side by side. */
export function DensityShowcase() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      {TIERS.map((tier) => (
        <div key={tier} style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 220 }}>
          <strong style={{ textTransform: 'capitalize' }}>{tier}</strong>
          <Density value={tier}>
            <Button variant="primary">Approve</Button>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Order</TableHeaderCell>
                  <TableHeaderCell align="end">Amount</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>PO-1042</TableCell>
                  <TableCell align="end">$1,240.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Density>
        </div>
      ))}
    </div>
  );
}
