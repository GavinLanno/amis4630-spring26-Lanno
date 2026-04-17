import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import CheckoutPage from './CheckoutPage';

const mockClearCart = vi.fn(async () => true);
const mockNavigate = vi.fn();

vi.mock('../contexts/CartContext', () => ({
  useCartContext: () => ({
    state: {
      items: [
        {
          id: 1,
          listingId: 1,
          listingName: '123 College Ave',
          price: 900,
          quantity: 1,
          imageUrl: '/img.jpg',
          categoryName: 'Apartment',
          lineTotal: 900,
        },
      ],
      isSyncing: false,
    },
    cartTotal: 900,
    clearCart: mockClearCart,
  }),
}));

vi.mock('../services/ordersService', () => ({
  placeOrder: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CheckoutPage', () => {
  it('shows validation error for invalid postal code before submit', async () => {
    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Shipping full name'), {
      target: { value: 'Buckeye Buyer' },
    });
    fireEvent.change(screen.getByLabelText('Shipping address line 1'), {
      target: { value: '123 College Ave' },
    });
    fireEvent.change(screen.getByLabelText('Shipping city'), {
      target: { value: 'Columbus' },
    });
    fireEvent.change(screen.getByLabelText('Shipping state or province'), {
      target: { value: 'OH' },
    });
    fireEvent.change(screen.getByLabelText('Shipping postal code'), {
      target: { value: 'bad-zip' },
    });
    fireEvent.change(screen.getByLabelText('Shipping country'), {
      target: { value: 'USA' },
    });
    fireEvent.change(screen.getByLabelText('Shipping phone number'), {
      target: { value: '614-555-1234' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Place order' }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Postal code must be a valid US ZIP code.');
  });
});
