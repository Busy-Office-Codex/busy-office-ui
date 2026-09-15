import { expect, test } from '@playwright/test';

// M7 Slice 8 (Entry/nav) — the standalone pre-shell screen family (password reset, account
// locked, session expired, access denied, 404), same `/#hash` standalone-mount precedent as the
// pre-existing `/#login`/`/#density-lab`. `preview/client.tsx`'s `App` component now watches
// `hashchange` so these can link to each other with real `<a href>`/`window.location.hash =`
// navigation instead of a one-shot `location.hash` check that never re-renders.

test('Login\'s "Forgot your password?" is a real link into the password-reset flow, not inert text', async ({ page }) => {
  await page.goto('/#login');

  await expect(page.getByRole('heading', { name: 'Busy Office', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Forgot your password?' }).click();

  await expect(page).toHaveURL(/#password-reset$/);
  await expect(page.getByRole('heading', { name: 'Reset your password', exact: true })).toBeVisible();
});

test('the password-reset flow is genuinely two real steps, not a static mockup', async ({ page }) => {
  await page.goto('/#password-reset');

  const sendButton = page.getByRole('button', { name: 'Send reset link' });
  await expect(sendButton).toBeDisabled();

  await page.getByLabel('Work email').fill('jordan.lee@busyoffice.example');
  await expect(sendButton).toBeEnabled();
  await sendButton.click();

  await expect(page.getByRole('heading', { name: 'Check your email', exact: true })).toBeVisible();
  await expect(page.getByText('jordan.lee@busyoffice.example')).toBeVisible();

  // Resend is a real, repeatable action — a fresh confirmation appears each time, not a
  // decorative button with no observable effect.
  await expect(page.getByText('Sent again.')).toHaveCount(0);
  await page.getByRole('button', { name: 'Resend link' }).click();
  await expect(page.getByText('Sent again.')).toBeVisible();

  await page.getByRole('button', { name: 'Back to sign in' }).click();
  await expect(page).toHaveURL(/#login$/);
});

test('account-locked shows the real lockout message and a working mailto contact link', async ({ page }) => {
  await page.goto('/#account-locked');

  await expect(page.getByRole('heading', { name: 'Account locked', exact: true })).toBeVisible();
  const contactLink = page.getByRole('link', { name: 'Contact your administrator' });
  await expect(contactLink).toHaveAttribute('href', /^mailto:/);

  await page.getByRole('button', { name: 'Back to sign in' }).click();
  await expect(page).toHaveURL(/#login$/);
});

test('session-expired and access-denied each show their real message and a working way back', async ({ page }) => {
  await page.goto('/#session-expired');
  await expect(page.getByRole('heading', { name: 'Session expired', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign in again' }).click();
  await expect(page).toHaveURL(/#login$/);

  await page.goto('/#access-denied');
  await expect(page.getByRole('heading', { name: "You don't have access", exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to sign in' }).click();
  await expect(page).toHaveURL(/#login$/);
});

test('404 shows a real not-found state and a working way back to the workspace', async ({ page }) => {
  await page.goto('/#404');

  await expect(page.getByText('404', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Page not found', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to workspace' }).click();

  // Back to workspace clears the hash entirely (falls through to the default sample host), not
  // just to another standalone screen.
  await expect(page.getByRole('button', { name: 'Purchase orders', exact: true })).toBeVisible();
});
