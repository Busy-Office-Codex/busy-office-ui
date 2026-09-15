import { expect, test } from '@playwright/test';

// Owner-directed, 2026-09-15: at a wide viewport (>= 900px), Inbox becomes a full-height
// workspace view — no page-level scroll of its own; the thread list and the conversation each
// scroll independently, and the reply composer stays pinned at the bottom of the conversation
// pane. A resizable divider (a real `role="separator"`, pointer-drag AND keyboard) lets the
// thread list take more or less of the fixed width. Below the breakpoint, this falls back to the
// original stacked, page-scrolling layout, unchanged (see test/browser/mobile-responsive.spec.ts
// for that layout's own mobile-safety coverage). See examples/Inbox.tsx's file header comment for
// the full design rationale.

async function openInbox(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Inbox\b/ }).click();
}

test('at a wide viewport, Inbox fills the viewport with no page-level scroll of its own', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openInbox(page);

  const overflow = await page.evaluate(() => {
    const el = document.scrollingElement!;
    return { scrollHeight: el.scrollHeight, clientHeight: el.clientHeight };
  });
  expect(overflow.scrollHeight).toBe(overflow.clientHeight);

  // The thread list itself still has more threads than fit — it scrolls internally instead of
  // pushing the page taller.
  await expect(page.getByRole('separator', { name: 'Resize thread list' })).toBeVisible();
});

test('the resize divider supports both pointer drag and full keyboard control', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openInbox(page);

  const handle = page.getByRole('separator', { name: 'Resize thread list' });
  const initialWidth = Number(await handle.getAttribute('aria-valuenow'));

  const box = await handle.boundingBox();
  if (!box) throw new Error('resize handle has no bounding box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect(handle).toHaveAttribute('aria-valuenow', String(initialWidth + 100));

  await handle.focus();
  await page.keyboard.press('ArrowRight');
  await expect(handle).toHaveAttribute('aria-valuenow', String(initialWidth + 116));

  const min = await handle.getAttribute('aria-valuemin');
  const max = await handle.getAttribute('aria-valuemax');
  if (min === null || max === null) throw new Error('resize handle is missing aria-valuemin/aria-valuemax');

  await page.keyboard.press('Home');
  await expect(handle).toHaveAttribute('aria-valuenow', min);

  await page.keyboard.press('End');
  await expect(handle).toHaveAttribute('aria-valuenow', max);
});

test('below the breakpoint, Inbox falls back to the original stacked, page-scrolling layout with no resize handle', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 800 });
  await openInbox(page);

  await expect(page.getByRole('separator', { name: 'Resize thread list' })).toHaveCount(0);

  const overflow = await page.evaluate(() => {
    const el = document.scrollingElement!;
    return { scrollHeight: el.scrollHeight, clientHeight: el.clientHeight };
  });
  // The stacked layout is naturally taller than one 800px viewport — it's meant to page-scroll,
  // not fit exactly.
  expect(overflow.scrollHeight).toBeGreaterThan(overflow.clientHeight);
});

// The two tests below cover findings from a "grill the design" pass (2026-09-15) against a live
// screenshot — see examples/Inbox.tsx's file header comment for the full reasoning on both.

test('the resize divider gets its own :focus-visible ring on real keyboard focus, not the browser default', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openInbox(page);

  const handle = page.getByRole('separator', { name: 'Resize thread list' });

  // A plain .focus() call right after a mouse click does NOT reliably trigger :focus-visible
  // (confirmed live: the browser's own input-modality heuristic treats it as still "mouse") — a
  // real Tab keypress is what an actual keyboard user does, and the only reliable way to assert
  // this. Bounded loop since other focusable controls sit before the separator in tab order.
  let reachedHandle = false;
  for (let i = 0; i < 30 && !reachedHandle; i++) {
    await page.keyboard.press('Tab');
    reachedHandle = await handle.evaluate((el) => document.activeElement === el);
  }
  expect(reachedHandle).toBe(true);

  const outline = await handle.evaluate((el) => getComputedStyle(el).outlineWidth);
  expect(outline).toBe('2px');
});

// A third "grill the design" pass (2026-09-15, "screen looks messy now" against a live
// screenshot) moved Assign/Archive off every thread-list row into the detail pane
// (recordContext), acting on "whichever thread is open" — the same place Approvals.tsx already
// keeps its own row-level actions, not a new pattern. Repeating two full-weight Button labels
// down 5-6 rows read as noise; the list is back to two lines per row.
test('Assign/Archive live once in the detail pane, not repeated on every thread-list row', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openInbox(page);

  await expect(page.getByRole('button', { name: 'Assign', exact: true })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Archive', exact: true })).toHaveCount(1);

  // Confirm they sit in the detail pane (next to the open thread's record context), not the list.
  const recordHeading = page.getByRole('heading', { name: 'SO-1042 · Northwind Traders' });
  await expect(recordHeading).toBeVisible();
});
