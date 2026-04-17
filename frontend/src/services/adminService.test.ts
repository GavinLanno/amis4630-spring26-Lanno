import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createListing,
  deleteListing,
  fetchAllOrders,
  fetchAdminListings,
  updateOrderStatus,
} from './adminService';

vi.mock('./authStorage', () => ({
  getValidAccessToken: vi.fn(() => 'token-123'),
}));

describe('adminService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps admin listing payloads', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 2,
            address: '123 High Street',
            description: 'Listing',
            price: 350000,
            categoryName: 'House',
            sellerName: 'Admin',
            postedDate: '2026-04-17T12:00:00Z',
            imageURL: '/images/listings/admin.jpg',
          },
        ]),
        { status: 200 },
      ),
    );

    const listings = await fetchAdminListings();

    expect(listings).toHaveLength(1);
    expect(listings[0].category).toBe('House');
  });

  it('maps admin order payloads', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 12,
            confirmationNumber: 'BSL-20260417-000012',
            orderDateUtc: '2026-04-17T12:00:00Z',
            status: 'Placed',
            total: 500,
            shippingAddress: '123 College Ave',
            items: [],
          },
        ]),
        { status: 200 },
      ),
    );

    const orders = await fetchAllOrders();

    expect(orders).toHaveLength(1);
    expect(orders[0].status).toBe('Placed');
  });

  it('sends status update payload and returns mapped order', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 4,
          confirmationNumber: 'BSL-20260417-000004',
          orderDateUtc: '2026-04-17T12:00:00Z',
          status: 'Shipped',
          total: 900,
          shippingAddress: '456 Main St',
          items: [],
        }),
        { status: 200 },
      ),
    );

    const updatedOrder = await updateOrderStatus(4, 'Shipped');

    expect(updatedOrder.status).toBe('Shipped');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/orders/4/status',
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('creates and deletes listing', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 10,
            address: 'Admin Ave',
            description: 'Created listing',
            price: 275000,
            categoryName: 'Condo',
            sellerName: 'Admin',
            postedDate: '2026-04-17T12:00:00Z',
            imageURL: '/images/listings/new.jpg',
          }),
          { status: 201 },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const created = await createListing({
      address: 'Admin Ave',
      description: 'Created listing',
      price: 275000,
      categoryId: 2,
      sellerName: 'Admin',
      imageURL: '/images/listings/new.jpg',
    });

    expect(created.id).toBe(10);

    await expect(deleteListing(10)).resolves.toBeUndefined();
  });
});