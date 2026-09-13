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

test('a filter Chip shows a visible focus-visible ring on keyboard focus', async ({ page }) => {
  await page.goto('/#examples');
  const chip = page.getByRole('button', { name: 'Mine · 6', exact: true });

  await expect(chip).toHaveCSS('outline-width', '0px');
  await chip.focus();
  await expect(chip).toHaveCSS('outline-width', '2px');
  await expect(chip).toHaveCSS('outline-style', 'solid');
});

test('Input placeholder text meets AA contrast, not the disabled/faded token', async ({ page }) => {
  await page.goto('/#examples');
  const input = page.getByPlaceholder('Search vendor or PO number...');
  await expect(input).toBeVisible();

  const placeholderColor = await input.evaluate((el) => {
    const style = window.getComputedStyle(el, '::placeholder');
    return style.color;
  });
  // color.textTertiary (#64748b) → rgb(100, 116, 139); color.textDisabled (#94a3b8, the regression
  // this guards against) → rgb(148, 163, 184).
  expect(placeholderColor).toBe('rgb(100, 116, 139)');
});
