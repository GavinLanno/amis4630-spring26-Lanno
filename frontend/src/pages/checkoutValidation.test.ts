import { describe, expect, it } from 'vitest';
import type { PlaceOrderInput } from '../types/order';
import { validateCheckoutForm } from './checkoutValidation';

function buildValidForm(overrides: Partial<PlaceOrderInput> = {}): PlaceOrderInput {
  return {
    fullName: 'Buckeye Buyer',
    addressLine1: '123 College Ave',
    city: 'Columbus',
    stateProvince: 'OH',
    postalCode: '43210',
    country: 'USA',
    phoneNumber: '614-555-1234',
    ...overrides,
  };
}

describe('validateCheckoutForm', () => {
  it('returns an error when full name is missing', () => {
    const result = validateCheckoutForm(buildValidForm({ fullName: '   ' }));

    expect(result).toBe('Full name is required.');
  });

  it('returns an error when postal code is not a valid US ZIP', () => {
    const result = validateCheckoutForm(buildValidForm({ postalCode: 'bad-zip' }));

    expect(result).toBe('Postal code must be a valid US ZIP code.');
  });

  it('returns an empty string for a valid form', () => {
    const result = validateCheckoutForm(buildValidForm());

    expect(result).toBe('');
  });
});
