import { expect, test } from '@playwright/test';
import {
  adminCredentials,
  createOrderViaApi,
  login,
  snapshotStep,
  uniqueUserCredentials,
} from './test-helpers';

test('admin can create, update, and delete a listing and update order status', async ({ page, request }, testInfo) => {
  const shopper = uniqueUserCredentials('admin-order-user');
  const createdAddress = `QA Admin Listing ${Date.now()}`;
  const updatedAddress = `${createdAddress} Updated`;
  let confirmationNumber = '';

  await test.step('1) Create an order as a standard user so admin has live order data', async () => {
    confirmationNumber = await createOrderViaApi(request, shopper, 'Admin QA Shopper');
  });

  await test.step('2) Log in as admin and open the admin dashboard', async () => {
    await login(page, adminCredentials);
    await page.getByRole('link', { name: 'Open the admin page' }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
    await snapshotStep(page, testInfo, 'admin-dashboard');
  });

  await test.step('3) Create a listing in product management', async () => {
    await page.getByLabel('Listing address').fill(createdAddress);
    await page.getByLabel('Listing description').fill('Admin QA coverage listing');
    await page.getByLabel('Listing price').fill('199999');
    await page.getByLabel('Listing category').selectOption('2');
    await page.getByLabel('Listing seller name').fill('QA Seller');
    await page.getByLabel('Listing image URL').fill('/images/listings/denver-condo.jpg');
    await page.getByRole('button', { name: 'Create listing' }).click();

    await expect(page.getByText('Listing created successfully.')).toBeVisible();
    await expect(page.getByText(createdAddress)).toBeVisible();
    await snapshotStep(page, testInfo, 'admin-created-listing');
  });

  await test.step('4) Update the listing through the admin UI', async () => {
    await page.getByRole('button', { name: `Edit listing ${createdAddress}` }).click();
    await page.getByLabel('Listing address').fill(updatedAddress);
    await page.getByLabel('Listing price').fill('209999');
    await page.getByRole('button', { name: 'Update listing' }).click();

    await expect(page.getByText('Listing updated successfully.')).toBeVisible();
    await expect(page.getByText(updatedAddress)).toBeVisible();
    await snapshotStep(page, testInfo, 'admin-updated-listing');
  });

  await test.step('5) Update a live order status', async () => {
    const statusSelect = page.getByLabel(`Update status for order ${confirmationNumber}`);

    await expect(statusSelect).toBeVisible();
    await statusSelect.selectOption('Processing');
    await expect(statusSelect).toHaveValue('Processing');
    await snapshotStep(page, testInfo, 'admin-updated-order-status');
  });

  await test.step('6) Delete the listing and verify it disappears', async () => {
    await page.getByRole('button', { name: `Delete listing ${updatedAddress}` }).click();

    await expect(page.getByText('Listing removed from storefront.')).toBeVisible();
    await expect(page.getByText(updatedAddress)).toHaveCount(0);
    await snapshotStep(page, testInfo, 'admin-deleted-listing');
  });
});
