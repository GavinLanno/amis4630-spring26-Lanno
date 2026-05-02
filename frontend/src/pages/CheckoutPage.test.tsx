import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { placeOrder } from '../services/ordersService';
import CheckoutPage from './CheckoutPage';

const mockCartState = {
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
};

const mockClearCart = vi.fn(async () => {
  mockCartState.items = [];
  return true;
});

const mockNavigate = vi.fn();

vi.mock('../contexts/CartContext', () => ({
  useCartContext: () => ({
    state: mockCartState,
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
    Navigate: ({ to }: { to: string }) => <div data-testid="redirect-target">{to}</div>,
    useNavigate: () => mockNavigate,
  };
});

describe('CheckoutPage', () => {
  beforeEach(() => {
    mockCartState.items = [
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
    ];

    mockCartState.isSyncing = false;
    mockClearCart.mockClear();
    mockNavigate.mockClear();
    vi.mocked(placeOrder).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('keeps the confirmation navigation flow active after a successful submit clears the cart', async () => {
    vi.mocked(placeOrder).mockResolvedValueOnce({
      id: 42,
      confirmationNumber: 'BUCKEYE-42',
      createdAtUtc: '2026-05-01T12:00:00Z',
      status: 'Pending',
      totalAmount: 900,
      shippingAddress: {
        fullName: 'Buckeye Buyer',
        addressLine1: '123 College Ave',
        city: 'Columbus',
        stateProvince: 'OH',
        postalCode: '43210',
        country: 'USA',
        phoneNumber: '614-555-1234',
      },
      items: [],
    });

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
      target: { value: '43210' },
    });
    fireEvent.change(screen.getByLabelText('Shipping country'), {
      target: { value: 'USA' },
    });
    fireEvent.change(screen.getByLabelText('Shipping phone number'), {
      target: { value: '614-555-1234' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Place order' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/orders/confirmation/42', {
        replace: true,
        state: {
          order: expect.objectContaining({
            id: 42,
            confirmationNumber: 'BUCKEYE-42',
          }),
        },
      });
    });

    await waitFor(() => {
      expect(mockClearCart).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByTestId('redirect-target')).toBeNull();
  });

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
