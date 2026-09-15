import { expect, test } from '@playwright/test';

// M7 Slice 7 (Distribution) — Delivery.tsx upgraded from a static M6 sample to a connected
// screen: `appActions.advanceDeliveryStatus` already existed in the shared store since Slice 1
// but had no screen calling it until now. Covers the brief's named Distribution sub-screens
// (picking, packing, shipment, delivery confirmation) as one real lifecycle on one record.
async function gotoDelivery(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Delivery\b/ }).click();
}

test('lists every seeded delivery with its real order, customer, and carrier', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoDelivery(page);

  await expect(page.getByRole('row', { name: /DL-3101.*SO-1042.*Northwind Traders.*FreightLine Express.*Delivered/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /DL-3102.*SO-1043.*Bluepeak Logistics.*Regional Courier Co\..*Pending/ })).toBeVisible();
});

test('the detail panel shows the real customer billing address and line items, not placeholder text', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoDelivery(page);

  await page.getByRole('row', { name: /DL-3102/ }).click();
  await expect(page.getByRole('heading', { name: 'DL-3102', exact: true })).toBeVisible();
  await expect(page.getByText('1180 Freightway Dr, Suite 400')).toBeVisible();
  await expect(page.getByText('Newark, NJ 07105')).toBeVisible();
  await expect(page.getByText('1 × On-site admin training (2-day)')).toBeVisible();
});

test('the full lifecycle — pending through delivered — is four real, independently visible state transitions, then the action honestly disappears', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoDelivery(page);

  await page.getByRole('row', { name: /DL-3102/ }).click();

  await page.getByRole('button', { name: 'Advance to Picking' }).click();
  await expect(page.getByRole('row', { name: /DL-3102.*Picking/ })).toBeVisible();

  await page.getByRole('button', { name: 'Advance to Packed' }).click();
  await expect(page.getByRole('row', { name: /DL-3102.*Packed/ })).toBeVisible();

  await page.getByRole('button', { name: 'Advance to Shipped' }).click();
  await expect(page.getByRole('row', { name: /DL-3102.*Shipped/ })).toBeVisible();

  await page.getByRole('button', { name: 'Advance to Delivered' }).click();
  await expect(page.getByRole('row', { name: /DL-3102.*Delivered/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Advance to/ })).toHaveCount(0);
});
