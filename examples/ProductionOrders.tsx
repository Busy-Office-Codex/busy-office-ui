import { useState } from 'react';
import { Button, Card, Chip, type ChipTone, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { appActions, appStore } from './data/appStore.js';
import { useStoreState } from './data/store.js';
import { color, space } from '../src/tokens.stylex.js';

/**
 * Planned orders → production orders → a simple schedule (ROADMAP M7's ERP reference-app
 * initiative, Slice 3, Production planning — the second half of the chain Planning.tsx's
 * recommendations start). Same list-plus-detail-in-one-route pattern as Requisitions.tsx, whose
 * "show the whole chain in one detail card" judgment applies here too: once a production order
 * exists for a planned order, this screen's detail card shows and acts on it directly, rather
 * than sending the user to a third route for what's still one work item's own lifecycle.
 *
 * The schedule table at the bottom is real, not decorative — every production order in the store,
 * sorted by start date, is a lightweight but genuine answer to "scheduling/capacity", not a full
 * Gantt/board view (out of this slice's scope; nothing here claims to be one).
 */

const PLANNED_STATUS_TONE: Record<string, ChipTone> = { planned: 'accent', released: 'strong', cancelled: 'danger' };
const PLANNED_STATUS_LABEL: Record<string, string> = { planned: 'Planned', released: 'Released', cancelled: 'Cancelled' };

const PROD_STATUS_TONE: Record<string, ChipTone> = { released: 'accent', in_progress: 'accent', completed: 'strong', cancelled: 'danger' };
const PROD_STATUS_LABEL: Record<string, string> = { released: 'Released', in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancelled' };

let nextProductionOrderSeq = 1;

export function ProductionOrders() {
  const state = useStoreState(appStore, (s) => s);
  const plannedList = Object.values(state.plannedOrders).sort((a, b) => (a.id < b.id ? 1 : -1));
  const [selectedId, setSelectedId] = useState(plannedList[0]?.id ?? '');
  const selected = state.plannedOrders[selectedId];
  const product = selected ? state.products[selected.productId] : undefined;
  const warehouse = selected ? state.warehouses[selected.warehouseId] : undefined;
  const linkedProductionOrder = selected?.productionOrderId ? state.productionOrders[selected.productionOrderId] : undefined;

  const schedule = Object.values(state.productionOrders).sort((a, b) => (a.startDate < b.startDate ? -1 : 1));

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
        <Text variant="heading">Production orders</Text>

        {plannedList.length === 0 ? (
          <Card role="status">
            <Text variant="body">No planned orders yet. Action a recommendation on the Planning screen to create one.</Text>
          </Card>
        ) : (
          <>
            <div
              role="region"
              aria-label="Planned orders table"
              tabIndex={0}
              style={{ border: `1px solid ${color.border}`, borderRadius: 10, background: color.bgSurface, overflowX: 'auto' }}
            >
              <div style={{ minWidth: 640 }}>
                <Density value="compact">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Planned order #</TableHeaderCell>
                        <TableHeaderCell>Material</TableHeaderCell>
                        <TableHeaderCell>Warehouse</TableHeaderCell>
                        <TableHeaderCell align="end">Qty</TableHeaderCell>
                        <TableHeaderCell>Due date</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {plannedList.map((planned) => (
                        <TableRow
                          key={planned.id}
                          onClick={() => setSelectedId(planned.id)}
                          style={{ cursor: 'pointer', backgroundColor: planned.id === selectedId ? color.bgSelected : undefined }}
                        >
                          <TableCell>{planned.id}</TableCell>
                          <TableCell>{state.products[planned.productId]?.description}</TableCell>
                          <TableCell>{state.warehouses[planned.warehouseId]?.name}</TableCell>
                          <TableCell align="end">{planned.qty}</TableCell>
                          <TableCell>{planned.dueDate}</TableCell>
                          <TableCell>
                            <Chip variant="status" tone={PLANNED_STATUS_TONE[planned.status]}>
                              {PLANNED_STATUS_LABEL[planned.status]}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: space.space4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: space.space3, flexWrap: 'wrap' }}>
                    <Text variant="title">{selected.id}</Text>
                    <Chip variant="status" tone={PLANNED_STATUS_TONE[selected.status]}>
                      {PLANNED_STATUS_LABEL[selected.status]}
                    </Chip>
                    <div style={{ flex: 1 }} />
                    <Text variant="caption">
                      {selected.qty} {product.unit} · due {selected.dueDate}
                    </Text>
                  </div>

                  {linkedProductionOrder ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <Text variant="body">
                        Linked: Production order {linkedProductionOrder.id} · started {linkedProductionOrder.startDate}
                      </Text>
                      <Chip variant="status" tone={PROD_STATUS_TONE[linkedProductionOrder.status]}>
                        {PROD_STATUS_LABEL[linkedProductionOrder.status]}
                      </Chip>
                    </div>
                  ) : (
                    <Text variant="caption">No linked production order yet.</Text>
                  )}

                  <Density value="compact">
                    <div style={{ display: 'flex', gap: space.space3, justifyContent: 'flex-end' }}>
                      {selected.status === 'planned' && (
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => {
                            const startDate = new Date().toISOString().slice(0, 10);
                            const newId = `PRO-${7000 + nextProductionOrderSeq}`;
                            nextProductionOrderSeq += 1;
                            appActions.releasePlannedOrder(selected.id, newId, startDate);
                          }}
                        >
                          Release to production
                        </Button>
                      )}
                      {linkedProductionOrder?.status === 'released' && (
                        <Button type="button" variant="primary" onClick={() => appActions.startProductionOrder(linkedProductionOrder.id)}>
                          Start
                        </Button>
                      )}
                      {linkedProductionOrder?.status === 'in_progress' && (
                        <Button type="button" variant="primary" onClick={() => appActions.completeProductionOrder(linkedProductionOrder.id)}>
                          Complete — update stock
                        </Button>
                      )}
                    </div>
                  </Density>
                </div>
              </Card>
            )}
          </>
        )}

        <Text variant="title">Schedule</Text>
        {schedule.length === 0 ? (
          <Card role="status">
            <Text variant="body">No production orders released yet.</Text>
          </Card>
        ) : (
          <div
            role="region"
            aria-label="Production schedule table"
            tabIndex={0}
            style={{ border: `1px solid ${color.border}`, borderRadius: 10, background: color.bgSurface, overflowX: 'auto' }}
          >
            <div style={{ minWidth: 640 }}>
              <Density value="compact">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Production order #</TableHeaderCell>
                      <TableHeaderCell>Material</TableHeaderCell>
                      <TableHeaderCell>Start date</TableHeaderCell>
                      <TableHeaderCell>Due date</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schedule.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{state.products[order.productId]?.description}</TableCell>
                        <TableCell>{order.startDate}</TableCell>
                        <TableCell>{order.dueDate}</TableCell>
                        <TableCell>
                          <Chip variant="status" tone={PROD_STATUS_TONE[order.status]}>
                            {PROD_STATUS_LABEL[order.status]}
                          </Chip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Density>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
