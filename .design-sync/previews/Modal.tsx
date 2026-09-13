import { Button, Input, Modal, Text } from '@busyoffice/design-system';

// A transformed ancestor becomes the containing block for the Modal's fixed overlay,
// so the dialog centres inside this frame instead of the browser viewport.
const frame = { position: 'relative' as const, height: 400, transform: 'translateZ(0)', background: '#f8fafc', borderRadius: 12, overflow: 'hidden' };

export function ConfirmReject() {
  return (
    <div style={frame}>
      <Modal
        open
        onClose={() => {}}
        title="Reject SO-1042?"
        actions={
          <>
            <Button variant="ghost">Cancel</Button>
            <Button variant="danger">Reject</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Text variant="body">
            Rejecting this order will notify the requester and Finance. Your comment will be visible to both and saved
            to the record history.
          </Text>
          <Input label="Comment" placeholder="Required for a rejection" />
        </div>
      </Modal>
    </div>
  );
}
