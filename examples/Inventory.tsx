import { Chart, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { appStore } from './data/appStore.js';
import { useStoreState } from './data/store.js';
// Theme-safe page chrome (docs/design-conventions.md's "Theme-safe page chrome" recipe, extending
// the ListReport.tsx/RecordDetail.tsx pass to this page): this page's own background/border
// literals were raw hex duplicating color.* token values without reading them, so they stayed the
// light-mode value under dark mode instead of re-tinting. Same established idiom 9 other
// examples/*.tsx files already use.
import { color, space } from '../src/tokens.stylex.js';

/**
 * Stock overview + stock by location + movement history (ROADMAP M7's ERP reference-app
 * initiative, Slice 2). New screen — the gap inventory found the entire Inventory module at zero
 * coverage, and its own "stock overview" was one of the 5 items ROADMAP issue #16 explicitly
 * named and left blocked pending a Chart primitive. That primitive landed earlier in M7
 * (src/components/Chart.tsx); this is its second real consumer, and the "stock by warehouse" bar
 * chart below is issue #16's own literal named scenario for this exact screen.
 *
 * Reads live from the shared `examples/data` store — `stockLevels`/`stockMovements` genuinely
 * change when Requisitions.tsx's "Receive goods" action posts a goods receipt; this screen is
 * the other end of that same connected journey; there's nothing to click here itself since a
 * stock LEVEL isn't a document with its own lifecycle the way a requisition/PO is.
 */

const formatQty = (qty: number, unit: string) => `${qty.toLocaleString('en-US')} ${unit}`;

// A short display name per material for the donut chart's legend specifically — found live: the
// full catalog descriptions ("500-sheet letterhead paper, ream") truncated unreadably in Chart's
// legend column. The full description stays everywhere else (the table below, and the chart's
// own accessible data table) — this is a chart-legend-only abbreviation, not a renamed material.
const SHORT_NAME: Record<string, string> = { 'mat-paper': 'Paper', 'mat-cable': 'Cable', 'mat-switch': 'Switches' };

export function Inventory() {
  const state = useStoreState(appStore, (s) => s);

  // `qtyOnHand` is NOT combinable across materials — mat-paper is reams, mat-cable is spools,
  // mat-switch is discrete units (see each Product's own `unit` field, examples/data/seed.ts).
  // Summing them into one physical "units on hand" total per warehouse (the bug this fix closes,
  // ROADMAP item 52/issue #22) silently added reams to spools to units as if they were the same
  // thing. This counts distinct materials stocked per warehouse instead — a real, honestly-labeled
  // figure, not an invented unit-conversion. (`state.stockLevels` never has more than one row per
  // product/warehouse pair — see appActions.receiveGoods/completeProductionOrder — so this count is
  // exactly the number of materials on hand there.) The donut below stays a physical-quantity sum
  // because it's scoped to ONE material at a time (always the same unit), which IS combinable.
  const byWarehouse = Object.values(state.warehouses).map((warehouse) => ({
    label: warehouse.name,
    value: state.stockLevels.filter((level) => level.warehouseId === warehouse.id).length,
  }));

  const rows = [...state.stockLevels].sort((a, b) => {
    const productA = state.products[a.productId]?.description ?? '';
    const productB = state.products[b.productId]?.description ?? '';
    return productA.localeCompare(productB) || a.warehouseId.localeCompare(b.warehouseId);
  });

  const movements = [...state.stockMovements].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div
      style={{
        background: color.bgCanvas,
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: space.space6,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: space.space5 }}>
        <Text variant="heading">Inventory</Text>

        <div style={{ display: 'flex', gap: space.space4, flexWrap: 'wrap', alignItems: 'stretch' }}>
          <div style={{ flex: '2 1 420px', minWidth: 320 }}>
            <div style={{ border: `1px solid ${color.border}`, borderRadius: 10, background: color.bgSurface, padding: space.space6, boxSizing: 'border-box', height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: space.space4 }}>
                <Text variant="title">Stock by warehouse</Text>
                <Chart type="bar" title="Materials stocked by warehouse" valueLabel="materials" data={byWarehouse} />
                <Text variant="caption">
                  Count of distinct materials on hand — on-hand quantities use a different unit per material (see the table below), so they
                  aren't combined into one physical total.
                </Text>
              </div>
            </div>
          </div>

          {/* minWidth 300, not 240 — found live: even the short "Switches" legend label (see
              SHORT_NAME below) still clipped at 240-260px, Chart.js's legend column needing a
              bit more room than the bar chart's own card. */}
          <div style={{ flex: '1 1 300px', minWidth: 300 }}>
            <div style={{ border: `1px solid ${color.border}`, borderRadius: 10, background: color.bgSurface, padding: space.space6, boxSizing: 'border-box', height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: space.space4 }}>
                <Text variant="title">Mix by material</Text>
                <Chart
                  type="donut"
                  title="Units on hand by material"
                  valueLabel="units"
                  data={Object.values(state.products)
                    .filter((product) => state.stockLevels.some((level) => level.productId === product.id))
                    .map((product) => ({
                      label: SHORT_NAME[product.id] ?? product.description,
                      value: state.stockLevels.filter((level) => level.productId === product.id).reduce((sum, level) => sum + level.qtyOnHand, 0),
                    }))}
                  height={180}
                />
              </div>
            </div>
          </div>
        </div>

        <Text variant="title">Stock by location</Text>
        <div
          role="region"
          aria-label="Stock by location table"
          tabIndex={0}
          style={{ border: `1px solid ${color.border}`, borderRadius: 10, background: color.bgSurface, overflowX: 'auto' }}
        >
          <div style={{ minWidth: 640 }}>
            <Density value="compact">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Material</TableHeaderCell>
                    <TableHeaderCell>Warehouse</TableHeaderCell>
                    <TableHeaderCell align="end">On hand</TableHeaderCell>
                    <TableHeaderCell align="end">Reserved</TableHeaderCell>
                    <TableHeaderCell align="end">Available</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((level) => {
                    const product = state.products[level.productId];
                    const warehouse = state.warehouses[level.warehouseId];
                    return (
                      <TableRow key={`${level.productId}-${level.warehouseId}`}>
                        <TableCell>{product?.description}</TableCell>
                        <TableCell>{warehouse?.name}</TableCell>
                        <TableCell align="end">{product ? formatQty(level.qtyOnHand, product.unit) : level.qtyOnHand}</TableCell>
                        <TableCell align="end">{product ? formatQty(level.qtyReserved, product.unit) : level.qtyReserved}</TableCell>
                        <TableCell align="end">{product ? formatQty(level.qtyOnHand - level.qtyReserved, product.unit) : level.qtyOnHand - level.qtyReserved}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Density>
          </div>
        </div>

        <Text variant="title">Movement history</Text>
        <div
          role="region"
          aria-label="Movement history table"
          tabIndex={0}
          style={{ border: `1px solid ${color.border}`, borderRadius: 10, background: color.bgSurface, overflowX: 'auto' }}
        >
          <div style={{ minWidth: 640 }}>
            <Density value="compact">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Material</TableHeaderCell>
                    <TableHeaderCell>Warehouse</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell align="end">Qty</TableHeaderCell>
                    <TableHeaderCell>Reference</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{movement.date}</TableCell>
                      <TableCell>{state.products[movement.productId]?.description}</TableCell>
                      <TableCell>{state.warehouses[movement.warehouseId]?.name}</TableCell>
                      <TableCell style={{ textTransform: 'capitalize' }}>{movement.type}</TableCell>
                      <TableCell align="end">{movement.qty > 0 ? `+${movement.qty}` : movement.qty}</TableCell>
                      <TableCell>{movement.reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Density>
          </div>
        </div>
      </div>
    </div>
  );
}
