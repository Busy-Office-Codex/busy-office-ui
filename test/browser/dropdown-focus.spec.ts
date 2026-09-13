import { expect, test } from '@playwright/test';

// examples/ListReport.tsx renders a Dropdown labelled "Status · <current filter>"; it is the
// preview's default page, so no extra navigation is needed to reach it.

test('trigger exposes listbox semantics and opens/closes on click', async ({ page }) => {
  await page.goto('/#examples');
  const trigger = page.getByRole('button', { name: /^Status/ });

  await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible();
  await expect(page.getByRole('option', { name: 'All statuses' })).toHaveAttribute('aria-selected', 'true');

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(listbox).toBeHidden();
});

test('arrow keys move the highlight and Enter selects, updating the trigger label', async ({ page }) => {
  await page.goto('/#examples');
  const trigger = page.getByRole('button', { name: /^Status/ });

  await trigger.click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  const confirmedId = await page.getByRole('option', { name: 'Confirmed' }).getAttribute('id');
  await expect(page.getByRole('listbox')).toHaveAttribute('aria-activedescendant', confirmedId ?? '');
  await page.keyboard.press('Enter');

  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toHaveText(/Confirmed/);
  await expect(trigger).toBeFocused();
});

test('Escape closes without changing the selection and returns focus to the trigger', async ({ page }) => {
  await page.goto('/#examples');
  const trigger = page.getByRole('button', { name: /^Status/ });

  await trigger.click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Escape');

  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(trigger).toHaveText(/All statuses/);
  await expect(trigger).toBeFocused();
});

test('a click outside the menu closes it without selecting', async ({ page }) => {
  await page.goto('/#examples');
  const trigger = page.getByRole('button', { name: /^Status/ });

  await trigger.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.mouse.click(4, 4);

  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toHaveText(/All statuses/);
});

test('reopening the menu highlights the currently selected item', async ({ page }) => {
  await page.goto('/#examples');
  const trigger = page.getByRole('button', { name: /^Status/ });

  await trigger.click();
  await page.getByRole('option', { name: 'Overdue' }).click();
  await expect(trigger).toHaveText(/Overdue/);

  await trigger.click();
  await expect(page.getByRole('option', { name: 'Overdue' })).toHaveAttribute('aria-selected', 'true');
});
