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
    // Was `color.textTertiary` (M10 Text scoring, issue #24): against this variant's own real
    // consumers today (all on `bgCanvas`/`bgSurface`) it happens to clear 4.5:1, but only barely
    // (4.55:1 on `bgCanvas` — a hair above the floor, at exactly this size/weight/case, which
    // doesn't qualify for WCAG's "large text" 3:1 exemption) and it fails outright against
    // `bgSubtle` (4.34:1 — the identical confirmed HIGH finding `Table.tsx`'s own header comment
    // already documents for this exact token at this exact size/weight/case). `textSecondary`
    // clears 4.5:1 against every real background in this palette by a wide margin in both themes
    // (`test/color-contrast.test.ts`) — the same fix `Table.tsx`'s header already made.
    color: color.textSecondary,
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
