import * as stylex from '@stylexjs/stylex';
import type { InputHTMLAttributes } from 'react';
import { color, density, font, radius, space } from '../tokens.stylex.js';
import { Text } from './Text.js';

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.space2,
  },
  field: {
    fontFamily: font.family,
    // Ambient (ROADMAP item 10) — see Button's `base.fontSize` for the same pattern.
    fontSize: density.fontSize,
    color: color.textPrimary,
    backgroundColor: color.bgSurface,
    // Reads `rowHeight`, not `controlHeight`: a text field is a content "row", not a
    // pill-shaped control (see tokens.stylex.ts's `density` doc comment) — comfortable
    // default is now 40px (was a fixed 44px). `min-height`, not `height` (see Button).
    minHeight: density.rowHeight,
    // ROADMAP item 14 (2026-09-14 design review, confirmed MEDIUM finding): `<input>` (unlike
    // `<button>`, which Chrome's own UA stylesheet already renders `border-box`) defaults to
    // `content-box`, under which the 1px border below AND the UA default ~1px top/bottom padding
    // (this field only sets `paddingInline`, leaving block padding at the browser default) both
    // add on top of the declared `min-height` instead of being absorbed into it — verified live:
    // a declared 36px (compact) rendered `offsetHeight` 40px, and a declared 40px (default)
    // rendered 44px, a consistent +4px in both cases. `border-box` folds both back in, so the
    // rendered height matches the declared one — same fix pattern as `statusBase`'s danger-tone
    // border in `Chip.tsx` (ROADMAP item 12) and the row-selection checkboxes' border (item 12).
    boxSizing: 'border-box',
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
    '::placeholder': {
      color: color.textTertiary,
    },
  },
  // `size="compact"` (deprecated, ROADMAP item 10 — docs/Input.md) is a per-instance
  // override, same contract as Button's `compact` (see there): it must force compact
  // regardless of ambient density, so it hardcodes a literal rather than reading
  // `density.rowHeight`. Its height stays the exact number it was before this task (36px,
  // independently chosen to match the ERP skeleton reference's own measured search-bar
  // height — docs/Input.md) rather than adopting the rowHeight compact tier's 32px, so this
  // specific, already-deliberate match to the reference isn't disturbed by an unrelated tier
  // renumbering.
  fieldCompact: {
    minHeight: '2.25rem', // 36px @ 16px root — unchanged by this task
    fontSize: font.sizeControl, // 13px — was font.sizeCaption (12.5px)
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

export type InputSize = 'default' | 'compact';

// Omits the native `size` attribute (visible width in characters) to reuse the name for our own
// compact/default sizing, consistent with Button's `size` prop.
export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  error?: string;
  size?: InputSize;
};

export function Input({ label, error, id, disabled, size = 'default', ...rest }: InputProps) {
  const field = (
    <input
      id={id}
      disabled={disabled}
      {...rest}
      {...stylex.props(
        styles.field,
        Boolean(error) && styles.fieldError,
        disabled && styles.fieldDisabled,
        size === 'compact' && styles.fieldCompact,
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
