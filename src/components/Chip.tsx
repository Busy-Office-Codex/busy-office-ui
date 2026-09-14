import * as stylex from '@stylexjs/stylex';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { color, density, font, radius, space } from '../tokens.stylex.js';

const styles = stylex.create({
  // Fully density-driven (ROADMAP item 10), same as Dropdown's trigger: filter Chip has no
  // size prop to keep working, and it's part of the same "always a capsule" shape family as
  // Button/Dropdown's trigger (docs/design-conventions.md), so it shares `controlHeight`.
  filterBase: {
    fontFamily: font.family,
    fontSize: density.fontSize,
    borderRadius: radius.pill,
    minHeight: density.controlHeight,
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
  // Deliberately NOT density-driven (ROADMAP item 10 scoped this to the `filter` variant
  // only): a status Chip is a non-interactive tag, not a "control" in the reference-review
  // sense that motivated this tier system (docs/design-conventions.md's capsule-vs-rectangle
  // rule doesn't group it with Button/Dropdown/filter-Chip either) — its fixed 24px height and
  // `sizeCaption` text are display metadata, not a sizing concern this task's scope covers.
  statusBase: {
    fontFamily: font.family,
    fontSize: font.sizeCaption,
    borderRadius: radius.pill,
    height: '24px',
    // ROADMAP item 12 (2026-09-14 design review, confirmed MEDIUM finding): the browser default
    // is `content-box`, under which a border ADDS to the declared height instead of being
    // absorbed into it — `toneDanger` below is the only one of the four tones with a border
    // (1px, for its outlined look), so it alone rendered 26px instead of the uniform 24px every
    // other tone renders at, breaking row-height uniformity in any table with a danger-tone
    // status Chip (e.g. "Overdue" in examples/ListReport.tsx's sample data). `border-box` makes
    // that 1px absorbed into the declared 24px instead — a no-op for `toneNeutral`/`toneStrong`/
    // `toneAccent` below, none of which set a border or padding that would interact with it.
    boxSizing: 'border-box',
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
