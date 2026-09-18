import * as stylex from '@stylexjs/stylex';
import { color } from '../tokens.stylex.js';

export type AvatarProps = {
  /**
   * Pixel width/height. Defaults to 32 — the size 2 of the 3 real consumers this component
   * replaces already used (`AppShell.tsx`'s command-bar account slot, `RolePage.tsx`'s team-list
   * row); `Profile.tsx`'s own header avatar passes 64.
   */
  size?: number;
};

const styles = stylex.create({
  avatar: {
    borderRadius: 999,
    backgroundColor: color.border,
    flexShrink: 0,
  },
});

/**
 * A decorative circular placeholder for a person/account with no photo — the real,
 * byte-identical `{ width, height, borderRadius: 999, background: color.border, flexShrink: 0 }`
 * div duplicated across 3 real consumers before this component existed (M10 ERP-gap
 * investigation, issue #24), 2 of which already self-documented the duplication in their own
 * comments ("same pattern as ..."). Always `aria-hidden` and non-interactive: it renders no image
 * and carries no identity data, so there is nothing for assistive tech to announce.
 */
export function Avatar({ size = 32 }: AvatarProps) {
  return <div aria-hidden="true" {...stylex.props(styles.avatar)} style={{ width: size, height: size }} />;
}
