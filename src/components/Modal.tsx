import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { color, font, glass, radius, shadow, space } from '../tokens.stylex.js';
import { Text } from './Text.js';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isFocusable(element: HTMLElement): boolean {
  if (!element.isConnected || element.matches(':disabled, [hidden], [inert], [aria-hidden="true"]')) return false;
  if (element.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
  const style = window.getComputedStyle(element);
  return style.visibility !== 'hidden' && style.display !== 'none' && element.getClientRects().length > 0;
}

function focusableWithin(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isFocusable);
}

// Applied only while `open`: an author-origin `display` always beats the UA
// stylesheet's `dialog:not([open]) { display: none }`, so an unconditional
// class here would keep this full-viewport overlay intercepting clicks even
// while closed.
const styles = stylex.create({
  dialog: {
    position: 'fixed',
    inset: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    maxWidth: 'none',
    maxHeight: 'none',
    border: 'none',
    padding: 0,
    color: 'inherit',
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    width: '400px',
    maxWidth: '90vw',
    borderRadius: radius.lg,
    padding: space.space6,
    backgroundColor: glass.bgStrong,
    backdropFilter: `blur(${glass.blurStrong})`,
    border: glass.border,
    boxShadow: `${shadow.lg}, ${glass.highlight}`,
    display: 'flex',
    flexDirection: 'column',
    gap: space.space3,
    fontFamily: font.family,
    fontSize: font.sizeBody,
    lineHeight: font.lineHeightBody,
    color: color.textPrimary,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: space.space2,
  },
});

export type ModalProps = {
  open: boolean;
  onClose?: () => void;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
};

export function Modal({ open, onClose, title, children, actions }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (event: Event) => {
      // Stay a controlled component: never let the browser's own Escape
      // action close the dialog out from under the `open` prop.
      event.preventDefault();
      onClose?.();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  // A modal <dialog> makes the rest of the page inert (Accept: absent from
  // the accessibility tree), but Chromium does not reliably wrap Tab within
  // the remaining focusable set on its own — verified by browser test, not
  // assumed — so the loop is still handled here.
  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = focusableWithin(panel);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      {...stylex.props(open && styles.dialog)}
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div ref={panelRef} {...stylex.props(styles.panel)} onClick={(event) => event.stopPropagation()}>
        <Text variant="title" as="h2">
          {title}
        </Text>
        {children}
        {actions && <div {...stylex.props(styles.actions)}>{actions}</div>}
      </div>
    </dialog>
  );
}
