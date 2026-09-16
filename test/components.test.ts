import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

const packageDirectory = fileURLToPath(new URL('..', import.meta.url));
let designSystem: typeof import('../src/index.js');

beforeAll(async () => {
  execFileSync(process.execPath, ['build.mjs'], {
    cwd: packageDirectory,
    stdio: 'inherit',
  });
  designSystem = await import(/* @vite-ignore */ new URL('../dist/index.js', import.meta.url).href);
});

describe('design-system rendered contracts', () => {
  it('renders a native disabled button and forwards button attributes', () => {
    const markup = renderToStaticMarkup(
      createElement(designSystem.Button, {
        variant: 'danger',
        type: 'submit',
        disabled: true,
        'aria-label': 'Delete invoice',
        children: 'Delete',
      }),
    );

    expect(markup).toContain('<button');
    expect(markup).toContain('type="submit"');
    expect(markup).toContain('disabled');
    expect(markup).toContain('aria-label="Delete invoice"');
    expect(markup).toContain('>Delete</button>');
  });

  it('renders input labels, validation content, and native input attributes', () => {
    const markup = renderToStaticMarkup(
      createElement(designSystem.Input, {
        id: 'tax-id',
        label: 'Tax ID',
        error: 'Tax ID must be 9 digits.',
        type: 'text',
        name: 'taxId',
        required: true,
        disabled: true,
        placeholder: '123456789',
      }),
    );

    expect(markup).toContain('<label');
    expect(markup).toContain('Tax ID');
    expect(markup).toContain('<input');
    expect(markup).toContain('id="tax-id"');
    expect(markup).toContain('name="taxId"');
    expect(markup).toContain('required');
    expect(markup).toContain('disabled');
    expect(markup).toContain('placeholder="123456789"');
    expect(markup).toContain('Tax ID must be 9 digits.');
  });

  it('keeps filter chips interactive while status chips render as static tags', () => {
    const filterMarkup = renderToStaticMarkup(
      createElement(designSystem.Chip, {
        variant: 'filter',
        selected: true,
        onRemove: () => {},
        children: 'Awaiting approval',
      }),
    );
    const statusMarkup = renderToStaticMarkup(
      createElement(designSystem.Chip, {
        variant: 'status',
        tone: 'danger',
        children: 'Overdue',
      }),
    );

    expect(filterMarkup).toContain('<button');
    expect(filterMarkup).toContain('type="button"');
    expect(filterMarkup).toContain('Awaiting approval');
    expect(filterMarkup).toContain('×');
    expect(statusMarkup).toContain('<span');
    expect(statusMarkup).toContain('>Overdue</span>');
    expect(statusMarkup).not.toContain('<button');
  });

  it('renders a ButtonGroup as a labelled radiogroup with one checked radio and disabled segments preserved', () => {
    const markup = renderToStaticMarkup(
      createElement(designSystem.ButtonGroup, {
        'aria-label': 'Appearance',
        value: 'light',
        onChange: () => {},
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark', disabled: true, ariaLabel: 'Dark — not available yet' },
        ],
      }),
    );

    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('aria-label="Appearance"');
    expect(markup).toContain('role="radio"');
    expect(markup).toContain('aria-checked="true"');
    expect(markup).toContain('aria-checked="false"');
    expect(markup).toContain('aria-label="Dark — not available yet"');
    expect(markup).toContain('disabled');
    expect(markup).toContain('>Light</button>');
    expect(markup).toContain('>Dark</button>');
  });

  it('renders a Chart as an aria-hidden canvas plus a real, visually-hidden accessible data table', () => {
    const markup = renderToStaticMarkup(
      createElement(designSystem.Chart, {
        type: 'bar',
        title: 'Stock by warehouse',
        valueLabel: 'units',
        data: [
          { label: 'East', value: 420 },
          { label: 'West', value: 310 },
        ],
      }),
    );

    // Chart.js itself only draws once mounted in a real browser (useEffect never runs during
    // server rendering) — this checks the markup SSR can produce: the canvas shell and the real
    // accessible-table fallback, not the drawn chart.
    expect(markup).toContain('<canvas');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('<table');
    expect(markup).toContain('<caption>Stock by warehouse</caption>');
    expect(markup).toContain('>East</td>');
    expect(markup).toContain('>420 units</td>');
    expect(markup).toContain('Value (units)');
  });

  it('renders a controlled modal on a native <dialog>, closed by default', () => {
    // Modal is always mounted so `showModal()`/`close()` can be called
    // imperatively as `open` changes; a dialog with no `open` attribute is
    // `display: none` (and excluded from the accessibility tree) by the UA
    // stylesheet, so closed content is inert without a conditional render.
    const closedMarkup = renderToStaticMarkup(
      createElement(designSystem.Modal, {
        open: false,
        title: 'Reject invoice?',
        children: 'This should not render while open.',
      }),
    );
    const openMarkup = renderToStaticMarkup(
      createElement(designSystem.Modal, {
        open: true,
        onClose: () => {},
        title: 'Reject invoice?',
        children: createElement('p', null, 'The requester will be notified.'),
        actions: createElement(designSystem.Button, { variant: 'danger', children: 'Reject' }),
      }),
    );

    expect(closedMarkup).toContain('<dialog');
    expect(closedMarkup).not.toMatch(/<dialog[^>]*\sopen(\s|=|>)/);
    expect(openMarkup).toContain('<dialog');
    expect(openMarkup).toContain('role="dialog"');
    expect(openMarkup).toContain('aria-modal="true"');
    expect(openMarkup).toContain('aria-label="Reject invoice?"');
    expect(openMarkup).toContain('<h2');
    expect(openMarkup).toContain('Reject invoice?');
    expect(openMarkup).toContain('The requester will be notified.');
    expect(openMarkup).toContain('<button');
    expect(openMarkup).toContain('>Reject</button>');
  });

  it('composes semantic table sections, numeric headers, cells, and a status chip', () => {
    const markup = renderToStaticMarkup(
      createElement(
        designSystem.Table,
        null,
        createElement(
          designSystem.TableHead,
          null,
          createElement(
            designSystem.TableRow,
            null,
            createElement(designSystem.TableHeaderCell, null, 'Order'),
            createElement(designSystem.TableHeaderCell, { align: 'end' }, 'Amount'),
          ),
        ),
        createElement(
          designSystem.TableBody,
          null,
          createElement(
            designSystem.TableRow,
            null,
            createElement(designSystem.TableCell, null, 'PO-1042'),
            createElement(
              designSystem.TableCell,
              { align: 'end' },
              createElement(designSystem.Chip, { variant: 'status', tone: 'accent', children: '$1,240.00' }),
            ),
          ),
        ),
      ),
    );

    expect(markup).toContain('<table');
    expect(markup).toContain('<thead');
    expect(markup).toContain('<tbody>');
    expect(markup).toContain('<th');
    expect(markup).toContain('>Order</th>');
    expect(markup).toContain('>Amount</th>');
    expect(markup).toContain('<td');
    expect(markup).toContain('>PO-1042</td>');
    expect(markup).toContain('<span');
    expect(markup).toContain('>$1,240.00</span>');
  });

  it('renders a decorative Icon as aria-hidden with no accessible-name role', () => {
    const markup = renderToStaticMarkup(createElement(designSystem.Icon, { name: 'sliders' }));

    expect(markup).toContain('<svg');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).not.toContain('role="img"');
    expect(markup).not.toContain('<title>');
  });

  it('gives an icon-only-button Icon a real accessible name via title instead of aria-hidden', () => {
    const markup = renderToStaticMarkup(createElement(designSystem.Icon, { name: 'bell', title: 'Notifications' }));

    expect(markup).toContain('<svg');
    expect(markup).not.toContain('aria-hidden');
    expect(markup).toContain('role="img"');
    expect(markup).toContain('<title>Notifications</title>');
  });

  it('renders distinct structural glyphs per Icon name, sized and colored via props', () => {
    const sliders = renderToStaticMarkup(createElement(designSystem.Icon, { name: 'sliders', size: 24, color: '#0057b8' }));
    const bell = renderToStaticMarkup(createElement(designSystem.Icon, { name: 'bell' }));

    // `sliders` is three tracks (<line>) each with a handle (<circle>) — a structural fingerprint
    // distinguishing it from `bell`, which has no <line>/<circle> element at all.
    expect(sliders.match(/<line /g)?.length).toBe(3);
    expect(sliders.match(/<circle /g)?.length).toBe(3);
    expect(sliders).toContain('width="24"');
    expect(sliders).toContain('height="24"');
    expect(sliders).toContain('stroke="#0057b8"');
    expect(bell).not.toContain('<line');
    expect(bell).not.toContain('<circle');
    expect(bell).toContain('<path');
    // No explicit color given — falls back to currentColor, not a hardcoded token literal.
    expect(bell).toContain('fill="currentColor"');
    expect(bell).toContain('width="16"');
  });

  it('renders Theme as a wrapping element carrying a real theme class, and light/dark apply different themes', () => {
    const lightMarkup = renderToStaticMarkup(
      createElement(designSystem.Theme, { value: 'light', children: createElement('span', null, 'Forced light') }),
    );
    const darkMarkup = renderToStaticMarkup(
      createElement(designSystem.Theme, { value: 'dark', children: createElement('span', null, 'Forced dark') }),
    );

    expect(lightMarkup).toMatch(/^<div class="[^"]+"><span>Forced light<\/span><\/div>$/);
    expect(darkMarkup).toMatch(/^<div class="[^"]+"><span>Forced dark<\/span><\/div>$/);
    // `lightColor`/`darkColor` are two distinct `stylex.createTheme` themes (tokens.stylex.ts) —
    // a real override, not the same class applied twice regardless of `value`.
    const lightClass = lightMarkup.match(/^<div class="([^"]+)"/)?.[1];
    const darkClass = darkMarkup.match(/^<div class="([^"]+)"/)?.[1];
    expect(lightClass).toBeTruthy();
    expect(darkClass).toBeTruthy();
    expect(lightClass).not.toBe(darkClass);
  });

  it('renders each Text variant on its default element, and `as` overrides the element', () => {
    const heading = renderToStaticMarkup(createElement(designSystem.Text, { variant: 'heading', children: 'Orders' }));
    const caption = renderToStaticMarkup(createElement(designSystem.Text, { variant: 'caption', children: 'Orders' }));
    const overridden = renderToStaticMarkup(
      createElement(designSystem.Text, { variant: 'heading', as: 'span', children: 'Orders' }),
    );

    expect(heading).toMatch(/^<h2 class="[^"]+">Orders<\/h2>$/);
    expect(caption).toMatch(/^<span class="[^"]+">Orders<\/span>$/);
    expect(overridden).toMatch(/^<span class="[^"]+">Orders<\/span>$/);
    // Different variants carry different size/weight tokens, so their compiled class lists differ.
    expect(heading).not.toBe(caption);
  });
});
