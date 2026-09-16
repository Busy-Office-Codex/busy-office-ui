import { expect, test } from '@playwright/test';

// ButtonGroup's own keyboard/roving-tabindex/disabled-skip contract (docs/ButtonGroup.md) — the
// Control Center's Density and Appearance segmented controls (examples/ControlCenter.tsx) are its
// real, enabled call sites, so most of these tests exercise it there rather than a synthetic
// harness. test/browser/control-center.spec.ts covers Control Center's own feature claims
// (Density re-themes the app, Appearance forces the real Theme component); this file covers the
// component contract. The one exception is the disabled-segment test below: wiring real Theme to
// Appearance (ROADMAP item 36's own disclosed follow-up, issue #19) made every Appearance segment
// a genuine, enabled option, leaving `option.disabled` with no real ButtonGroup consumer left
// anywhere in `examples/` — that test now uses `preview/ButtonGroupLab.tsx` instead (see its own
// header comment).

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
  // preview/ButtonGroupLab.tsx: 'Enabled' is the only enabled segment ('Skip 1'/'Skip 2' disabled
  // — see its own header comment for why this moved off Control Center's Appearance control).
  // Arrow-keying from 'Enabled' must stay on 'Enabled' rather than landing on a disabled segment.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/#button-group-lab');

  const enabled = page.getByRole('radio', { name: 'Enabled', exact: true });
  await enabled.click();
  await page.keyboard.press('ArrowRight');
  await expect(enabled).toBeFocused();
  await expect(enabled).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(enabled).toBeFocused();
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

  // Found live fixing this test for ROADMAP item 36's Theme-wiring: opening the panel
  // programmatically focuses "Light" (the panel's first enabled button — see
  // ControlCenter.tsx's own FOCUSABLE_SELECTOR comment — regardless of which segment is actually
  // selected), which now carries `tabIndex={-1}` since "System" is the selected Appearance segment
  // by default. Real Tab-key navigation (unlike that initial scripted focus) skips every
  // `tabindex={-1}` element, so pressing Tab from "Light" lands on the very next `tabIndex={0}`
  // stop in DOM order — "System" itself, not Density's "Comfortable" two groups later. Before
  // Dark/System were real (enabled) segments, they had no tab stop at all (`disabled` buttons are
  // removed from tab order entirely), so this same keystroke used to skip straight to Comfortable.
  const system = page.getByRole('radio', { name: 'System', exact: true });
  await page.keyboard.press('Tab');
  await expect(system).toBeFocused();
  await expect(system).toHaveCSS('outline-width', '2px');
  await expect(system).toHaveCSS('outline-style', 'solid');
});
