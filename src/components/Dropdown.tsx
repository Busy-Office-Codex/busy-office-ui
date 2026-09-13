import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { color, font, glass, radius, shadow, space } from '../tokens.stylex.js';

const styles = stylex.create({
  wrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  trigger: {
    fontFamily: font.family,
    fontSize: font.sizeCaption,
    height: '32px',
    paddingInline: space.space4,
    borderRadius: radius.pill,
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: color.borderStrong,
    backgroundColor: 'transparent',
    color: color.textPrimary,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.space2,
  },
  triggerActive: {
    backgroundColor: color.action,
    borderColor: color.action,
    color: color.textOnInk,
    fontWeight: font.weightMedium,
  },
  menu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    minWidth: '220px',
    borderRadius: radius.md,
    padding: space.space2,
    backgroundColor: glass.bg,
    backdropFilter: `blur(${glass.blur})`,
    border: glass.border,
    boxShadow: `${shadow.md}, ${glass.highlight}`,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
  },
  item: {
    fontFamily: font.family,
    fontSize: font.sizeBody,
    paddingBlock: space.space2,
    paddingInline: space.space3,
    borderRadius: radius.sm,
    display: 'flex',
    justifyContent: 'space-between',
    cursor: 'pointer',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(15, 23, 42, 0.06)',
    },
  },
  itemSelected: {
    fontWeight: font.weightMedium,
  },
  check: {
    color: color.accent,
  },
});

export type DropdownItem = { label: string; selected?: boolean };

export type DropdownProps = {
  label: string;
  items: DropdownItem[];
  onSelect?: (label: string) => void;
  defaultOpen?: boolean;
};

export function Dropdown({ label, items, onSelect, defaultOpen = false }: DropdownProps) {
  const [open, setOpen] = useState(defaultOpen);
  const active = items.some((item) => item.selected);
  return (
    <div {...stylex.props(styles.wrapper)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        {...stylex.props(styles.trigger, active && styles.triggerActive)}
      >
        {label} ▾
      </button>
      {open && (
        <div {...stylex.props(styles.menu)}>
          {items.map((item) => (
            <div
              key={item.label}
              {...stylex.props(styles.item, item.selected && styles.itemSelected)}
              onClick={() => {
                onSelect?.(item.label);
                setOpen(false);
              }}
            >
              <span>{item.label}</span>
              {item.selected && <span {...stylex.props(styles.check)}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
