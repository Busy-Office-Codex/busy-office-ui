import * as stylex from '@stylexjs/stylex';
import type { ElementType, ReactNode } from 'react';
import { color, font } from '../tokens.stylex.js';

const styles = stylex.create({
  base: {
    fontFamily: font.family,
    color: color.textPrimary,
    margin: 0,
  },
  display: {
    fontSize: font.sizeDisplay,
    fontWeight: font.weightSemibold,
    lineHeight: font.lineHeightDisplay,
    letterSpacing: font.letterSpacingDisplay,
  },
  heading: {
    fontSize: font.sizeHeading,
    fontWeight: font.weightSemibold,
    lineHeight: font.lineHeightHeading,
    letterSpacing: font.letterSpacingHeading,
  },
  title: {
    fontSize: font.sizeTitle,
    fontWeight: font.weightMedium,
    lineHeight: font.lineHeightTitle,
  },
  body: {
    fontSize: font.sizeBody,
    fontWeight: font.weightRegular,
    lineHeight: font.lineHeightBody,
  },
  caption: {
    fontSize: font.sizeCaption,
    fontWeight: font.weightRegular,
    lineHeight: font.lineHeightCaption,
    color: color.textSecondary,
  },
  overline: {
    fontSize: font.sizeOverline,
    fontWeight: font.weightSemibold,
    lineHeight: font.lineHeightCaption,
    letterSpacing: font.letterSpacingOverline,
    textTransform: 'uppercase',
    color: color.textTertiary,
  },
});

const defaultElement: Record<keyof typeof styles, ElementType> = {
  base: 'span',
  display: 'h1',
  heading: 'h2',
  title: 'h3',
  body: 'p',
  caption: 'span',
  overline: 'span',
};

export type TextVariant = 'display' | 'heading' | 'title' | 'body' | 'caption' | 'overline';

export type TextProps = {
  variant?: TextVariant;
  as?: ElementType;
  children: ReactNode;
  style?: stylex.StyleXStyles;
};

export function Text({ variant = 'body', as, children, style }: TextProps) {
  const Component = as ?? defaultElement[variant];
  return (
    <Component {...stylex.props(styles.base, styles[variant], style)}>
      {children}
    </Component>
  );
}
