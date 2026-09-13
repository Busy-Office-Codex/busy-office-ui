import { expect, test } from '@playwright/test';

// Regression coverage for templates/erp-foundation/handoff.md's Round-2 "Should fix" items
// (Busy Office Design System Claude Design project), confirmed still-open against src/ before
// this batch and closed here. Values below are the shared motion.durationBase/motion tokens and
// color.borderStrong from src/tokens.stylex.ts, not independently invented numbers.

test('Button variant="secondary" has a distinct pressed (:active) background, not just hover', async ({ page }) => {
  await page.goto('/#examples');
  const button = page.getByRole('button', { name: 'Export', exact: true });
  const box = await button.boundingBox();
  if (!box) throw new Error('Export button not found');

  await expect(button).toHaveCSS('background-color', 'rgb(241, 245, 249)'); // color.bgSubtle, resting

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(button).toHaveCSS('background-color', 'rgb(203, 213, 225)'); // color.borderStrong, the new :active step
  await page.mouse.up();
});

test('Button and Card transitions read from the shared motion token, not a hardcoded duration', async ({ page }) => {
  await page.goto('/#examples');
  const button = page.getByRole('button', { name: 'Export', exact: true });
  await expect(button).toHaveCSS('transition-duration', '0.2s'); // motion.durationBase (200ms)

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Dashboards\b/ }).click();
  const card = page.getByRole('button', { name: /OPEN ORDERS/ });
  await expect(card).toHaveCSS('transition-duration', '0.2s');
});

test('a Button label does not wrap when its flex track is narrower than the label', async ({ page }) => {
  await page.goto('/#examples');
  const button = page.getByRole('button', { name: 'New purchase order', exact: true });
  const box = await button.boundingBox();
  if (!box) throw new Error('button not found');
  // Single line at the fixed 40px height — a wrapped label would grow past it.
  expect(box.height).toBeLessThanOrEqual(41);
  const singleLineHeight = await button.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
  expect(singleLineHeight).toBeLessThanOrEqual(16); // line-height:1 at 15px body text, not the browser default (~1.15–1.5x)
});

test('Modal panel carries base body typography independent of what children supply', async ({ page }) => {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Sales', exact: true }).click(); // dock tile -> Sales order page
  await page.getByRole('button', { name: 'Reject', exact: true }).click();
  // The styled panel is the <dialog>'s inner wrapper div, not the <dialog> element itself
  // (which stays at the browser's UA default font-size) — target that specifically.
  const panel = page.getByRole('dialog', { name: 'Reject SO-1042?' }).locator('> div');
  await expect(panel).toHaveCSS('font-size', '15px');
  await expect(panel).toHaveCSS('color', 'rgb(15, 23, 42)'); // color.textPrimary
  const lineHeight = await panel.evaluate((el) => getComputedStyle(el).lineHeight);
  expect(lineHeight).toBe('24px'); // font.lineHeightBody (1.6) × 15px
});

test('Chip (filter) and Dropdown trigger labels stay on one line with a tight line-height', async ({ page }) => {
  await page.goto('/#examples');
  // Both render at font.sizeCaption (12.5px); line-height:'1' is a unitless multiplier, so it
  // computes to 12.5px of text line-box height, not the pill's own 32px height.
  const chip = page.getByRole('button', { name: 'All open · 6', exact: true });
  await expect(chip).toHaveCSS('white-space', 'nowrap');
  await expect(chip).toHaveCSS('line-height', '12.5px');

  const dropdown = page.getByRole('button', { name: /^Status/, exact: false });
  await expect(dropdown).toHaveCSS('white-space', 'nowrap');
  await expect(dropdown).toHaveCSS('line-height', '12.5px');
});
