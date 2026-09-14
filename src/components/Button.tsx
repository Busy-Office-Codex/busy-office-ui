import * as stylex from '@stylexjs/stylex';
import type { ButtonHTMLAttributes } from 'react';
import { color, density, font, motion, radius, space } from '../tokens.stylex.js';

const styles = stylex.create({
  base: {
    fontFamily: font.family,
    // Ambient (ROADMAP item 10): reads the density alias group, not a fixed size — a
    // `Density`-wrapped ancestor changes this without Button knowing about it.
    fontSize: density.fontSize,
    fontWeight: font.weightMedium,
    borderRadius: radius.pill,
    // `min-height`, not `height` — lets the box grow to fit content instead of clipping it
    // (e.g. at a larger root font size); see docs/design-conventions.md.
    minHeight: density.controlHeight,
    paddingInline: space.space5,
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.space2,
    lineHeight: '1',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'transparent',
    cursor: {
      default: 'pointer',
      ':disabled': 'not-allowed',
    },
    opacity: {
      default: 1,
      ':disabled': 0.4,
    },
    transitionProperty: 'background-color, border-color, color',
    transitionDuration: motion.durationBase,
    transitionTimingFunction: motion.easeStandard,
    outlineOffset: '2px',
    outlineColor: {
      default: 'transparent',
      ':focus-visible': color.focusRing,
    },
    outlineStyle: 'solid',
    outlineWidth: {
      default: 0,
      ':focus-visible': '2px',
    },
  },
  primary: {
    backgroundColor: {
      default: color.action,
      ':hover': color.actionHover,
      ':active': color.actionActive,
    },
    color: color.textOnInk,
  },
  secondary: {
    backgroundColor: {
      default: color.bgSubtle,
      ':hover': color.border,
      ':active': color.borderStrong,
    },
    color: color.textPrimary,
  },
  ghost: {
    backgroundColor: {
      default: 'transparent',
      ':hover': color.bgSubtle,
      ':active': color.border,
    },
    color: color.textPrimary,
  },
  danger: {
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(180, 35, 24, 0.08)',
      ':active': color.danger,
    },
    borderColor: color.danger,
    color: {
      default: color.danger,
      ':active': color.textOnInk,
    },
  },
});

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = 'primary', ...rest }: ButtonProps) {
  return <button {...rest} {...stylex.props(styles.base, styles[variant])} />;
}
