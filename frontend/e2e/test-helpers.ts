import { expect, type APIRequestContext, type Page, type TestInfo } from '@playwright/test';

export const adminCredentials = {
  userId: 'admin',
  password: 'AdminPass1',
};

export interface UserCredentials {
  userId: string;
  email: string;
  password: string;
}

interface TokenResponse {
  accessToken: string;
}

interface ListingResponse {
  id: number;
}

interface OrderResponse {
  confirmationNumber: string;
}

export function uniqueUserCredentials(prefix: string): UserCredentials {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const userId = `${prefix}-${uniqueSuffix}`;

  return {
    userId,
    email: `${userId}@example.com`,
    password: 'BuckeyePass1',
  };
}

export async function snapshotStep(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const safeProjectName = testInfo.project.name.replace(/[^a-z0-9-]/gi, '-').toLowerCase();

  await page.screenshot({
    path: `test-results/e2e-snapshots/${safeProjectName}-${name}.png`,
    fullPage: true,
  });
}

export async function registerUser(page: Page, credentials: UserCredentials): Promise<void> {
  await page.goto('/auth');
  await page.getByRole('button', { name: 'Switch to register' }).click();
  await page.getByLabel('User ID').fill(credentials.userId);
  await page.getByLabel('Email').fill(credentials.email);
  await page.getByLabel('Password', { exact: true }).fill(credentials.password);
  await page.getByLabel('Confirm password').fill(credentials.password);
  await page.getByRole('button', { name: 'Create a new account' }).click();
  await expect(page.getByText('Account created. Sign in with your new credentials.')).toBeVisible();
}

export async function login(page: Page, credentials: Pick<UserCredentials, 'userId' | 'password'>): Promise<void> {
  await page.goto('/auth');
  await page.getByLabel('User ID').fill(credentials.userId);
  await page.getByLabel('Password', { exact: true }).fill(credentials.password);
  await page.getByRole('button', { name: 'Sign in to your account' }).click();
  await expect(page).toHaveURL(/\/$/);
}

export async function logout(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Log out of your account' }).click();
  await expect(page.getByRole('link', { name: 'Open login and registration page' })).toBeVisible();
}

export async function placeOrderFromFirstListing(
  page: Page,
  testInfo: TestInfo,
  shippingName: string,
): Promise<string> {
  await expect(page.getByRole('heading', { name: 'Available Properties' })).toBeVisible();
  await page.getByRole('button', { name: /Add .* to cart/i }).first().click();
  await page.getByRole('link', { name: /Shopping cart/i }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await page.getByRole('button', { name: 'Proceed to checkout' }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  await page.getByLabel('Shipping full name').fill(shippingName);
  await page.getByLabel('Shipping address line 1').fill('123 College Ave');
  await page.getByLabel('Shipping city').fill('Columbus');
  await page.getByLabel('Shipping state or province').fill('OH');
  await page.getByLabel('Shipping postal code').fill('43210');
  await page.getByLabel('Shipping country').fill('USA');
  await page.getByLabel('Shipping phone number').fill('6145550101');

  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page).toHaveURL(/\/orders\/confirmation\//);

  const confirmationText = await page.locator('p', { hasText: 'Confirmation number' }).innerText();
  const confirmationNumber = confirmationText.match(/Confirmation number\s+(.+)$/i)?.[1]?.trim();

  expect(confirmationNumber).toBeTruthy();
  await snapshotStep(page, testInfo, `${shippingName}-order-confirmation`);

  return confirmationNumber!;
}

export async function createOrderViaApi(
  request: APIRequestContext,
  credentials: UserCredentials,
  shippingName: string,
): Promise<string> {
  const registerResponse = await request.post('http://127.0.0.1:7001/api/auth/register', {
    data: {
      userId: credentials.userId,
      email: credentials.email,
      password: credentials.password,
      role: 'User',
    },
  });

  expect(registerResponse.ok()).toBeTruthy();

  const tokenResponse = await request.post('http://127.0.0.1:7001/api/auth/token', {
    data: {
      userId: credentials.userId,
      password: credentials.password,
    },
  });

  expect(tokenResponse.ok()).toBeTruthy();

  const { accessToken } = (await tokenResponse.json()) as TokenResponse;

  const listingsResponse = await request.get('http://127.0.0.1:7001/api/listings');
  expect(listingsResponse.ok()).toBeTruthy();

  const listings = (await listingsResponse.json()) as ListingResponse[];
  const firstListing = listings[0];
  expect(firstListing).toBeTruthy();

  const cartResponse = await request.post('http://127.0.0.1:7001/api/cart', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      listingId: firstListing.id,
      quantity: 1,
    },
  });

  expect(cartResponse.ok()).toBeTruthy();

  const orderResponse = await request.post('http://127.0.0.1:7001/api/orders', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      fullName: shippingName,
      addressLine1: '123 College Ave',
      city: 'Columbus',
      stateProvince: 'OH',
      postalCode: '43210',
      country: 'USA',
      phoneNumber: '6145550101',
    },
  });

  expect(orderResponse.ok()).toBeTruthy();

  const order = (await orderResponse.json()) as OrderResponse;
  return order.confirmationNumber;
}
