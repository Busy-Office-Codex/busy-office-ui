import type { ReactNode } from 'react';
import { Button, Modal } from '../src/index.js';

// M7 Slice 15 — destructive actions across this reference app (Companies.tsx's Deactivate,
// Requisitions.tsx's Reject, Integrations.tsx's Disconnect, Billing.tsx's Cancel invoice) all
// mutated the shared store the instant a button was clicked, with no confirmation step. `Modal`
// (`@busyoffice/design-system`) already covers exactly this — its own doc example is literally a
// "Reject SO-1042?" confirm/cancel dialog — so this is a real gap in how these screens used an
// existing export, not a missing package feature. Extracted here once the identical
// title/body/Cancel/danger-action shape reached 4 real call sites, past this repo's Objective 3
// "two named consumers" bar; internal to `examples/`, not a new package export, same category as
// `examples/filterTabs.tsx`/`checkboxStyles.ts` — every consumer needs exactly this composition
// of `Modal` + `Button` and nothing more.
export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ open, title, children, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      actions={
        <>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
