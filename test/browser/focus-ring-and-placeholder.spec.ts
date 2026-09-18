import { expect, test } from '@playwright/test';

// The Dashboard route only became reachable in the preview once wired into preview/client.tsx's
// route table; it's the only place an interactive Card exists to exercise its focus ring on.
async function gotoDashboard(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Dashboards\b/ }).click();
}

const UNSELECTED_BORDER = 'rgb(226, 232, 240)'; // color.border
const SELECTED_BORDER = 'rgb(0, 87, 184)'; // color.accent

test('an interactive Card shows a visible focus-visible ring', async ({ page }) => {
  await gotoDashboard(page);
  const openOrdersCard = page.getByRole('button', { name: /OPEN ORDERS/ });
  const approvalsCard = page.getByRole('button', { name: /PENDING APPROVALS/ });

  // A div[role="button"] only matches :focus-visible on genuine keyboard focus, not a scripted
  // .focus() call — click the prior card with the mouse, then Tab (a real keyboard event) onto
  // the next one, exactly as a keyboard user would.
  await openOrdersCard.click();
  await expect(approvalsCard).toHaveCSS('outline-width', '0px');
  await page.keyboard.press('Tab');
  await expect(approvalsCard).toBeFocused();
  await expect(approvalsCard).toHaveCSS('outline-width', '2px');
  await expect(approvalsCard).toHaveCSS('outline-style', 'solid');
});

test('Enter and Space activate an interactive Card the same way a click does', async ({ page }) => {
  await gotoDashboard(page);
  const approvalsCard = page.getByRole('button', { name: /PENDING APPROVALS/ });
  const overdueCard = page.getByRole('button', { name: /OVERDUE INVOICES/ });

  await expect(approvalsCard).toHaveCSS('border-top-color', UNSELECTED_BORDER);
  await approvalsCard.focus();
  await page.keyboard.press('Enter');
  await expect(approvalsCard).toHaveCSS('border-top-color', SELECTED_BORDER);

  await expect(overdueCard).toHaveCSS('border-top-color', UNSELECTED_BORDER);
  await overdueCard.focus();
  await page.keyboard.press(' ');
  await expect(overdueCard).toHaveCSS('border-top-color', SELECTED_BORDER);
  // Selecting a new card deselects the previous one (single-select KPI strip).
  await expect(approvalsCard).toHaveCSS('border-top-color', UNSELECTED_BORDER);
});

// ListReport's filter Chips were removed in the "14 · Purchase order" rebuild (Claude Design
// project "Busy Office Design System") in favor of four Dropdown filters — its trigger is the
// same small pill-shaped control shape a filter Chip was, and shares the same
// outline/:focus-visible styling contract, so it proves the same property.
test('a Dropdown filter trigger shows a visible focus-visible ring on keyboard focus', async ({ page }) => {
  await page.goto('/#examples');
  const trigger = page.getByRole('button', { name: /^Supplier/ });

  await expect(trigger).toHaveCSS('outline-width', '0px');
  await trigger.focus();
  await expect(trigger).toHaveCSS('outline-width', '2px');
  await expect(trigger).toHaveCSS('outline-style', 'solid');
});

// M10 Button scoring (issue #24) found Button's own focus-visible outline (Button.tsx's
// `outlineColor`/`outlineWidth` `:focus-visible` pair) had no live check anywhere — claimed in
// code, never actually verified in a real browser, the same "never actually checked" gap class
// Input had before its own M10 pilot fix.
test('a real Button shows a visible focus-visible ring on keyboard focus', async ({ page }) => {
  await page.goto('/#examples');
  const newPoButton = page.getByRole('button', { name: '+ New PO', exact: true });

  await expect(newPoButton).toHaveCSS('outline-width', '0px');
  await newPoButton.focus();
  await expect(newPoButton).toHaveCSS('outline-width', '2px');
  await expect(newPoButton).toHaveCSS('outline-style', 'solid');
});

// M10 Chip scoring (issue #24): filter Chip's own `:focus-visible` outline (Chip.tsx) is defined
// in code, but no test anywhere asserted it live — grepped every test/browser/*.spec.ts and
// test/*.test.ts for "Chip" first; the real hits (state-channels.test.ts, color-contrast.test.ts,
// components.test.ts) check `selected`/tone/contrast, never a rendered focus ring. Shell's own
// command-palette category row (`src/shell/Shell.tsx`) is a real, live filter Chip consumer.
test('a filter Chip shows a visible focus-visible ring on keyboard focus', async ({ page }) => {
  await page.goto('/#examples');
  // A bare scripted `.focus()` right after a real mouse click (opening the palette) doesn't
  // reliably trigger `:focus-visible` in Chromium — confirmed live, the same caveat Table's own
  // fix documented: what matters is genuine keyboard-caused focus, not just "is this a native
  // button." The search input auto-focuses on open; 3 real Tab presses reach "Actions" (search →
  // Close → "All" → "Actions"), confirmed via the actual DOM tab order, not assumed.
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  const actionsChip = page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: 'Actions', exact: true });

  await expect(actionsChip).toHaveCSS('outline-width', '0px');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(actionsChip).toBeFocused();
  await expect(actionsChip).toHaveCSS('outline-width', '2px');
  await expect(actionsChip).toHaveCSS('outline-style', 'solid');
});

test('Input placeholder text meets AA contrast, not the disabled/faded token', async ({ page }) => {
  await page.goto('/#examples');
  const input = page.getByPlaceholder('Search POs…');
  await expect(input).toBeVisible();

  const placeholderColor = await input.evaluate((el) => {
    const style = window.getComputedStyle(el, '::placeholder');
    return style.color;
  });
  // color.textTertiary (#64748b) → rgb(100, 116, 139); color.textDisabled (#94a3b8, the regression
  // this guards against) → rgb(148, 163, 184).
  expect(placeholderColor).toBe('rgb(100, 116, 139)');
});
