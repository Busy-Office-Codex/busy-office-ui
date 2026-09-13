import * as stylex from '@stylexjs/stylex';
import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { color, font, space } from '../tokens.stylex.js';

const styles = stylex.create({
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: font.family,
    fontSize: font.sizeBody,
    backgroundColor: color.bgSurface,
  },
  head: {
    backgroundColor: color.bgSubtle,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderBottomColor: color.border,
  },
  row: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderBottomColor: color.border,
  },
  headerCell: {
    textAlign: 'start',
    paddingBlock: space.space3,
    paddingInline: space.space4,
    fontSize: font.sizeOverline,
    fontWeight: font.weightSemibold,
    letterSpacing: font.letterSpacingOverline,
    textTransform: 'uppercase',
    color: color.textTertiary,
  },
  cell: {
    paddingBlock: space.space3,
    paddingInline: space.space4,
    color: color.textPrimary,
  },
  alignEnd: {
    textAlign: 'end',
  },
});

export type TableProps = HTMLAttributes<HTMLTableElement> & { children: ReactNode };

export function Table({ children, ...rest }: TableProps) {
  return (
    <table {...rest} {...stylex.props(styles.table)}>
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

export function TableRow({ children }: { children: ReactNode }) {
  return <tr {...stylex.props(styles.row)}>{children}</tr>;
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
