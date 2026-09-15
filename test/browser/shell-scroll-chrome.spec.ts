import { expect, test } from '@playwright/test';

// Owner-directed (2026-09-15): scrolling down into a page's content collapses the brand block and
// the whole app-strip row (leaving only the palette trigger and the host's `account` slot visible
// in the top bar) and hides the floating dock — freeing vertical space. Scrolling back up, or
// resting within a few pixels of the top, brings all three back. One `window.scrollY`-driven
// listener inside `Shell` (`src/shell/Shell.tsx`) drives all three surfaces together; there is no
// prop for this — it's unconditional Shell behavior, matching every host. Each collapsed/hidden
// surface gets `aria-hidden` + `inert` (not `hidden`, which would kill its own transition by
// removing it from layout instantly) so it can't be tabbed into or announced while off-screen.
//
// The top bar and app-strip are `position: fixed` (like the dock already was) specifically so
// their own height/width animation never changes the document's total scroll height — an in-flow
// collapsing header does change it, which the browser then clamps the scroll position against,
// firing more 'scroll' events that re-trigger the same collapse logic in an infinite loop (caught
// live while writing this test: scrollY oscillated forever between ~266-300 for a single
// `scrollTo(0, 300)` call before the fixed-position fix). The content area reserves the full
// expanded header height as a *constant* `paddingTop: 96`, never animated, for the same reason.
//
// Locators below use raw `document.querySelector`/`evaluate` DOM queries, not Playwright's
// role-based locators: `getByRole` deliberately excludes `aria-hidden="true"` subtrees from
// matching (correct default accessibility-tree behavior), which makes it unusable for asserting
// the very `aria-hidden` state change this test needs to observe.
//
// Disclosed simplification: `account` (the host's own `+New`/notification-bell/avatar cluster,
// see examples/AppShell.tsx) is one opaque `ReactNode` slot — Shell has no way to know which part
// of it is "the profile icon" specifically, so the whole slot stays visible together rather than
// collapsing down to just an avatar.

// A short viewport forces real scrollable overflow on the default Purchase-orders page regardless
// of exact content height.
const SHORT_VIEWPORT = { width: 1280, height: 420 };

async function chromeState(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const dock = document.querySelector('[role="region"][aria-label="App dock"]');
    const stripButton = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Purchase orders');
    const brandText = Array.from(document.querySelectorAll('span')).find((s) => s.textContent?.trim() === 'Busy Office');
    return {
      dockAriaHidden: dock?.getAttribute('aria-hidden') ?? null,
      stripAriaHidden: stripButton?.closest('[aria-hidden]')?.getAttribute('aria-hidden') ?? null,
      brandAriaHidden: brandText?.closest('[aria-hidden]')?.getAttribute('aria-hidden') ?? null,
    };
  });
}

test('scrolling down past the dead zone collapses the brand, app strip and dock; scrolling back up expands them again', async ({ page }) => {
  await page.setViewportSize(SHORT_VIEWPORT);
  await page.goto('/#examples');

  // At the top: everything expanded — React renders `aria-hidden={false}` as the literal string
  // "false", not an omitted attribute, so that's what's asserted here (not `null`).
  await expect.poll(() => chromeState(page)).toEqual({ dockAriaHidden: 'false', stripAriaHidden: 'false', brandAriaHidden: 'false' });

  // Scroll well past the dead zone.
  await page.evaluate(() => window.scrollTo(0, 300));
  await expect.poll(() => chromeState(page)).toEqual({ dockAriaHidden: 'true', stripAriaHidden: 'true', brandAriaHidden: 'true' });

  // Scroll back up past the dead zone — expands again, even without returning all the way to 0.
  await page.evaluate(() => window.scrollTo(0, 100));
  await expect.poll(() => chromeState(page)).toEqual({ dockAriaHidden: 'false', stripAriaHidden: 'false', brandAriaHidden: 'false' });
});

test('resting at the top always keeps the chrome expanded, even after a tiny downward scroll under the dead zone', async ({ page }) => {
  await page.setViewportSize(SHORT_VIEWPORT);
  await page.goto('/#examples');

  // A scroll under the 8px dead zone should not flip anything.
  await page.evaluate(() => window.scrollTo(0, 3));
  await expect.poll(() => chromeState(page)).toEqual({ dockAriaHidden: 'false', stripAriaHidden: 'false', brandAriaHidden: 'false' });
});

test('a collapsed dock is genuinely inert, not just visually hidden — a direct focus() call cannot land inside it', async ({ page }) => {
  await page.setViewportSize(SHORT_VIEWPORT);
  await page.goto('/#examples');

  await page.evaluate(() => window.scrollTo(0, 300));
  await expect.poll(() => chromeState(page).then((s) => s.dockAriaHidden)).toBe('true');

  // `inert` removes focusability outright, regardless of an explicit .focus() call on a
  // descendant button — unlike `aria-hidden` alone, which doesn't prevent focus.
  const focusedAfterAttempt = await page.evaluate(() => {
    const launcherButton = document.querySelector<HTMLElement>('[aria-label="Open launcher"]');
    launcherButton?.focus();
    return document.activeElement === launcherButton;
  });
  expect(focusedAfterAttempt).toBe(false);
});
