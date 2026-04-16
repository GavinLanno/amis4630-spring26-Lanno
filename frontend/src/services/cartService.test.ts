import { describe, expect, it } from 'vitest';
import { mapCartResponse } from './cartService';

describe('mapCartResponse', () => {
  it('maps a backend cart response into the frontend snapshot shape', () => {
    const result = mapCartResponse({
      id: 12,
      cartItems: [
        {
          id: 4,
          listingId: 9,
          address: '123 Main St',
          imageURL: '/images/house.jpg',
          price: 450,
          categoryName: 'House',
          quantity: 2,
          lineTotal: 900,
        },
      ],
      cartTotal: 900,
    });

    expect(result.cartId).toBe(12);
    expect(result.sessionId).toBeNull();
    expect(result.items).toEqual([
      {
        id: 4,
        listingId: 9,
        listingName: '123 Main St',
        imageUrl: '/images/house.jpg',
        price: 450,
        categoryName: 'House',
        quantity: 2,
        lineTotal: 900,
      },
    ]);
  });

  it('maps non-positive cart ids to null and keeps absolute image URLs unchanged', () => {
    const result = mapCartResponse({
      id: 0,
      cartItems: [
        {
          id: 6,
          listingId: 10,
          address: '501 River Rd',
          imageURL: 'https://cdn.example.com/condo.jpg',
          price: 300,
          categoryName: 'Condo',
          quantity: 1,
          lineTotal: 300,
        },
      ],
      cartTotal: 300,
    });

    expect(result.cartId).toBeNull();
    expect(result.sessionId).toBeNull();
    expect(result.items[0].imageUrl).toBe('https://cdn.example.com/condo.jpg');
  });
});
