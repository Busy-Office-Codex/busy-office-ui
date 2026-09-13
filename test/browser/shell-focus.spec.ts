import { expect, test, type Page } from '@playwright/test';

const paletteSearch = (page: Page) => page.getByPlaceholder('Search records, run actions, jump to pages…');

test('command trigger opens with native Enter and Space and focuses palette search', async ({ page }) => {
  await page.goto('/#examples');
  const trigger = page.getByRole('button', { name: 'Open command palette', exact: true });
  const search = paletteSearch(page);

  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(search).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();

  await trigger.focus();
  await page.keyboard.press('Space');
  await expect(search).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('shortcuts preserve the original page-input opener and its value', async ({ page }) => {
  await page.goto('/#examples');
  const pageInput = page.getByPlaceholder('Search vendor or PO number...');
  const search = paletteSearch(page);

  await pageInput.fill('Alden');
  await page.keyboard.press('Control+k');
  await expect(search).toBeFocused();
  await page.keyboard.press('Control+k');
  await expect(search).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(pageInput).toBeFocused();
  await expect(pageInput).toHaveValue('Alden');

  await page.keyboard.press('Meta+k');
  await expect(search).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(pageInput).toBeFocused();
  await expect(pageInput).toHaveValue('Alden');
});

test('close button and backdrop restore focus and allow reopening', async ({ page }) => {
  await page.goto('/#examples');
  const trigger = page.getByRole('button', { name: 'Open command palette', exact: true });
  const search = paletteSearch(page);

  await trigger.click();
  await expect(search).toBeFocused();
  await page.getByRole('button', { name: 'Close command palette', exact: true }).click();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(search).toBeFocused();
  await page.getByTestId('command-palette-backdrop').click({ position: { x: 8, y: 8 } });
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(search).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('a queued close callback cannot clear the opener captured by an immediate reopen', async ({ page }) => {
  await page.addInitScript(() => {
    const callbacks: FrameRequestCallback[] = [];
    window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return callbacks.length;
    }) as typeof window.requestAnimationFrame;
    (window as typeof window & { flushFocusFrames: () => void }).flushFocusFrames = () => {
      const queued = callbacks.splice(0);
      queued.forEach((callback) => callback(performance.now()));
    };
  });
  await page.goto('/#examples');
  const pageInput = page.getByPlaceholder('Search vendor or PO number...');
  const trigger = page.getByRole('button', { name: 'Open command palette', exact: true });
  const search = paletteSearch(page);

  await pageInput.focus();
  await page.keyboard.press('Control+k');
  await expect(search).toBeFocused();
  await page.keyboard.press('Escape');
  await trigger.click();
  await expect(search).toBeFocused();
  await page.evaluate(() => (window as typeof window & { flushFocusFrames: () => void }).flushFocusFrames());

  await page.keyboard.press('Escape');
  await page.evaluate(() => (window as typeof window & { flushFocusFrames: () => void }).flushFocusFrames());
  await expect(trigger).toBeFocused();
});
