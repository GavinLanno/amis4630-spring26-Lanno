import type { PlaceOrderInput } from '../types/order';

export function validateCheckoutForm(form: PlaceOrderInput): string {
  if (!form.fullName.trim()) {
    return 'Full name is required.';
  }

  if (!form.addressLine1.trim()) {
    return 'Address line 1 is required.';
  }

  if (!form.city.trim()) {
    return 'City is required.';
  }

  if (!form.stateProvince.trim()) {
    return 'State or province is required.';
  }

  if (!/^\d{5}(-\d{4})?$/.test(form.postalCode.trim())) {
    return 'Postal code must be a valid US ZIP code.';
  }

  if (!form.country.trim()) {
    return 'Country is required.';
  }

  if (!/^[0-9()+\-\s]{7,30}$/.test(form.phoneNumber.trim())) {
    return 'Phone number must be 7 to 30 characters and use valid phone symbols.';
  }

  return '';
}
