import * as stylex from '@stylexjs/stylex';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { color, font, radius, space } from '../tokens.stylex.js';

const styles = stylex.create({
  filterBase: {
    fontFamily: font.family,
    fontSize: font.sizeCaption,
    borderRadius: radius.pill,
    height: '32px',
    paddingInline: space.space4,
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: color.borderStrong,
    backgroundColor: {
      default: 'transparent',
      ':hover': color.bgSubtle,
    },
    color: color.textPrimary,
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.space2,
    whiteSpace: 'nowrap',
    lineHeight: '1',
    cursor: 'pointer',
    opacity: {
      default: 1,
      ':disabled': 0.4,
    },
    outlineStyle: 'solid',
    outlineOffset: '2px',
    outlineColor: {
      default: 'transparent',
      ':focus-visible': color.focusRing,
    },
    outlineWidth: {
      default: 0,
      ':focus-visible': '2px',
    },
  },
  filterSelected: {
    backgroundColor: color.action,
    borderColor: color.action,
    color: color.textOnInk,
    fontWeight: font.weightMedium,
  },
  statusBase: {
    fontFamily: font.family,
    fontSize: font.sizeCaption,
    borderRadius: radius.pill,
    height: '24px',
    paddingInline: space.space3,
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: font.weightMedium,
  },
  toneNeutral: {
    backgroundColor: color.bgSubtle,
    color: color.textSecondary,
  },
  toneStrong: {
    backgroundColor: color.border,
    color: color.textPrimary,
  },
  toneAccent: {
    backgroundColor: color.accent,
    color: color.textOnInk,
    fontWeight: font.weightSemibold,
  },
  toneDanger: {
    backgroundColor: color.bgSurface,
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: color.danger,
    color: color.danger,
  },
});

export type ChipTone = 'neutral' | 'strong' | 'accent' | 'danger';

const toneStyles: Record<ChipTone, stylex.StyleXStyles> = {
  neutral: styles.toneNeutral,
  strong: styles.toneStrong,
  accent: styles.toneAccent,
  danger: styles.toneDanger,
};

export type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'filter';
  selected?: boolean;
  onRemove?: () => void;
};

export type StatusChipProps = {
  variant: 'status';
  tone?: ChipTone;
  children: ReactNode;
};

export type ChipProps = FilterChipProps | StatusChipProps;

export function Chip(props: ChipProps) {
  if (props.variant === 'status') {
    const { tone = 'neutral', children } = props;
    return <span {...stylex.props(styles.statusBase, toneStyles[tone])}>{children}</span>;
  }
  const { selected, onRemove, children, ...rest } = props;
  return (
    <button
      type="button"
      aria-pressed={selected}
      {...rest}
      {...stylex.props(styles.filterBase, selected && styles.filterSelected)}
    >
      {selected && <span aria-hidden="true">✓ </span>}
      {children}
      {selected && onRemove && <span aria-hidden="true">×</span>}
    </button>
  );
}
