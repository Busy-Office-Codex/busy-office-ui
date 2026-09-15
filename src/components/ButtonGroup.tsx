import * as stylex from '@stylexjs/stylex';
import { useRef, type KeyboardEvent } from 'react';
import { color, density, font, motion, radius, space } from '../tokens.stylex.js';

const styles = stylex.create({
  // The track is the "one capsule" (docs/design-conventions.md's capsule rule) — segments are
  // small pills floating inside it, not their own independent capsules with gaps between them
  // (that shape already exists: `Chip variant="filter"` rows, see `examples/filterTabs.tsx`).
  // Density-driven (`controlHeight`) like `Button`/`Dropdown`'s trigger/filter `Chip`, so a
  // `ButtonGroup` sits at the same height as its capsule-family neighbors at every tier.
  track: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    padding: '2px',
    borderRadius: radius.pill,
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: color.borderStrong,
    backgroundColor: color.bgSubtle,
    minHeight: density.controlHeight,
    boxSizing: 'border-box',
  },
  segment: {
    fontFamily: font.family,
    fontSize: density.fontSize,
    // `controlHeight` minus the track's 2px top/bottom padding, so the segment fills the track
    // exactly rather than leaving unequal inner whitespace at every density tier.
    minHeight: `calc(${density.controlHeight} - 4px)`,
    boxSizing: 'border-box',
    borderRadius: radius.pill,
    borderStyle: 'none',
    paddingInline: space.space4,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    lineHeight: '1',
    color: color.textSecondary,
    backgroundColor: {
      default: 'transparent',
      ':hover': color.bgSurface,
    },
    cursor: {
      default: 'pointer',
      ':disabled': 'not-allowed',
    },
    opacity: {
      default: 1,
      ':disabled': 0.4,
    },
    transitionProperty: 'background-color, color',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeStandard,
    // Inset, not the capsule family's usual +2px offset (Button/Chip/Dropdown trigger): those
    // are standalone controls, but a segment sits flush against its neighbors inside a 2px-
    // padded track, where an outward ring would visually collide with the track's own border —
    // same reasoning as Dropdown's `itemHighlighted` inset ring for menu options.
    outlineStyle: 'solid',
    outlineOffset: '-2px',
    outlineColor: {
      default: 'transparent',
      ':focus-visible': color.focusRing,
    },
    outlineWidth: {
      default: 0,
      ':focus-visible': '2px',
    },
  },
  // Same dark-ink fill as `Button`'s primary variant and filter `Chip`'s `selected` state — the
  // one "this is the active thing" treatment this design system already uses everywhere else,
  // not a new visual motif invented for this component.
  segmentSelected: {
    backgroundColor: {
      default: color.action,
      ':hover': color.actionHover,
    },
    color: color.textOnInk,
    fontWeight: font.weightMedium,
  },
});

export type ButtonGroupOption = {
  value: string;
  label: string;
  disabled?: boolean;
  /**
   * Overrides the segment's accessible name — e.g. to explain why it's disabled beyond what the
   * visible `label` says (a caption elsewhere in the page carries the same explanation visually;
   * this repeats it for screen reader users landing on the control itself, same as the disabled
   * filter `Chip`s this component's Control Center call site used before).
   */
  ariaLabel?: string;
};

export type ButtonGroupProps = {
  options: readonly ButtonGroupOption[];
  value: string;
  onChange: (value: string) => void;
  'aria-label': string;
};

/**
 * A small, fixed set of mutually-exclusive options rendered as one joined pill — the WAI-ARIA
 * "radio group" pattern (`role="radiogroup"` + `role="radio"` children, roving tabindex, arrow
 * keys both move focus and select, same as a native `<input type="radio">` group). For 2-5
 * options a caller wants to read as one control (a density tier, a view mode) — not filter
 * `Chip`'s "row of separately-spaced pills" shape, which stays correct for an arbitrary-length,
 * independently-addressable filter row (see `examples/filterTabs.tsx`). Not for navigation
 * (tabs that change the page's content/URL) or for more than a handful of options — past ~5,
 * `Dropdown` reads better than a wide joined pill.
 */
export function ButtonGroup({ options, value, onChange, ...rest }: ButtonGroupProps) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabledIndexes = options.reduce<number[]>((indexes, option, index) => {
    if (!option.disabled) indexes.push(index);
    return indexes;
  }, []);

  const selectIndex = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    buttonRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const position = enabledIndexes.indexOf(index);
    if (position === -1 || enabledIndexes.length === 0) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      selectIndex(enabledIndexes[(position + 1) % enabledIndexes.length]);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectIndex(enabledIndexes[(position - 1 + enabledIndexes.length) % enabledIndexes.length]);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectIndex(enabledIndexes[0]);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectIndex(enabledIndexes[enabledIndexes.length - 1]);
    }
  };

  return (
    <div role="radiogroup" {...rest} {...stylex.props(styles.track)}>
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.ariaLabel}
            disabled={option.disabled}
            tabIndex={selected ? 0 : -1}
            onClick={() => selectIndex(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            {...stylex.props(styles.segment, selected && styles.segmentSelected)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
