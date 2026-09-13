import * as stylex from '@stylexjs/stylex';
import type { InputHTMLAttributes } from 'react';
import { color, font, radius, space } from '../tokens.stylex.js';
import { Text } from './Text.js';

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.space2,
  },
  field: {
    fontFamily: font.family,
    fontSize: font.sizeBody,
    color: color.textPrimary,
    backgroundColor: color.bgSurface,
    height: '44px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderRadius: radius.sm,
    paddingInline: space.space4,
    outlineStyle: 'solid',
    outlineOffset: '0px',
    outlineColor: {
      default: 'transparent',
      ':focus-visible': color.focusRing,
    },
    outlineWidth: {
      default: 0,
      ':focus-visible': '2px',
    },
    borderColor: {
      default: color.borderStrong,
      ':hover': color.textTertiary,
      ':focus-visible': color.accent,
    },
    opacity: {
      default: 1,
      ':disabled': 0.5,
    },
    cursor: {
      default: 'text',
      ':disabled': 'not-allowed',
    },
  },
  fieldError: {
    borderColor: {
      default: color.danger,
      ':hover': color.danger,
      ':focus-visible': color.danger,
    },
  },
  fieldDisabled: {
    backgroundColor: color.bgCanvas,
    borderColor: color.border,
  },
  errorText: {
    fontFamily: font.family,
    fontSize: font.sizeCaption,
    lineHeight: font.lineHeightCaption,
    color: color.danger,
    margin: 0,
  },
});

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, id, disabled, ...rest }: InputProps) {
  const field = (
    <input
      id={id}
      disabled={disabled}
      {...rest}
      {...stylex.props(
        styles.field,
        Boolean(error) && styles.fieldError,
        disabled && styles.fieldDisabled,
      )}
    />
  );
  return (
    <label {...stylex.props(styles.wrapper)}>
      {label && (
        <Text variant="caption" as="span">
          {label}
        </Text>
      )}
      {field}
      {error && <span {...stylex.props(styles.errorText)}>{error}</span>}
    </label>
  );
}
