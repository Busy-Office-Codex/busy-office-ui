import * as stylex from '@stylexjs/stylex';
import { useId, type InputHTMLAttributes } from 'react';
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
  // `size="search"` (ROADMAP item 16 — docs/Input.md) is a fixed, reference-matched style for
  // a search-bar-shaped field (Shell's command palette, ListReport's PO search) — not a
  // density-tier override. Its height (2.25rem, 36px @ 16px root) is independently chosen to
  // match the ERP skeleton reference's own measured search-bar height, and happens to equal
  // `density.controlHeight`'s comfortable default (a real coincidence: this system's ordinary
  // "comfortable button height" and its reference's "search bar height" are the same number) —
  // it does not read `density.rowHeight` at all, by design, so it stays fixed regardless of
  // ambient density (unlike Button/Table's old `compact` overrides, which this milestone
  // removed in favor of the ambient `Density` region — this one is intentionally NOT a density
  // override and was never migrated to one, since neither real call site ever wanted the
  // rowHeight-family compact tier).
  fieldSearch: {
    minHeight: '2.25rem', // 36px @ 16px root
    fontSize: font.sizeControl, // 13px
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

export type InputSize = 'default' | 'search';

// Omits the native `size` attribute (visible width in characters) to reuse the name for our own
// default/search sizing, consistent with Button's `size` prop.
export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  error?: string;
  size?: InputSize;
};

export function Input({
  label,
  error,
  id,
  disabled,
  size = 'default',
  className,
  'aria-invalid': ariaInvalidProp,
  'aria-describedby': ariaDescribedByProp,
  ...rest
}: InputProps) {
  // Stable per-instance id, independent of any caller-supplied `id` — used to generate the
  // error message's id so it never collides across instances, even when two `Input`s are given
  // the same (or no) explicit `id` (ROADMAP item 50, issue #22). `React.useId()` (React 18+)
  // is safe across SSR/hydration, unlike a module-level counter.
  const baseId = useId();
  const inputId = id ?? baseId;
  const errorId = `${baseId}-error`;
  // Force `aria-invalid="true"` while `error` is set (screen readers must learn the field is
  // invalid); otherwise defer to whatever the caller passed natively.
  const ariaInvalid = error ? true : ariaInvalidProp;
  // Compose the caller's own `aria-describedby` (a separate description) with the error
  // message's id, rather than letting either clobber the other — the standard ARIA pattern is
  // a space-separated id list.
  const ariaDescribedBy =
    [ariaDescribedByProp, error ? errorId : undefined].filter(Boolean).join(' ') || undefined;
  const fieldStyles = stylex.props(
    styles.field,
    Boolean(error) && styles.fieldError,
    disabled && styles.fieldDisabled,
    size === 'search' && styles.fieldSearch,
  );
  // stylex's generated className must not silently win over a caller-supplied `className` (or
  // vice versa) — compose both so a caller's own class always survives.
  const mergedClassName = [fieldStyles.className, className].filter(Boolean).join(' ') || undefined;
  const field = (
    <input
      id={inputId}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      {...rest}
      {...fieldStyles}
      className={mergedClassName}
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
      {error && (
        <span id={errorId} {...stylex.props(styles.errorText)}>
          {error}
        </span>
      )}
    </label>
  );
}
