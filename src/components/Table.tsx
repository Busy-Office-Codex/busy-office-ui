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
    backgroundColor: color.bgSubtle,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderBottomColor: color.border,
  },
  row: {
    // Ambient (ROADMAP item 10) — `min-height`, not `height` (see Button/Input for why).
    minHeight: density.rowHeight,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderBottomColor: color.border,
  },
  headerCell: {
    textAlign: 'start',
    // Padding is ambient on both header and body cells, so columns stay aligned across the
    // header/body boundary at every tier — font size is not (see below).
    paddingBlock: density.cellPaddingY,
    paddingInline: density.cellPaddingX,
    // NOT density.fontSize: a header cell always renders at the compact `overline` treatment
    // regardless of density (docs/Table.md) — that was true before this task and stays true.
    fontSize: font.sizeOverline,
    fontWeight: font.weightSemibold,
    letterSpacing: font.letterSpacingOverline,
    textTransform: 'uppercase',
    color: color.textTertiary,
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
