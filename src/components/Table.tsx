import * as stylex from '@stylexjs/stylex';
import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { color, compactDensity, density, font } from '../tokens.stylex.js';

const styles = stylex.create({
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: font.family,
    backgroundColor: color.bgSurface,
  },
  head: {
    // ROADMAP item 12 (2026-09-14 design review, confirmed HIGH finding): was `color.bgSubtle`
    // (#f1f5f9), which — paired with the header text's old `color.textTertiary` — measured
    // 4.34:1, failing WCAG AA's 4.5:1 body-text threshold (11px/600/uppercase does not qualify
    // for the "large text" 3:1 exemption). `bgCanvas` (#f8fafc) matches the reference
    // (`templates/erp-skeleton/Table.dc.html`) exactly and, paired with the new `textSecondary`
    // header color below, measures ~7.24:1 — see docs/Table.md and the header-contrast browser
    // spec for the computed rgb() values.
    backgroundColor: color.bgCanvas,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderBottomColor: color.border,
  },
  row: {
    // Ambient (ROADMAP item 10). Deliberately `height`, not `min-height`, unlike Button/Input:
    // `min-height`/`max-height` are not part of the CSS table row-sizing algorithm and browsers
    // ignore them on `<tr>` — only `height` gets the spec's special table-row treatment, where it
    // already behaves as a minimum (a row grows to fit taller content rather than clipping it).
    // Verified directly: min-height here rendered a fixed ~40px regardless of root font size,
    // silently not scaling; height correctly grows the row and never clips.
    height: density.rowHeight,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    // ROADMAP item 12 (2026-09-14 design review, confirmed MEDIUM finding): was `color.border`
    // (#e2e8f0) — the exact same value as the table's own outer frame border, so body rows had
    // no visual distinction from the frame. `borderSubtle` (#f1f5f9) is deliberately lighter,
    // matching the reference (`Table.dc.html`: frame #e2e8f0, row separators #f1f5f9).
    borderBottomColor: color.borderSubtle,
  },
  headerCell: {
    textAlign: 'start',
    // Padding is ambient on both header and body cells, so columns stay aligned across the
    // header/body boundary at every tier — font size is not (see below).
    paddingBlock: density.cellPaddingY,
    paddingInline: density.cellPaddingX,
    // ROADMAP item 12 (2026-09-14 design review): NOT density.fontSize — a header cell still
    // always renders at a fixed compact treatment regardless of density (only its padding
    // follows the tier), but that treatment moved off `font.sizeOverline` (11px) specifically to
    // fix the contrast failure below: `sizeCaption` (12.5px) is this package's closest existing
    // token to the reference's 12px header text (docs/Table.md and docs/design-conventions.md
    // updated to describe this corrected size).
    fontSize: font.sizeCaption,
    fontWeight: font.weightSemibold,
    // Was `font.letterSpacingOverline` (.06em) — no token exists for the reference's exact
    // `.04em`, so it's a literal here, same category as other hand-measured literals already in
    // this codebase (e.g. the badge's `1px 6px` padding from ROADMAP item 13).
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    // Was `color.textTertiary` (#64748b) — the confirmed HIGH contrast finding. `textSecondary`
    // (#475569) exactly matches the reference and, on the new `bgCanvas` head background above,
    // measures ~7.24:1 — comfortably over WCAG AA's 4.5:1 body-text threshold.
    color: color.textSecondary,
  },
  cell: {
    paddingBlock: density.cellPaddingY,
    paddingInline: density.cellPaddingX,
    // Ambient — previously this had no explicit fontSize and relied on inheriting the
    // `<table>` element's own font-size (default `font.sizeBody`, or `font.sizeCaption` via
    // the old `tableCompact` class). Now set directly, so the compact override below (which
    // works by re-theming `density` on `<table>`, not by setting a font-size on `<table>`
    // itself) still reaches it via the ordinary CSS custom-property cascade.
    fontSize: density.fontSize,
    color: color.textPrimary,
  },
  alignEnd: {
    textAlign: 'end',
  },
});

export type TableDensity = 'default' | 'compact';

export type TableProps = HTMLAttributes<HTMLTableElement> & { children: ReactNode; density?: TableDensity };

export function Table({ children, density: densityProp = 'default', ...rest }: TableProps) {
  return (
    <table
      {...rest}
      // `density="compact"` (deprecated, ROADMAP item 10 — docs/Table.md) is a per-instance
      // override with the same "must force compact regardless of ambient density" contract as
      // Button/Input's `size="compact"`, but implemented differently: rather than duplicating
      // literal compact numbers in `headerCell`/`cell`/`row` above, it applies the same
      // `compactDensity` theme the `Density` component itself uses, directly to the `<table>`
      // element. Header/body cells and rows read the `density` aliases ambiently either way, so
      // this reaches them through the ordinary CSS custom-property cascade — one mechanism,
      // not two. (A nested Button/Chip/etc. inside a compact table's cell would also pick up
      // compact ambient sizing this way, same as nesting a real `Density` region would; that's
      // an intentional consequence of reusing the mechanism, not a special case for Table.)
      {...stylex.props(styles.table, densityProp === 'compact' && compactDensity)}
    >
      {children}
    </table>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead {...stylex.props(styles.head)}>{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr {...rest} {...stylex.props(styles.row)}>
      {children}
    </tr>
  );
}

export type TableHeaderCellProps = Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'> & {
  children?: ReactNode;
  align?: 'start' | 'end';
};

export function TableHeaderCell({ children, align, ...rest }: TableHeaderCellProps) {
  return (
    <th {...rest} {...stylex.props(styles.headerCell, align === 'end' && styles.alignEnd)}>
      {children}
    </th>
  );
}

export type TableCellProps = Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> & {
  children?: ReactNode;
  align?: 'start' | 'end';
};

export function TableCell({ children, align, ...rest }: TableCellProps) {
  return (
    <td {...rest} {...stylex.props(styles.cell, align === 'end' && styles.alignEnd)}>
      {children}
    </td>
  );
}
