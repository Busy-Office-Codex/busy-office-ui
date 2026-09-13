import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

const packageDirectory = fileURLToPath(new URL('..', import.meta.url));
let designSystem;

beforeAll(async () => {
  execFileSync(process.execPath, ['build.mjs'], {
    cwd: packageDirectory,
    stdio: 'inherit',
  });
  designSystem = await import(/* @vite-ignore */ new URL('../dist/index.js', import.meta.url).href);
});

// Roadmap item 5: every visual state prop must expose its state both
// programmatically (an ARIA attribute an AT can query) and by a non-colour
// cue (a glyph, weight or shape change an AT-less, colour-blind viewer can
// still see) — never by hue alone. Each entry renders the "on" and "off"
// markup for one state prop and checks both channels; add a row here for
// every new selected/active/current-style prop the design system ships.
const STATE_PROPS = [
  {
    name: 'Card selected (interactive)',
    on: () =>
      renderToStaticMarkup(
        createElement(designSystem.Card, { selected: true, onClick: () => {}, children: 'Open orders' }),
      ),
    off: () =>
      renderToStaticMarkup(
        createElement(designSystem.Card, { selected: false, onClick: () => {}, children: 'Open orders' }),
      ),
    programmatic: (markup) => markup.includes('aria-pressed="true"'),
    programmaticOff: (markup) => markup.includes('aria-pressed="false"'),
    nonColour: (markup) => markup.includes('aria-hidden="true"') && markup.includes('✓'),
  },
  {
    name: 'Card disabled (interactive)',
    on: () =>
      renderToStaticMarkup(
        createElement(designSystem.Card, { disabled: true, onClick: () => {}, children: 'Locked' }),
      ),
    off: () =>
      renderToStaticMarkup(
        createElement(designSystem.Card, { disabled: false, onClick: () => {}, children: 'Locked' }),
      ),
    programmatic: (markup) => markup.includes('aria-disabled="true"'),
    programmaticOff: (markup) => !markup.includes('aria-disabled'),
    // Disabled removes the interactive affordance itself (no role="button", no tabindex)
    // rather than only recolouring the card — that absence is the non-colour cue.
    nonColour: (markup) => !markup.includes('role="button"') && !markup.includes('tabindex'),
  },
  {
    name: 'Chip filter selected',
    on: () =>
      renderToStaticMarkup(
        createElement(designSystem.Chip, { variant: 'filter', selected: true, children: 'Mine' }),
      ),
    off: () =>
      renderToStaticMarkup(
        createElement(designSystem.Chip, { variant: 'filter', selected: false, children: 'Mine' }),
      ),
    programmatic: (markup) => markup.includes('aria-pressed="true"'),
    programmaticOff: (markup) => markup.includes('aria-pressed="false"'),
    nonColour: (markup) => markup.includes('aria-hidden="true"') && markup.includes('✓'),
  },
  {
    name: 'Dropdown item selected',
    on: () =>
      renderToStaticMarkup(
        createElement(designSystem.Dropdown, {
          label: 'Status',
          defaultOpen: true,
          items: [{ label: 'Awaiting approval', selected: true }],
        }),
      ),
    off: () =>
      renderToStaticMarkup(
        createElement(designSystem.Dropdown, {
          label: 'Status',
          defaultOpen: true,
          items: [{ label: 'Awaiting approval', selected: false }],
        }),
      ),
    programmatic: (markup) => markup.includes('aria-selected="true"'),
    programmaticOff: (markup) => markup.includes('aria-selected="false"'),
    nonColour: (markup) => markup.includes('✓'),
  },
];

describe('visual state is never carried by colour alone', () => {
  for (const state of STATE_PROPS) {
    it(`${state.name} exposes its state both programmatically and by a non-colour cue`, () => {
      const onMarkup = state.on();
      const offMarkup = state.off();

      expect(state.programmatic(onMarkup), `${state.name}: expected an ARIA attribute in the "on" markup`).toBe(
        true,
      );
      expect(
        state.programmaticOff(offMarkup),
        `${state.name}: expected the "off" markup's ARIA attribute to differ from "on"`,
      ).toBe(true);
      expect(state.nonColour(onMarkup), `${state.name}: expected a non-colour cue in the "on" markup`).toBe(true);
      expect(
        state.nonColour(offMarkup),
        `${state.name}: the "off" markup must not carry the "on" cue too`,
      ).toBe(false);
    });
  }
});
