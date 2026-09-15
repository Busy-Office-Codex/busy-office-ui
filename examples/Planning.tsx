import { useState } from 'react';
import { Button, Card, Chart, Chip, type ChipTone, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { appActions, appStore } from './data/appStore.js';
import { useStoreState } from './data/store.js';

/**
 * Planning overview + demand + material availability + recommendations (ROADMAP M7's ERP
 * reference-app initiative, Slice 3, Production planning — 0 of 7 named sub-screens existed
 * before this). Rather than a route per named concept ("demand inputs", "material availability",
 * "planning recommendations" as three separate screens with nothing else to do on any of them
 * alone), this one screen shows all three together — demand and availability are read-only
 * CONTEXT a planner needs to judge a recommendation, not their own independent worklists, so
 * splitting them out would just be three thin read-only pages a user has to tab between to make
 * one decision. See ProductionOrders.tsx for the next two hops (planned orders → production
 * orders → scheduling).
 *
 * "Planning calculations can be simulated" (the brief's own words) — the two open recommendations
 * below are pre-computed sample judgments (forecast vs. available stock), not a live MRP engine;
 * what's real is the resulting action: "Create planned order" is a genuine state transition, not
 * a static outcome.
 */

const REC_STATUS_TONE: Record<string, ChipTone> = { open: 'accent', actioned: 'strong', dismissed: 'neutral' };
const REC_STATUS_LABEL: Record<string, string> = { open: 'Open', actioned: 'Actioned', dismissed: 'Dismissed' };

let nextPlannedOrderSeq = 1;

export function Planning() {
  const state = useStoreState(appStore, (s) => s);
  const recommendationList = Object.values(state.planningRecommendations).sort((a, b) => (a.id < b.id ? 1 : -1));
  const [selectedId, setSelectedId] = useState(recommendationList[0]?.id ?? '');
  const selected = state.planningRecommendations[selectedId];
  const product = selected ? state.products[selected.productId] : undefined;
  const warehouse = selected ? state.warehouses[selected.warehouseId] : undefined;
  const availableNow = selected
    ? state.stockLevels
        .filter((level) => level.productId === selected.productId && level.warehouseId === selected.warehouseId)
        .reduce((sum, level) => sum + (level.qtyOnHand - level.qtyReserved), 0)
    : 0;
  const linkedPlannedOrder = selected?.plannedOrderId ? state.plannedOrders[selected.plannedOrderId] : undefined;

  const demandByProduct = Object.values(state.products)
    .filter((p) => state.demandForecasts.some((f) => f.productId === p.id))
    .map((p) => ({
      label: p.description.length > 18 ? p.description.slice(0, 16) + '…' : p.description,
      value: state.demandForecasts.filter((f) => f.productId === p.id).reduce((sum, f) => sum + f.forecastQty, 0),
    }));

  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Text variant="heading">Planning</Text>

        <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', padding: 24, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Text variant="title">Demand — October 2026</Text>
            <Chart type="bar" title="Forecast demand by material, October 2026" valueLabel="units" data={demandByProduct} height={180} />
          </div>
        </div>

        <Text variant="title">Planning recommendations</Text>
        <div
          role="region"
          aria-label="Planning recommendations table"
          tabIndex={0}
          style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' }}
        >
          <div style={{ minWidth: 640 }}>
            <Density value="compact">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Recommendation #</TableHeaderCell>
                    <TableHeaderCell>Material</TableHeaderCell>
                    <TableHeaderCell>Warehouse</TableHeaderCell>
                    <TableHeaderCell align="end">Suggested qty</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recommendationList.map((rec) => (
                    <TableRow
                      key={rec.id}
                      onClick={() => setSelectedId(rec.id)}
                      style={{ cursor: 'pointer', backgroundColor: rec.id === selectedId ? '#eff6ff' : undefined }}
                    >
                      <TableCell>{rec.id}</TableCell>
                      <TableCell>{state.products[rec.productId]?.description}</TableCell>
                      <TableCell>{state.warehouses[rec.warehouseId]?.name}</TableCell>
                      <TableCell align="end">{rec.suggestedQty}</TableCell>
                      <TableCell>
                        <Chip variant="status" tone={REC_STATUS_TONE[rec.status]}>
                          {REC_STATUS_LABEL[rec.status]}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Density>
          </div>
        </div>

        {selected && product && warehouse && (
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Text variant="title">{selected.id}</Text>
                <Chip variant="status" tone={REC_STATUS_TONE[selected.status]}>
                  {REC_STATUS_LABEL[selected.status]}
                </Chip>
                <div style={{ flex: 1 }} />
                <Text variant="caption">
                  {product.description} · {warehouse.name}
                </Text>
              </div>

              <Text variant="body">{selected.reason}</Text>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Text variant="caption">Available now</Text>
                  <Text variant="title" as="span">
                    {availableNow} {product.unit}
                  </Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Text variant="caption">Suggested qty</Text>
                  <Text variant="title" as="span">
                    {selected.suggestedQty} {product.unit}
                  </Text>
                </div>
              </div>

              {linkedPlannedOrder ? (
                <Text variant="body">Linked: Planned order {linkedPlannedOrder.id}</Text>
              ) : (
                <Text variant="caption">No linked planned order yet.</Text>
              )}

              {selected.status === 'open' && (
                <Density value="compact">
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <Button type="button" variant="secondary" onClick={() => appActions.dismissRecommendation(selected.id)}>
                      Dismiss
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => {
                        const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
                        const newId = `PLO-${6000 + nextPlannedOrderSeq}`;
                        nextPlannedOrderSeq += 1;
                        appActions.actionRecommendation(selected.id, newId, dueDate);
                      }}
                    >
                      Create planned order
                    </Button>
                  </div>
                </Density>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
