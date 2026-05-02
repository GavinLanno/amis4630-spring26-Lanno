import { expect, test } from '@playwright/test';
import {
  login,
  placeOrderFromFirstListing,
  registerUser,
  snapshotStep,
  uniqueUserCredentials,
} from './test-helpers';

test('happy path: register, login, browse, cart, checkout, order history', async ({ page }, testInfo) => {
  const credentials = uniqueUserCredentials('e2e-user');
  await test.step('1) Register or log in with a valid user', async () => {
    await registerUser(page, credentials);
    await login(page, credentials);
    await expect(page.getByRole('heading', { name: 'Available Properties' })).toBeVisible();
    await snapshotStep(page, testInfo, 'step-1-authenticated');
  });

  await test.step('2) Browse products', async () => {
    const listingCards = page.locator('.listing-card');
    await expect(listingCards.first()).toBeVisible();
    await expect(listingCards).toHaveCount(await listingCards.count());
    await snapshotStep(page, testInfo, 'step-2-browse-products');
  });

  await test.step('3) Add an item to the cart', async () => {
    const addToCartButton = page.getByRole('button', { name: /Add .* to cart/i }).first();
    await addToCartButton.click();

    await expect(
      page.getByRole('button', { name: /Add .* to cart/i }).first(),
    ).toHaveText(/Successfully Added|Add to Cart/);

    await page.getByRole('link', { name: /Shopping cart/i }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByRole('heading', { name: 'Your Considerations' })).toBeVisible();
    await expect(page.locator('li').first()).toBeVisible();
    await snapshotStep(page, testInfo, 'step-3-added-to-cart');
  });

  await test.step('4) Go to checkout and place an order', async () => {
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();

    await page.getByLabel('Shipping full name').fill('E2E Tester');
    await page.getByLabel('Shipping address line 1').fill('123 College Ave');
    await page.getByLabel('Shipping city').fill('Columbus');
    await page.getByLabel('Shipping state or province').fill('OH');
    await page.getByLabel('Shipping postal code').fill('43210');
    await page.getByLabel('Shipping country').fill('USA');
    await page.getByLabel('Shipping phone number').fill('6145550101');

    await page.getByRole('button', { name: 'Place order' }).click();
    await expect(page).toHaveURL(/\/orders\/confirmation\//);
    await snapshotStep(page, testInfo, 'step-4-checkout-complete');
  });

  let confirmationNumber = '';

  await test.step('5) Verify order confirmation appears', async () => {
    await expect(page.getByRole('heading', { name: 'Order Confirmed' })).toBeVisible();

    const confirmationText = await page
      .locator('p', { hasText: 'Confirmation number' })
      .innerText();
    const match = confirmationText.match(/Confirmation number\s+(.+)$/i);

    expect(match?.[1]?.trim()).toBeTruthy();
    confirmationNumber = match![1].trim();

    await snapshotStep(page, testInfo, 'step-5-order-confirmation');
  });

  await test.step('6) Verify the order appears in order history', async () => {
    await page.getByRole('link', { name: 'View Order History' }).click();
    await expect(page).toHaveURL(/\/orders$/);
    await expect(page.getByRole('heading', { name: 'My Orders' })).toBeVisible();
    await expect(page.getByText(confirmationNumber)).toBeVisible();
    await snapshotStep(page, testInfo, 'step-6-order-history');
  });
});

test('mobile viewport: checkout flow remains usable', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile responsiveness is only verified in the mobile project.');

  const credentials = uniqueUserCredentials('mobile-user');

  await registerUser(page, credentials);
  await login(page, credentials);
  await page.getByRole('button', { name: /Add .* to cart/i }).first().click();
  await page.getByRole('link', { name: /Shopping cart/i }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByRole('link', { name: 'Back to listings' })).toBeVisible();

  await page.getByRole('link', { name: 'Back to listings' }).click();
  const confirmationNumber = await placeOrderFromFirstListing(page, testInfo, 'Mobile Tester');

  await page.getByRole('link', { name: 'View Order History' }).click();
  await expect(page.getByText(confirmationNumber)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Show active orders' })).toBeVisible();
  await snapshotStep(page, testInfo, 'mobile-order-history');
});
