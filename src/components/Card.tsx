import * as stylex from '@stylexjs/stylex';
import type { HTMLAttributes } from 'react';
import { color, font, radius, shadow, space } from '../tokens.stylex.js';

const styles = stylex.create({
  base: {
    position: 'relative',
    borderRadius: radius.md,
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: color.border,
    backgroundColor: color.bgSurface,
    padding: space.space4,
    boxShadow: shadow.xs,
    display: 'flex',
    flexDirection: 'column',
    gap: space.space2,
  },
  interactive: {
    cursor: 'pointer',
    transitionProperty: 'box-shadow, border-color',
    transitionDuration: '150ms',
    borderColor: {
      default: color.border,
      ':hover': color.borderStrong,
    },
    boxShadow: {
      default: shadow.xs,
      ':hover': shadow.md,
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
  selected: {
    borderColor: color.accent,
    boxShadow: `0 0 0 1px ${color.accent}`,
  },
  disabled: {
    backgroundColor: color.bgCanvas,
    opacity: 0.55,
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  // Selection also needs a non-colour cue: a checkmark glyph, not just the
  // accent-coloured border, so it still reads for a viewer who can't
  // distinguish the border hue from the unselected one.
  selectedBadge: {
    position: 'absolute',
    top: space.space2,
    right: space.space2,
    fontFamily: font.family,
    fontSize: font.sizeCaption,
    fontWeight: font.weightSemibold,
    lineHeight: 1,
    color: color.accent,
  },
});

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  selected?: boolean;
  disabled?: boolean;
};

export function Card({ selected, disabled, onClick, onKeyDown, children, ...rest }: CardProps) {
  const interactive = Boolean(onClick) && !disabled;
  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-pressed={interactive && selected !== undefined ? selected : undefined}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (interactive && !event.defaultPrevented && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
      {...rest}
      {...stylex.props(
        styles.base,
        interactive && styles.interactive,
        selected && styles.selected,
        disabled && styles.disabled,
      )}
    >
      {children}
      {selected && (
        <span aria-hidden="true" {...stylex.props(styles.selectedBadge)}>
          ✓
        </span>
      )}
    </div>
  );
}
