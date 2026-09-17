import { useState } from 'react';
import { Card, Chart, type ChartSeries, Dropdown, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { color, space } from '../src/tokens.stylex.js';
import { appStore } from './data/appStore.js';
import { useStoreState } from './data/store.js';

/**
 * BI "Explore" — a real pivot-result screen (ROADMAP item 34's "BI explore" slice, closing issue
 * #16's own named "20 BI explore" consumer, fills `NAV.BI`'s pre-existing "Explore" placeholder).
 * A "Pivot by" picker re-slices the SAME live `stockLevels` data two different ways — the same
 * real aggregations `Inventory.tsx`'s own bar (by warehouse) and donut (by material) charts
 * already compute, recomputed here from the same store on every render (not a hardcoded literal,
 * so there is no drift risk the way a duplicated sample-data array would carry), reused rather
 * than duplicated as new business logic. A chart plus its own result `Table` below it, the shape
 * a real BI explore tool's "pivot result" actually takes.
 *
 * Deliberately does NOT add issue #16's own "Pie" ask to `Chart`'s public `type` union. ROADMAP's
 * own Objective 1 ("Refuse a prop, variant or component with one caller") and Objective 3 ("A new
 * shared component needs two named consumers... raised as a [UI request] issue") both apply: this
 * screen is the ONLY named consumer anywhere in this repo's own issue #16 text for a `'pie'`
 * variant — nothing else asks for one. Rather than force-fit a second, invented consumer to clear
 * that bar, or add the variant unilaterally without one, this screen renders its pivot as `'bar'`
 * (the existing type already correctly serving this exact single-dimension-breakdown shape) and
 * the `'pie'` request is raised as its own `[UI request]` issue instead — the same "don't force a
 * bar this batch can't honestly clear" discipline `Icon`'s own non-migrated QR glyph and item 49's
 * two disclosed un-tokened ambers already established elsewhere in this codebase.
 */

type PivotDimension = 'Warehouse' | 'Material';

const PIVOT_DIMENSIONS: PivotDimension[] = ['Warehouse', 'Material'];

// Same abbreviation Inventory.tsx's own donut legend already uses, for the same reason (a full
// catalog description truncates unreadably in a chart legend column).
const SHORT_NAME: Record<string, string> = { 'mat-paper': 'Paper', 'mat-cable': 'Cable', 'mat-switch': 'Switches' };

// Per-pivot metric — the "by warehouse" pivot can't honestly share the "by material" pivot's own
// "units on hand" label (ROADMAP item 52/issue #22): `qtyOnHand` uses a different unit per
// material (ream/spool/unit — each Product's own `unit` field, examples/data/seed.ts), so summing
// it ACROSS materials within one warehouse would silently combine incompatible physical
// quantities. Summing it across warehouses for a SINGLE material (the "by material" pivot) stays a
// genuine physical-quantity total, since that never crosses a unit boundary.
const PIVOT_METRIC: Record<PivotDimension, { label: string; valueLabel: string }> = {
  Warehouse: { label: 'Materials stocked', valueLabel: 'materials' },
  Material: { label: 'Units on hand', valueLabel: 'units' },
};

export function BiExplore() {
  const state = useStoreState(appStore, (s) => s);
  const [pivotBy, setPivotBy] = useState<PivotDimension>('Warehouse');

  // Same fix as Inventory.tsx's own "stock by warehouse" bar chart: counts distinct materials
  // stocked per warehouse instead of summing `qtyOnHand` across materials that use different units.
  const byWarehouse: ChartSeries = Object.values(state.warehouses).map((warehouse) => ({
    label: warehouse.name,
    value: state.stockLevels.filter((level) => level.warehouseId === warehouse.id).length,
  }));

  // Byte-identical to Inventory.tsx's own "mix by material" donut chart aggregation — scoped to
  // one material at a time, so summing across warehouses here never crosses a unit boundary.
  const byMaterial: ChartSeries = Object.values(state.products)
    .filter((product) => state.stockLevels.some((level) => level.productId === product.id))
    .map((product) => ({
      label: SHORT_NAME[product.id] ?? product.description,
      value: state.stockLevels.filter((level) => level.productId === product.id).reduce((sum, level) => sum + level.qtyOnHand, 0),
    }));

  const data = pivotBy === 'Warehouse' ? byWarehouse : byMaterial;
  const metric = PIVOT_METRIC[pivotBy];

  return (
    <div
      style={{
        background: color.bgCanvas,
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: space.space6,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: space.space6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.space2 }}>
          <Text variant="heading">Explore</Text>
          <Text variant="body">Pivot live stock-on-hand data by warehouse or by material.</Text>
        </div>

        <Dropdown
          label={`Pivot by · ${pivotBy}`}
          items={PIVOT_DIMENSIONS.map((dimension) => ({ label: dimension, selected: dimension === pivotBy }))}
          onSelect={(label) => setPivotBy(label as PivotDimension)}
          active={pivotBy !== PIVOT_DIMENSIONS[0]}
        />

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.space4 }}>
            <Text variant="title">
              {metric.label} by {pivotBy.toLowerCase()}
            </Text>
            <Chart type="bar" title={`${metric.label} by ${pivotBy.toLowerCase()}`} valueLabel={metric.valueLabel} data={data} />
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.space4 }}>
            <Text variant="title">Pivot result</Text>
            <Table aria-label={`${metric.label} by ${pivotBy.toLowerCase()}, table`}>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>{pivotBy}</TableHeaderCell>
                  <TableHeaderCell align="end">{metric.label}</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((point) => (
                  <TableRow key={point.label}>
                    <TableCell>{point.label}</TableCell>
                    <TableCell align="end">
                      {point.value.toLocaleString('en-US')} {metric.valueLabel}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
