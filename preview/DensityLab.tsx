import {
  Button,
  Density,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../src/index.js';

/**
 * A dedicated preview route (`/#density-lab`, see client.tsx) for
 * `test/browser/density.spec.ts` (ROADMAP item 10). The default `/#examples` route (the
 * `ListReport` sample page under `AppShell`) wraps its own compact regions in `<Density
 * value="compact">` (ROADMAP item 16), each scoped to one part of the page — it doesn't
 * exercise the three tiers' *ambient* values side by side, or nesting one inside another. This
 * page exists purely to give those tests real, addressable elements for that; it isn't part of
 * the package's public example set (`examples/`) and isn't wired into `package.json`'s
 * `exports`.
 */
export function DensityLab() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24, fontFamily: '"IBM Plex Sans", sans-serif' }}>
      <section aria-label="tier heights">
        <Density value="compact">
          <Button variant="primary">Compact tier button</Button>
        </Density>
        <Density value="comfortable">
          <Button variant="primary">Comfortable tier button</Button>
        </Density>
        <Density value="spacious">
          <Button variant="primary">Spacious tier button</Button>
        </Density>
      </section>

      <section aria-label="nesting: compact region inside an ambient-comfortable page">
        <Button variant="primary">Page ambient button</Button>
        <Density value="compact">
          <Button variant="primary">Nested compact button</Button>
        </Density>
      </section>

      <section aria-label="nesting: inner tier overrides an outer, non-default tier">
        <Density value="spacious">
          <Button variant="primary">Outer spacious button</Button>
          <Density value="compact">
            <Button variant="primary">Inner compact button</Button>
          </Density>
        </Density>
      </section>

      <section aria-label="nesting: a comfortable region resets an active non-default ancestor">
        <Density value="compact">
          <Button variant="primary">Outer compact button</Button>
          <Density value="comfortable">
            <Button variant="primary">Inner comfortable button</Button>
          </Density>
        </Density>
      </section>

      <section aria-label="root font scaling">
        <Button variant="primary">Scaling probe button</Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Order</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow data-testid="scaling-probe-row">
              <TableCell>Scaling probe row content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
