import { expect, test } from '@playwright/test';

// ButtonGroup's own keyboard/roving-tabindex/disabled-skip contract (docs/ButtonGroup.md) — the
// Control Center's Density and Appearance segmented controls are its only real call site today
// (examples/ControlCenter.tsx), so these tests exercise it there rather than a synthetic harness.
// test/browser/control-center.spec.ts covers Control Center's own feature claims (Density
// re-themes the app, Appearance is honestly disabled); this file covers the component contract.

async function openControlCenter(page: import('@playwright/test').Page) {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Control center' }).click();
}

test('renders as a labelled radiogroup with exactly one checked radio', async ({ page }) => {
  await openControlCenter(page);

  const group = page.getByRole('radiogroup', { name: 'Density' });
  await expect(group).toBeVisible();

  const options = group.getByRole('radio');
  await expect(options).toHaveCount(3);
  await expect(page.getByRole('radio', { name: 'Comfortable', exact: true })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('radio', { name: 'Compact', exact: true })).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByRole('radio', { name: 'Spacious', exact: true })).toHaveAttribute('aria-checked', 'false');
});

test('clicking a segment selects it and only the selected segment is in the tab order', async ({ page }) => {
  await openControlCenter(page);

  const compact = page.getByRole('radio', { name: 'Compact', exact: true });
  const comfortable = page.getByRole('radio', { name: 'Comfortable', exact: true });

  await compact.click();
  await expect(compact).toHaveAttribute('aria-checked', 'true');
  await expect(compact).toBeFocused();
  await expect(compact).toHaveAttribute('tabindex', '0');
  await expect(comfortable).toHaveAttribute('aria-checked', 'false');
  await expect(comfortable).toHaveAttribute('tabindex', '-1');
});

test('ArrowRight/ArrowLeft move focus and selection together, wrapping at both ends', async ({ page }) => {
  await openControlCenter(page);

  const compact = page.getByRole('radio', { name: 'Compact', exact: true });
  const comfortable = page.getByRole('radio', { name: 'Comfortable', exact: true });
  const spacious = page.getByRole('radio', { name: 'Spacious', exact: true });

  await compact.click();
  await page.keyboard.press('ArrowRight');
  await expect(comfortable).toBeFocused();
  await expect(comfortable).toHaveAttribute('aria-checked', 'true');

  await page.keyboard.press('ArrowRight');
  await expect(spacious).toBeFocused();
  await expect(spacious).toHaveAttribute('aria-checked', 'true');

  await page.keyboard.press('ArrowRight'); // wraps past the last option
  await expect(compact).toBeFocused();
  await expect(compact).toHaveAttribute('aria-checked', 'true');

  await page.keyboard.press('ArrowLeft'); // wraps back past the first option
  await expect(spacious).toBeFocused();
  await expect(spacious).toHaveAttribute('aria-checked', 'true');
});

test('Home/End jump to the first/last option', async ({ page }) => {
  await openControlCenter(page);

  const compact = page.getByRole('radio', { name: 'Compact', exact: true });
  const spacious = page.getByRole('radio', { name: 'Spacious', exact: true });

  await compact.click();
  await page.keyboard.press('End');
  await expect(spacious).toBeFocused();
  await expect(spacious).toHaveAttribute('aria-checked', 'true');

  await page.keyboard.press('Home');
  await expect(compact).toBeFocused();
  await expect(compact).toHaveAttribute('aria-checked', 'true');
});

test('disabled segments are skipped by arrow-key navigation, not focused or selected', async ({ page }) => {
  await openControlCenter(page);

  // Appearance: Light is the only enabled segment (Dark/System disabled — see
  // test/browser/control-center.spec.ts). Arrow-keying from Light must stay on Light rather than
  // landing on a disabled segment.
  const light = page.getByRole('radio', { name: 'Light', exact: true });
  await light.click();
  await page.keyboard.press('ArrowRight');
  await expect(light).toBeFocused();
  await expect(light).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(light).toBeFocused();
});

test('a focused segment shows the shared focus-visible ring', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/#examples');

  // A native <button> only reliably matches :focus-visible on a genuine keyboard-driven focus
  // change — opening Control Center with a mouse click first (as `openControlCenter` above does)
  // leaves the browser's input-modality heuristic in "mouse" mode, so a later scripted `.focus()`
  // call on a segment doesn't count as focus-visible even though it's a real <button> (same
  // caveat test/browser/focus-ring-and-placeholder.spec.ts documents for an interactive Card).
  // Reaching the trigger via `.focus()` + a real Enter keypress keeps the whole chain in
  // keyboard mode, matching how a keyboard user would actually open this panel.
  const trigger = page.getByRole('button', { name: 'Control center' });
  await trigger.focus();
  await page.keyboard.press('Enter');

  const comfortable = page.getByRole('radio', { name: 'Comfortable', exact: true });
  await page.keyboard.press('Tab'); // Light (tabindex 0) -> Comfortable (tabindex 0, next group)
  await expect(comfortable).toBeFocused();
  await expect(comfortable).toHaveCSS('outline-width', '2px');
  await expect(comfortable).toHaveCSS('outline-style', 'solid');
});
