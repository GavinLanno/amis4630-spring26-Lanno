import { describe, expect, it } from 'vitest';
import { cartReducer, initialCartState } from './cartReducer';

describe('cartReducer', () => {
  it('handles LOAD_CART_SUCCESS by replacing items and turning off loading/sync flags', () => {
    const state = {
      ...initialCartState,
      isLoading: true,
      isSyncing: true,
      errorMessage: 'previous error',
    };

    const result = cartReducer(state, {
      type: 'LOAD_CART_SUCCESS',
      payload: {
        cartId: 42,
        items: [
          {
            id: 10,
            listingId: 10,
            listingName: '123 Main St',
            price: 500,
            quantity: 2,
            imageUrl: '/x.jpg',
            categoryName: 'House',
            lineTotal: 1000,
          },
        ],
      },
    });

    expect(result.cartId).toBe(42);
    expect(result.items).toHaveLength(1);
    expect(result.isLoading).toBe(false);
    expect(result.isSyncing).toBe(false);
    expect(result.errorMessage).toBe('');
  });

  it('handles APPLY_OPTIMISTIC_CART by setting syncing true and preserving optimistic items', () => {
    const result = cartReducer(initialCartState, {
      type: 'APPLY_OPTIMISTIC_CART',
      payload: {
        cartId: 3,
        items: [
          {
            id: 7,
            listingId: 7,
            listingName: 'Optimistic Listing',
            price: 125,
            quantity: 1,
            imageUrl: '/optimistic.jpg',
            categoryName: 'Condo',
            lineTotal: 125,
          },
        ],
      },
    });

    expect(result.cartId).toBe(3);
    expect(result.items[0].listingName).toBe('Optimistic Listing');
    expect(result.isSyncing).toBe(true);
    expect(result.errorMessage).toBe('');
  });

  it('handles SYNC_CART_FAILURE by rolling back to snapshot and preserving error message', () => {
    const state = {
      ...initialCartState,
      cartId: 999,
      items: [
        {
          id: 99,
          listingId: 99,
          listingName: 'Optimistic Stale Item',
          price: 1,
          quantity: 99,
          imageUrl: '/stale.jpg',
          categoryName: 'Apartment',
          lineTotal: 99,
        },
      ],
      isSyncing: true,
      isLoading: false,
    };

    const result = cartReducer(state, {
      type: 'SYNC_CART_FAILURE',
      payload: {
        message: 'Could not add item.',
        snapshot: {
          cartId: 5,
          items: [
            {
              id: 1,
              listingId: 1,
              listingName: 'Persisted Item',
              price: 200,
              quantity: 2,
              imageUrl: '/persisted.jpg',
              categoryName: 'House',
              lineTotal: 400,
            },
          ],
        },
      },
    });

    expect(result.cartId).toBe(5);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].listingName).toBe('Persisted Item');
    expect(result.isSyncing).toBe(false);
    expect(result.errorMessage).toBe('Could not add item.');
  });
});
