import { expect, test } from '@playwright/test';

// Regression coverage for templates/erp-foundation/handoff.md's Round-2 "Should fix" items
// (Busy Office Design System Claude Design project), confirmed still-open against src/ before
// this batch and closed here. Values below are the shared motion.durationBase/motion tokens and
// color.borderStrong from src/tokens.stylex.ts, not independently invented numbers.

test('Button variant="secondary" has a distinct pressed (:active) background, not just hover', async ({ page }) => {
  await page.goto('/#examples');
  const button = page.getByRole('button', { name: 'From requisition', exact: true });
  const box = await button.boundingBox();
  if (!box) throw new Error('From requisition button not found');

  await expect(button).toHaveCSS('background-color', 'rgb(241, 245, 249)'); // color.bgSubtle, resting

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(button).toHaveCSS('background-color', 'rgb(203, 213, 225)'); // color.borderStrong, the new :active step
  await page.mouse.up();
});

test('Button and Card transitions read from the shared motion token, not a hardcoded duration', async ({ page }) => {
  await page.goto('/#examples');
  const button = page.getByRole('button', { name: 'From requisition', exact: true });
  await expect(button).toHaveCSS('transition-duration', '0.2s'); // motion.durationBase (200ms)

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Dashboards\b/ }).click();
  const card = page.getByRole('button', { name: /OPEN ORDERS/ });
  await expect(card).toHaveCSS('transition-duration', '0.2s');
});

test('Button carries the flex/typography properties the handoff asked for directly, not just their side effects', async ({ page }) => {
  await page.goto('/#examples');
  const button = page.getByRole('button', { name: '+ New PO', exact: true });
  // Assert the properties themselves — no Button call site renders an icon yet (no Icon component
  // exists), so there's no real icon+label layout to prove alignItems/gap against behaviorally;
  // asserting the computed CSS directly is the honest check available today. Authored as
  // inline-flex, but this button is itself a flex item of ListReport's button row, so its outer
  // display is blockified to "flex" per CSS Display Level 3 — match either, since both are the
  // same authored flex container, just blockified by context.
  await expect(button).toHaveCSS('display', /^(inline-)?flex$/);
  await expect(button).toHaveCSS('align-items', 'center');
  await expect(button).toHaveCSS('gap', '8px'); // space.space2
  const box = await button.boundingBox();
  if (!box) throw new Error('button not found');
  expect(box.height).toBeLessThanOrEqual(41); // single line at the fixed 40px height
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

test('Button (compact) and Dropdown trigger labels stay on one line with a tight line-height', async ({ page }) => {
  await page.goto('/#examples');
  // Both render at font.sizeCaption (12.5px); line-height:'1' is a unitless multiplier, so it
  // computes to 12.5px of text line-box height, not the pill's own 32px height. ListReport's
  // filter Chips were removed in the "14 · Purchase order" rebuild — its compact "+ New PO"
  // Button shares the same nowrap/line-height:1 CSS contract a filter Chip did.
  const button = page.getByRole('button', { name: '+ New PO', exact: true });
  await expect(button).toHaveCSS('white-space', 'nowrap');
  await expect(button).toHaveCSS('line-height', '12.5px');

  const dropdown = page.getByRole('button', { name: /^Status/, exact: false });
  await expect(dropdown).toHaveCSS('white-space', 'nowrap');
  await expect(dropdown).toHaveCSS('line-height', '12.5px');
});
