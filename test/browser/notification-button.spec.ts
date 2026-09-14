import { expect, test } from '@playwright/test';

// ROADMAP item 13 (2026-09-14 design review, confirmed LOW finding): the sample host's
// notification icon button (examples/AppShell.tsx) had identical rest/hover/active styling (no
// interaction feedback) next to a "+ New" button that has real hover/active states.

test('the notification button shows a :hover background distinct from its resting state', async ({ page }) => {
  await page.goto('/#examples');
  const button = page.getByRole('button', { name: 'Notifications, 3 unread', exact: true });

  await expect(button).toHaveCSS('background-color', 'rgb(255, 255, 255)'); // color.bgSurface, resting
  await button.hover();
  await expect(button).toHaveCSS('background-color', 'rgb(241, 245, 249)'); // color.bgSubtle
});

test('the notification button shows a distinct :active border', async ({ page }) => {
  await page.goto('/#examples');
  const button = page.getByRole('button', { name: 'Notifications, 3 unread', exact: true });
  const box = await button.boundingBox();
  if (!box) throw new Error('Notifications button not found');

  await expect(button).toHaveCSS('border-color', 'rgb(226, 232, 240)'); // color.border, resting

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(button).toHaveCSS('border-color', 'rgb(203, 213, 225)'); // color.borderStrong
  await page.mouse.up();
});

test('the notification button shows the shared focus-visible ring', async ({ page }) => {
  await page.goto('/#examples');
  const button = page.getByRole('button', { name: 'Notifications, 3 unread', exact: true });

  await expect(button).toHaveCSS('outline-width', '0px');
  await button.focus();
  await expect(button).toHaveCSS('outline-width', '2px');
  await expect(button).toHaveCSS('outline-style', 'solid');
  await expect(button).toHaveCSS('outline-color', 'rgb(0, 87, 184)'); // color.focusRing
  await expect(button).toHaveCSS('outline-offset', '2px');
});
