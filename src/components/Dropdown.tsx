import * as stylex from '@stylexjs/stylex';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { color, density, font, glass, radius, shadow, space } from '../tokens.stylex.js';

const styles = stylex.create({
  wrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  trigger: {
    fontFamily: font.family,
    // Fully density-driven (ROADMAP item 10) — Dropdown has no size prop/override to keep
    // working, so unlike Button/Input there's no literal branch here at all. Reads the same
    // `controlHeight` alias as Button/filter Chip: docs/design-conventions.md already groups
    // Button, filter Chip and Dropdown's trigger as the one "always a capsule" shape family,
    // so they share one control height too.
    fontSize: density.fontSize,
    minHeight: density.controlHeight,
    paddingInline: space.space4,
    borderRadius: radius.pill,
    borderStyle: 'solid',
    borderWidth: '1px',
    // Rest border stays `color.borderStrong` (unchanged) — that's what filter `Chip`'s own
    // outline-pill rest state (`Chip.tsx`'s `filterBase`) already uses, the closest existing
    // precedent for this exact shape (docs/design-conventions.md's capsule family). ROADMAP item
    // 11 (2026-09-14 design review): rest/hover/:active/open must each read as a genuinely
    // different state, not one flat "transparent, no border-hover" trigger for every interaction
    // — the ink escalates one neutral-scale step per state, then jumps to `color.action` (filled,
    // white text) only for a real narrowed filter (`active` prop / `triggerActive` below), so the
    // one dark-filled look stays reserved for "this is actually filtering something."
    borderColor: color.borderStrong,
    // transparent (rest) → bgSubtle (hover) → border (pressed) mirrors Button's `ghost` variant
    // exactly (Button.tsx) — the closest vocabulary since, like ghost, this trigger's rest state
    // is unfilled. That's also the same bgSubtle→border two-step Button's `secondary` variant
    // uses for its own hover→active escalation, just starting one token lighter.
    backgroundColor: {
      default: 'transparent',
      ':hover': color.bgSubtle,
      ':active': color.border,
    },
    color: color.textPrimary,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.space2,
    whiteSpace: 'nowrap',
    lineHeight: '1',
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
  // `aria-expanded="true"` (menu open, not necessarily a narrowed filter): one step further than
  // the `:active` press — `borderStrong` background plus an ink-colored (`color.action`) border,
  // so it reads as "engaged" without borrowing the filled/white-text `triggerActive` look. Applied
  // before `triggerActive` in the `stylex.props()` call below, so a trigger that is both open and
  // already filtering a value still shows the filled treatment (open contributes nothing new to
  // look at in that case, which is fine — the filled state is already maximally prominent).
  triggerOpen: {
    backgroundColor: color.borderStrong,
    borderColor: color.action,
  },
  // Reserved for a genuinely narrowed filter (`active` prop, or the legacy `items.some(selected)`
  // fallback) — never the default/rest state. This is the one dark-ink fill in the row; item 11
  // exists precisely to stop every Dropdown trigger from rendering this way at rest.
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
    // The listbox (not the trigger) becomes `document.activeElement` on open — see the `open`
    // effect below, `menuRef.current?.focus()` — so its own `:focus-visible` is the trigger's
    // focus ring "surviving" the open, per item 11's requirement 4. This is the smaller change of
    // the two options: `:focus-visible`'s native heuristic already does the right thing for free
    // (a keyboard-driven open — Tab then ArrowDown — keeps the ring; a mouse click does not),
    // without Dropdown having to track "was this opened via keyboard" itself. Pattern copied
    // verbatim from Button.tsx/Card.tsx's own `:focus-visible` outline.
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
  item: {
    fontFamily: font.family,
    // ROADMAP item 11: was `font.sizeBody` (15px, fixed) — option rows are a control-adjacent
    // surface (they're what the trigger's own density-driven text opens into), so they should
    // track the same ambient `density.fontSize` alias the trigger itself reads, not the fixed
    // body-copy size. Matches Table's body cells, which already read the density tier rather than
    // `sizeBody` for the same reason (tokens.stylex.ts).
    fontSize: density.fontSize,
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
    // Authored zero-width/transparent baseline (matching the `trigger`/`menu` pattern above)
    // rather than leaving outline unset, so `itemHighlighted` below has a real "off" state to
    // override, not an unstyled default the browser fills in on its own.
    outlineStyle: 'solid',
    outlineOffset: '-2px',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  // Was a flat `rgba(15, 23, 42, 0.06)` tint — 1.11:1 contrast against the glass menu background,
  // effectively invisible, and the ONLY indicator while arrow-keying through options (the menu
  // itself sets `outlineStyle: 'none'` at rest). Now a real two-part cue: a visible fill plus an
  // inset ring using the same `focusRing` token/2px width Button/Card use for their own
  // `:focus-visible` outlines (Button.tsx, Card.tsx) — `outlineOffset: '-2px'` draws it inside the
  // row instead of being clipped by the menu's `overflow` (the menu has no explicit
  // `overflow` today, but the row sits flush against the menu's own padding, so a positive/zero
  // offset would visually collide with the row above/below it).
  itemHighlighted: {
    backgroundColor: color.bgSubtle,
    outlineWidth: '2px',
    outlineColor: color.focusRing,
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
  /**
   * Whether the trigger should render as actively filtering (the dark `triggerActive` fill).
   * This is deliberately a separate concept from `items[].selected`: `selected` is about the
   * MENU — which item shows the checkmark when the menu is opened, including a default "All …"/
   * "Any time" item a caller marks `selected` just so the menu itself renders sensibly — while
   * `active` is about the TRIGGER's fill, i.e. whether this filter is currently narrowing
   * anything. A caller whose default item is marked `selected` should pass `active` explicitly
   * (computed as "the current value differs from the default"), or every Dropdown with a default
   * selection would render permanently filled, collapsing the visual hierarchy between a real
   * narrowed filter and one doing nothing (ROADMAP item 11). When omitted, falls back to the
   * previous behavior (`items.some(item => item.selected)`) so an existing caller that never
   * passes `active` keeps working unchanged.
   */
  active?: boolean;
};

export function Dropdown({ label, items, onSelect, defaultOpen = false, active: activeProp }: DropdownProps) {
  const [open, setOpen] = useState(defaultOpen && items.length > 0);
  const [highlighted, setHighlighted] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const skipNextAutoFocusRef = useRef(defaultOpen && items.length > 0);
  const baseId = useId();
  const active = activeProp ?? items.some((item) => item.selected);

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
        {...stylex.props(styles.trigger, open && styles.triggerOpen, active && styles.triggerActive)}
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
