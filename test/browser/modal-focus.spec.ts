import { expect, test, type Page } from '@playwright/test';

async function openRejectModal(page: Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Sales', exact: true }).click();
  // The page trigger precedes the modal in DOM order, so .first() resolves to it whether or not the dialog is open.
  const trigger = page.getByRole('button', { name: 'Reject', exact: true }).first();
  await trigger.click();
  return trigger;
}

test('reject modal exposes dialog semantics and moves focus inside on open', async ({ page }) => {
  await openRejectModal(page);
  const dialog = page.getByRole('dialog', { name: 'Reject SO-1042?' });
  await expect(dialog).toBeVisible();
  await expect(page.getByPlaceholder('Required for a rejection')).toBeFocused();
});

test('Tab and Shift+Tab wrap focus within the modal instead of escaping it', async ({ page }) => {
  await openRejectModal(page);
  const comment = page.getByPlaceholder('Required for a rejection');
  const cancel = page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true });
  const reject = page.getByRole('dialog').getByRole('button', { name: 'Reject', exact: true });

  await expect(comment).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(reject).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(comment).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(cancel).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(reject).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(comment).toBeFocused();
});

test('Escape and backdrop dismissal restore focus to the opening trigger', async ({ page }) => {
  const trigger = await openRejectModal(page);
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('reject modal remains keyboard-operable at narrow viewport widths', async ({ page }) => {
  await page.setViewportSize({ width: 380, height: 720 });
  const trigger = await openRejectModal(page);
  const dialog = page.getByRole('dialog', { name: 'Reject SO-1042?' });
  await expect(dialog).toBeVisible();
  await expect(page.getByPlaceholder('Required for a rejection')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
