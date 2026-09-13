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

  it('renders a controlled modal only while open, including its action slot', () => {
    const closedMarkup = renderToStaticMarkup(
      createElement(designSystem.Modal, {
        open: false,
        title: 'Reject invoice?',
        children: 'This should not render.',
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

    expect(closedMarkup).toBe('');
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
});
