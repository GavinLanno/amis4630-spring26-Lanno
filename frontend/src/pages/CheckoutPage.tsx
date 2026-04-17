import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCartContext } from '../contexts/CartContext';
import { placeOrder } from '../services/ordersService';
import type { PlaceOrderInput } from '../types/order';
import { validateCheckoutForm } from './checkoutValidation';
import styles from './CheckoutPage.module.css';

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { state, cartTotal, clearCart } = useCartContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState<PlaceOrderInput>({
    fullName: '',
    addressLine1: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: 'USA',
    phoneNumber: '',
  });

  if (state.items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  function handleFieldChange(
    field: keyof PlaceOrderInput,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    const validationMessage = validateCheckoutForm(form);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await placeOrder({
        fullName: form.fullName.trim(),
        addressLine1: form.addressLine1.trim(),
        city: form.city.trim(),
        stateProvince: form.stateProvince.trim(),
        postalCode: form.postalCode.trim(),
        country: form.country.trim(),
        phoneNumber: form.phoneNumber.trim(),
      });

      await clearCart();

      navigate(`/orders/confirmation/${order.id}`, {
        replace: true,
        state: {
          order,
        },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Could not place your order right now.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.page} aria-labelledby="checkout-page-title">
      <header className={styles.header}>
        <h1 id="checkout-page-title" className={styles.title}>Checkout</h1>
        <p className={styles.subtitle}>
          Confirm your shipping details and finalize your order.
        </p>
      </header>

      <div className={styles.layout}>
        <form className={styles.formCard} onSubmit={(event) => void handleSubmit(event)}>
          <div className={styles.formGrid}>
            <label className={styles.inputGroup} htmlFor="shipping-full-name">
              <span className={styles.label}>Full Name</span>
              <input
                id="shipping-full-name"
                className={styles.input}
                value={form.fullName}
                onChange={(event) => handleFieldChange('fullName', event.target.value)}
                required
                aria-label="Shipping full name"
              />
            </label>

            <label className={styles.inputGroup} htmlFor="shipping-address-1">
              <span className={styles.label}>Address Line 1</span>
              <input
                id="shipping-address-1"
                className={styles.input}
                value={form.addressLine1}
                onChange={(event) => handleFieldChange('addressLine1', event.target.value)}
                required
                aria-label="Shipping address line 1"
              />
            </label>

            <label className={styles.inputGroup} htmlFor="shipping-city">
              <span className={styles.label}>City</span>
              <input
                id="shipping-city"
                className={styles.input}
                value={form.city}
                onChange={(event) => handleFieldChange('city', event.target.value)}
                required
                aria-label="Shipping city"
              />
            </label>

            <label className={styles.inputGroup} htmlFor="shipping-state">
              <span className={styles.label}>State / Province</span>
              <input
                id="shipping-state"
                className={styles.input}
                value={form.stateProvince}
                onChange={(event) => handleFieldChange('stateProvince', event.target.value)}
                required
                aria-label="Shipping state or province"
              />
            </label>

            <label className={styles.inputGroup} htmlFor="shipping-postal-code">
              <span className={styles.label}>Postal Code</span>
              <input
                id="shipping-postal-code"
                className={styles.input}
                value={form.postalCode}
                onChange={(event) => handleFieldChange('postalCode', event.target.value)}
                required
                aria-label="Shipping postal code"
              />
            </label>

            <label className={styles.inputGroup} htmlFor="shipping-country">
              <span className={styles.label}>Country</span>
              <input
                id="shipping-country"
                className={styles.input}
                value={form.country}
                onChange={(event) => handleFieldChange('country', event.target.value)}
                required
                aria-label="Shipping country"
              />
            </label>

            <label className={styles.inputGroup} htmlFor="shipping-phone-number">
              <span className={styles.label}>Phone Number</span>
              <input
                id="shipping-phone-number"
                className={styles.input}
                value={form.phoneNumber}
                onChange={(event) => handleFieldChange('phoneNumber', event.target.value)}
                required
                aria-label="Shipping phone number"
              />
            </label>
          </div>

          {errorMessage ? (
            <div className={styles.error} role="alert" aria-live="polite">
              {errorMessage}
            </div>
          ) : null}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate('/cart')}
              aria-label="Back to cart"
            >
              Back to Cart
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isSubmitting || state.isSyncing}
              aria-label="Place order"
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>

        <aside className={styles.summaryCard} aria-label="Order summary">
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          <ul className={styles.summaryList}>
            {state.items.map((item) => (
              <li key={item.id} className={styles.summaryItem}>
                <div>
                  <p className={styles.itemName}>{item.listingName}</p>
                  <p className={styles.itemMeta}>Qty {item.quantity}</p>
                </div>
                <p className={styles.itemPrice}>{formatCurrency(item.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <div className={styles.totalRow}>
            <span>Total</span>
            <strong>{formatCurrency(cartTotal)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default CheckoutPage;
