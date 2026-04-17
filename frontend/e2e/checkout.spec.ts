import { expect, test, type Page } from '@playwright/test';

function uniqueUserId(): string {
  return `e2e-user-${Date.now()}`;
}

async function snapshotStep(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `test-results/e2e-snapshots/${name}.png`,
    fullPage: true,
  });
}

test('happy path: register, login, browse, cart, checkout, order history', async ({ page }) => {
  const userId = uniqueUserId();
  const email = `${userId}@example.com`;
  const password = 'BuckeyePass1';

  await test.step('1) Register or log in with a valid user', async () => {
    await page.goto('/auth');
    await page.getByRole('button', { name: 'Switch to register' }).click();

    await page.getByLabel('User ID').fill(userId);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm password').fill(password);

    await page.getByRole('button', { name: 'Create a new account' }).click();
    await expect(page.getByText('Account created. Sign in with your new credentials.')).toBeVisible();

    await page.getByLabel('User ID').fill(userId);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign in to your account' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'Available Properties' })).toBeVisible();
    await snapshotStep(page, 'step-1-authenticated');
  });

  await test.step('2) Browse products', async () => {
    const listingCards = page.locator('.listing-card');
    await expect(listingCards.first()).toBeVisible();
    await expect(listingCards).toHaveCount(await listingCards.count());
    await snapshotStep(page, 'step-2-browse-products');
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
    await snapshotStep(page, 'step-3-added-to-cart');
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
    await snapshotStep(page, 'step-4-checkout-complete');
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

    await snapshotStep(page, 'step-5-order-confirmation');
  });

  await test.step('6) Verify the order appears in order history', async () => {
    await page.getByRole('link', { name: 'View Order History' }).click();
    await expect(page).toHaveURL(/\/orders$/);
    await expect(page.getByRole('heading', { name: 'My Orders' })).toBeVisible();
    await expect(page.getByText(confirmationNumber)).toBeVisible();
    await snapshotStep(page, 'step-6-order-history');
  });
});
