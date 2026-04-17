import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchMyOrders, placeOrder } from './ordersService';

vi.mock('./authStorage', () => ({
  getValidAccessToken: vi.fn(() => 'token-123'),
}));

describe('ordersService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps placed order payload into frontend shape', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 42,
          confirmationNumber: 'BSL-20260417043001-000042',
          orderDateUtc: '2026-04-17T04:30:01Z',
          status: 'Placed',
          total: 999,
          shippingAddress: '123 College Ave, Columbus, OH 43210',
          items: [
            {
              id: 7,
              listingId: 3,
              address: '123 College Ave',
              imageURL: '/images/listings/test.jpg',
              categoryName: 'Apartment',
              price: 999,
              quantity: 1,
              lineTotal: 999,
            },
          ],
        }),
        { status: 201 },
      ),
    );

    const order = await placeOrder({
      fullName: 'Buckeye Buyer',
      addressLine1: '123 College Ave',
      city: 'Columbus',
      stateProvince: 'OH',
      postalCode: '43210',
      country: 'USA',
      phoneNumber: '614-555-1234',
    });

    expect(order.id).toBe(42);
    expect(order.items[0].imageUrl).toBe('/images/listings/test.jpg');
    expect(order.confirmationNumber.startsWith('BSL-')).toBe(true);
  });

  it('throws parsed message when place order fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ detail: 'Cart is empty' }),
        { status: 400 },
      ),
    );

    await expect(placeOrder({
      fullName: 'Buckeye Buyer',
      addressLine1: '123 College Ave',
      city: 'Columbus',
      stateProvince: 'OH',
      postalCode: '43210',
      country: 'USA',
      phoneNumber: '614-555-1234',
    })).rejects.toThrow('Cart is empty');
  });

  it('maps order history response into frontend shape', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 11,
            confirmationNumber: 'BSL-20260417043001-000011',
            orderDateUtc: '2026-04-17T04:30:01Z',
            status: 'Placed',
            total: 450,
            shippingAddress: '123 College Ave, Columbus, OH 43210',
            items: [],
          },
        ]),
        { status: 200 },
      ),
    );

    const history = await fetchMyOrders();

    expect(history).toHaveLength(1);
    expect(history[0].id).toBe(11);
    expect(history[0].status).toBe('Placed');
  });
});
