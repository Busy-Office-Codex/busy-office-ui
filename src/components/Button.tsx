import * as stylex from '@stylexjs/stylex';
import type { ButtonHTMLAttributes } from 'react';
import { color, font, radius, space } from '../tokens.stylex.js';

const styles = stylex.create({
  base: {
    fontFamily: font.family,
    fontSize: font.sizeBody,
    fontWeight: font.weightMedium,
    borderRadius: radius.pill,
    height: '40px',
    paddingInline: space.space5,
    whiteSpace: 'nowrap',
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
    transitionDuration: '150ms',
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
  compact: {
    height: '32px',
    paddingInline: space.space4,
    fontSize: font.sizeCaption,
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
export type ButtonSize = 'default' | 'compact';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant = 'primary', size = 'default', ...rest }: ButtonProps) {
  return <button {...rest} {...stylex.props(styles.base, styles[variant], size === 'compact' && styles.compact)} />;
}
