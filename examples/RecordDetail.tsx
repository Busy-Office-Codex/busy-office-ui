import { useState } from 'react';
import { Button, Card, Chip, Density, Input, Modal, Text } from '../src/index.js';
import { BreadcrumbTrail } from './breadcrumbTrail.js';

/**
 * `'ready'` (default) shows the header, the three summary cards and the
 * approve/reject action row. `'empty'` keeps the header and action row but
 * replaces the three cards with a placeholder — a draft that exists but has
 * no summary/line-item data yet. `'loading'` / `'error'` / `'forbidden'`
 * replace everything below the header (cards and actions both — there is
 * nothing to act on yet, on a failed record, or on one you can't see) with a
 * single state-specific message.
 */
export type RecordDetailState = 'ready' | 'loading' | 'empty' | 'error' | 'forbidden';

/**
 * A sales order detail view: header, status, summary cards, and an
 * approve/reject action row. Mirrors the "record-detail" Claude Design
 * template — the reject confirmation is wired to real open/close state
 * here, since the static canvas version could only show it permanently open.
 */
export function RecordDetail({ state = 'ready' }: { state?: RecordDetailState }) {
  const [rejecting, setRejecting] = useState(false);
  const [comment, setComment] = useState('');

  return (
    <div
      style={{
        background: '#f8fafc',
        // ROADMAP item 14 (2026-09-14 design review, confirmed MEDIUM finding): matches
        // ListReport.tsx/Dashboard.tsx's 24px content padding (the reference's own value) instead
        // of this page's old 40px — one shared content frame across all three sample pages.
        // `box-sizing: 'border-box'` is new too: without it this padding was added on top of
        // `minHeight`/the page's natural height rather than absorbed into it (same content-box
        // pitfall already fixed for `Input`/checkboxes elsewhere in this milestone), inflating
        // this page's scrollHeight past the viewport. `minHeight: '100vh'` is removed outright —
        // Shell's own root already sets `minHeight: '100vh'` and its content-slot wrapper already
        // has `flex: 1` (stretches to fill), so this page setting the same 100vh minimum AGAIN,
        // nested inside that chrome, only pushed the total rendered height past the viewport.
        // This page's content is naturally shorter than a full viewport, and that's fine — its
        // background (`#f8fafc`) is the same literal as `color.bgCanvas`, the color Shell's own
        // root already paints, so there's no visible seam below the content either way.
        padding: 24,
        boxSizing: 'border-box',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* `margin: 0`, not `'0 auto'` — left-aligns instead of centering, matching every other
          sample page's left edge (see ListReport.tsx, which has no inner max-width wrapper at
          all). No page-level `maxWidth` cap — fills whatever width AppShell gives it (see
          docs/design-conventions.md's "Page width and responsive layout"). */}
      <div style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Issue #20 (agreed, project owner, 2026-09-16), ROADMAP item 37 — the trail back to
            SalesOrderList.tsx this page had no way to show before ("reached today ... with no
            visible trail back"). Every crumb here renders as plain, non-interactive text — no
            `onClick` on "Sales orders" either, deliberately: this page is one of `preview/
            client.tsx`'s route panes with no navigate callback of its own (see
            examples/Analytics.tsx's own header comment — the same route-agnostic-content-pane
            constraint applies here, and RecordDetail doesn't even have Analytics's own
            `focusRecordId` fallback to reach for, since it isn't backed by the shared store).
            Giving "Sales orders" a fake onClick that does nothing observable would be a lie, not
            a convenience — so the trail is honestly display-only; "SO-1042" is last, matching
            Shell's own breadcrumb contract for "here" (see `examples/breadcrumbTrail.tsx`). */}
        <BreadcrumbTrail items={[{ label: 'Sales orders' }, { label: 'SO-1042' }]} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text variant="heading">SO-1042 · Northwind Traders</Text>
            <Chip variant="status" tone="accent">
              Awaiting approval
            </Chip>
          </div>
          <Text variant="caption">Created 3 days ago by J. Rivera</Text>
        </div>

        {state === 'loading' && (
          <Card role="status">
            <Text variant="body">Loading order details…</Text>
          </Card>
        )}

        {state === 'error' && (
          <Card role="alert">
            <Text variant="body">This sales order couldn't be loaded. Try again.</Text>
            <Density value="compact">
              <Button variant="secondary">Retry</Button>
            </Density>
          </Card>
        )}

        {state === 'forbidden' && (
          <Card role="status">
            <Text variant="body">You don't have access to this sales order. Ask an admin for the Sales role.</Text>
          </Card>
        )}

        {(state === 'ready' || state === 'empty') && (
          <>
            {state === 'empty' ? (
              <Card role="status">
                <Text variant="body">This draft has no summary data yet. Add line items to see totals here.</Text>
              </Card>
            ) : (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <Card>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Text variant="caption" as="h3">Order total</Text>
                      <Text variant="heading">$24,300</Text>
                    </div>
                  </Card>
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <Card>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Text variant="caption" as="h3">Line items</Text>
                      <Text variant="heading">12</Text>
                    </div>
                  </Card>
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <Card>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Text variant="caption" as="h3">Requested by</Text>
                      <Text variant="heading">Sales — East region</Text>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            <Density value="compact">
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button variant="ghost">Cancel</Button>
                <Button variant="secondary">Request changes</Button>
                <Button variant="primary">Approve</Button>
                <Button variant="danger" onClick={() => setRejecting(true)}>
                  Reject
                </Button>
              </div>
            </Density>
          </>
        )}
      </div>

      <Modal
        open={rejecting}
        onClose={() => setRejecting(false)}
        title="Reject SO-1042?"
        actions={
          <>
            <Density value="compact">
              <Button variant="ghost" onClick={() => setRejecting(false)}>
                Cancel
              </Button>
            </Density>
            <Density value="compact">
              <Button variant="danger" onClick={() => setRejecting(false)}>
                Reject
              </Button>
            </Density>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Text variant="body">
            Rejecting this order will notify the requester and Finance. Your comment will be visible to both and
            saved to the record history.
          </Text>
          <Input
            label="Comment"
            placeholder="Required for a rejection"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
