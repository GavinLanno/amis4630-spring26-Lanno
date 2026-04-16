import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartBadge } from './CartBadge';
import { useCartContext } from '../../contexts/CartContext';

vi.mock('../../contexts/CartContext', () => ({
  useCartContext: vi.fn(),
}));

const mockedUseCartContext = vi.mocked(useCartContext);

describe('CartBadge', () => {
  beforeEach(() => {
    mockedUseCartContext.mockReset();
  });

  it('renders a loading aria-label and placeholder count while cart is loading', () => {
    mockedUseCartContext.mockReturnValue({
      state: {
        cartId: null,
        items: [],
        isLoading: true,
        isSyncing: false,
        errorMessage: '',
      },
      cartItemCount: 0,
      cartTotal: 0,
      addToCart: vi.fn(),
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <MemoryRouter>
        <CartBadge />
      </MemoryRouter>,
    );

    const cartLink = screen.getByRole('link', {
      name: 'Shopping cart is loading',
    });

    expect(cartLink.textContent).toContain('Considerations (...)');
    expect(cartLink.getAttribute('href')).toBe('/cart');
  });

  it('renders the current item count when loading is complete', () => {
    mockedUseCartContext.mockReturnValue({
      state: {
        cartId: 3,
        items: [],
        isLoading: false,
        isSyncing: false,
        errorMessage: '',
      },
      cartItemCount: 5,
      cartTotal: 2500,
      addToCart: vi.fn(),
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <MemoryRouter>
        <CartBadge />
      </MemoryRouter>,
    );

    const cartLink = screen.getByRole('link', {
      name: 'Shopping cart with 5 items',
    });

    expect(cartLink.textContent).toContain('Considerations (5)');
  });
});
