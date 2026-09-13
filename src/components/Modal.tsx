import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { glass, radius, shadow, space } from '../tokens.stylex.js';
import { Text } from './Text.js';

const styles = stylex.create({
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
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

export function Modal({ open, onClose, title, children, actions }: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    // Safari/Firefox leave document.body active after a button click, so body is never a real opener.
    const activeElement = document.activeElement;
    openerRef.current = activeElement instanceof HTMLElement && activeElement !== document.body ? activeElement : null;

    const panel = panelRef.current;
    if (panel) {
      const first = focusableWithin(panel)[0];
      first?.focus();
      if (document.activeElement !== first) panel.focus();
    }

    return () => {
      const opener = openerRef.current;
      openerRef.current = null;
      if (opener && isFocusable(opener)) opener.focus();
    };
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      if (!onClose) return;
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = focusableWithin(panel);
    if (focusable.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }
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
    <div {...stylex.props(styles.overlay)} onClick={onClose}>
      <div
        {...stylex.props(styles.panel)}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <Text variant="title" as="h2">
          {title}
        </Text>
        {children}
        {actions && <div {...stylex.props(styles.actions)}>{actions}</div>}
      </div>
    </div>
  );
}
