import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

const packageDirectory = fileURLToPath(new URL('..', import.meta.url));
let ListReport: typeof import('../examples/ListReport.js').ListReport;
let RecordDetail: typeof import('../examples/RecordDetail.js').RecordDetail;

beforeAll(async () => {
  execFileSync(process.execPath, ['build.mjs'], {
    cwd: packageDirectory,
    stdio: 'inherit',
  });
  ({ ListReport } = await import(/* @vite-ignore */ new URL('../dist/examples/list-report.js', import.meta.url).href));
  ({ RecordDetail } = await import(
    /* @vite-ignore */ new URL('../dist/examples/record-detail.js', import.meta.url).href
  ));
});

// Roadmap item 3: ListReport and RecordDetail each expose a `state` prop
// (default `'ready'`) so loading, empty, error and permission (forbidden)
// states are real and directly testable — not just reachable through
// incidental interaction. Every case here backs a claim made in
// docs/ListReport.md / docs/RecordDetail.md.
describe('ListReport state prop', () => {
  it('defaults to the ready table with no status/alert region', () => {
    const markup = renderToStaticMarkup(createElement(ListReport, {}));

    expect(markup).toContain('<table');
    expect(markup).toContain('Purchase orders');
    expect(markup).not.toContain('role="status"');
    expect(markup).not.toContain('role="alert"');
  });

  it('"ready" renders the table unfiltered, with no empty-state caption yet', () => {
    // The zero-filtered-rows case lives inside `'ready'` (see
    // examples/ListReport.tsx's state-prop doc comment) — it is a consequence
    // of the toolbar's own filter/search state, not a distinct literal, so it
    // only appears once a filter/search narrows the sample ORDERS to zero
    // matches. That interactive path is covered by
    // test/browser/sample-pages-states.spec.ts, since it requires typing into
    // the toolbar's search field — this render only proves the unfiltered
    // default stays a plain table.
    const markup = renderToStaticMarkup(createElement(ListReport, { state: 'ready' }));

    expect(markup).toContain('<table');
    expect(markup).not.toContain('No purchase orders match these filters.');
  });

  it('"loading" replaces the table with an announced status region, table gone', () => {
    const markup = renderToStaticMarkup(createElement(ListReport, { state: 'loading' }));

    expect(markup).toContain('role="status"');
    expect(markup).toContain('Loading purchase orders');
    expect(markup).not.toContain('<table');
  });

  it('"error" replaces the table with an alert region and a retry action', () => {
    const markup = renderToStaticMarkup(createElement(ListReport, { state: 'error' }));

    expect(markup).toContain('role="alert"');
    // renderToStaticMarkup HTML-escapes the apostrophe as `&#x27;`.
    expect(markup).toContain('Purchase orders couldn&#x27;t be loaded');
    expect(markup).toContain('>Retry<');
    expect(markup).not.toContain('<table');
  });

  it('"forbidden" replaces the table with an announced status region explaining restricted access', () => {
    const markup = renderToStaticMarkup(createElement(ListReport, { state: 'forbidden' }));

    expect(markup).toContain('role="status"');
    expect(markup).toContain('You don&#x27;t have access to purchase orders');
    expect(markup).not.toContain('<table');
  });
});

describe('RecordDetail state prop', () => {
  it('defaults to the ready summary cards and action row, no status/alert region', () => {
    const markup = renderToStaticMarkup(createElement(RecordDetail, {}));

    expect(markup).toContain('Order total');
    expect(markup).toContain('$24,300');
    expect(markup).toContain('>Approve<');
    expect(markup).not.toContain('role="status"');
    expect(markup).not.toContain('role="alert"');
  });

  it('"empty" keeps the header and action row but swaps the three cards for a placeholder', () => {
    const markup = renderToStaticMarkup(createElement(RecordDetail, { state: 'empty' }));

    expect(markup).toContain('SO-1042 · Northwind Traders');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('This draft has no summary data yet');
    expect(markup).toContain('>Approve<');
    expect(markup).not.toContain('Order total');
  });

  it('"loading" replaces the cards and actions with an announced status region', () => {
    const markup = renderToStaticMarkup(createElement(RecordDetail, { state: 'loading' }));

    expect(markup).toContain('SO-1042 · Northwind Traders');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('Loading order details');
    expect(markup).not.toContain('Order total');
    expect(markup).not.toContain('>Approve<');
  });

  it('"error" replaces the cards and actions with an alert region and a retry action', () => {
    const markup = renderToStaticMarkup(createElement(RecordDetail, { state: 'error' }));

    expect(markup).toContain('role="alert"');
    // renderToStaticMarkup HTML-escapes the apostrophe as `&#x27;`.
    expect(markup).toContain('This sales order couldn&#x27;t be loaded');
    expect(markup).toContain('>Retry<');
    expect(markup).not.toContain('Order total');
    expect(markup).not.toContain('>Approve<');
  });

  it('"forbidden" replaces the cards and actions with an announced status region explaining restricted access', () => {
    const markup = renderToStaticMarkup(createElement(RecordDetail, { state: 'forbidden' }));

    expect(markup).toContain('role="status"');
    expect(markup).toContain('You don&#x27;t have access to this sales order');
    expect(markup).not.toContain('Order total');
    expect(markup).not.toContain('>Approve<');
  });
});
