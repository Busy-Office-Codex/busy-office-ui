import * as stylex from '@stylexjs/stylex';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
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
    outlineStyle: 'solid',
    outlineOffset: '2px',
    outlineColor: {
      default: 'transparent',
      ':focus-visible': color.focusRing,
    },
    outlineWidth: {
      default: 0,
      ':focus-visible': '2px',
    },
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
    outlineStyle: 'none',
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
  itemHighlighted: {
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
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
  const [open, setOpen] = useState(defaultOpen && items.length > 0);
  const [highlighted, setHighlighted] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const skipNextAutoFocusRef = useRef(defaultOpen && items.length > 0);
  const baseId = useId();
  const active = items.some((item) => item.selected);

  const optionId = (index: number) => `${baseId}-option-${index}`;

  const openMenu = (initialIndex?: number) => {
    if (items.length === 0) return;
    const selectedIndex = items.findIndex((item) => item.selected);
    setHighlighted(initialIndex ?? (selectedIndex >= 0 ? selectedIndex : 0));
    setOpen(true);
  };

  const closeMenu = (returnFocus: boolean) => {
    setOpen(false);
    setHighlighted(-1);
    if (returnFocus) triggerRef.current?.focus();
  };

  const selectIndex = (index: number) => {
    const item = items[index];
    if (!item) return;
    onSelect?.(item.label);
    closeMenu(true);
  };

  useEffect(() => {
    if (!open) return;
    if (skipNextAutoFocusRef.current) {
      skipNextAutoFocusRef.current = false;
    } else {
      menuRef.current?.focus();
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) closeMenu(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openMenu();
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (items.length === 0) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(true);
      } else if (event.key === 'Tab') {
        closeMenu(false);
      }
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((index) => (index + 1) % items.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((index) => (index - 1 + items.length) % items.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setHighlighted(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setHighlighted(items.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectIndex(highlighted);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
    } else if (event.key === 'Tab') {
      closeMenu(false);
    }
  };

  return (
    <div {...stylex.props(styles.wrapper)} ref={wrapperRef}>
      <button
        type="button"
        ref={triggerRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? closeMenu(false) : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        {...stylex.props(styles.trigger, active && styles.triggerActive)}
      >
        {label} ▾
      </button>
      {open && (
        <div
          ref={menuRef}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          aria-activedescendant={highlighted >= 0 && highlighted < items.length ? optionId(highlighted) : undefined}
          onKeyDown={handleMenuKeyDown}
          {...stylex.props(styles.menu)}
        >
          {items.map((item, index) => (
            <div
              key={item.label}
              id={optionId(index)}
              role="option"
              aria-selected={Boolean(item.selected)}
              {...stylex.props(styles.item, index === highlighted && styles.itemHighlighted, item.selected && styles.itemSelected)}
              onMouseEnter={() => setHighlighted(index)}
              onClick={() => selectIndex(index)}
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
