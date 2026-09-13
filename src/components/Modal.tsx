import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
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

export function Modal({ open, onClose, title, children, actions }: ModalProps) {
  if (!open) return null;
  return (
    <div {...stylex.props(styles.overlay)} onClick={onClose}>
      <div {...stylex.props(styles.panel)} onClick={(event) => event.stopPropagation()}>
        <Text variant="title">{title}</Text>
        {children}
        {actions && <div {...stylex.props(styles.actions)}>{actions}</div>}
      </div>
    </div>
  );
}
