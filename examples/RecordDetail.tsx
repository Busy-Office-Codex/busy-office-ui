import { useState } from 'react';
import { Button, Card, Chip, Input, Modal, Text } from '../src/index.js';

/**
 * A sales order detail view: header, status, summary cards, and an
 * approve/reject action row. Mirrors the "record-detail" Claude Design
 * template — the reject confirmation is wired to real open/close state
 * here, since the static canvas version could only show it permanently open.
 */
export function RecordDetail() {
  const [rejecting, setRejecting] = useState(false);
  const [comment, setComment] = useState('');

  return (
    <div
      style={{
        background: '#f8fafc',
        minHeight: '100vh',
        padding: 40,
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text variant="heading">SO-1042 · Northwind Traders</Text>
            <Chip variant="status" tone="accent">
              Awaiting approval
            </Chip>
          </div>
          <Text variant="caption">Created 3 days ago by J. Rivera</Text>
        </div>

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

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="compact">Cancel</Button>
          <Button variant="secondary" size="compact">Request changes</Button>
          <Button variant="primary" size="compact">Approve</Button>
          <Button variant="danger" size="compact" onClick={() => setRejecting(true)}>
            Reject
          </Button>
        </div>
      </div>

      <Modal
        open={rejecting}
        onClose={() => setRejecting(false)}
        title="Reject SO-1042?"
        actions={
          <>
            <Button variant="ghost" size="compact" onClick={() => setRejecting(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="compact" onClick={() => setRejecting(false)}>
              Reject
            </Button>
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
